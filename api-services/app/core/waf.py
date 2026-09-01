import re
import urllib.parse
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware

class WAFMiddleware(BaseHTTPMiddleware):
    """
    Middleware that acts as an application-level firewall (WAF)
    detecting SQL Injection, XSS, Path Traversal, and Command Injection.
    """

    # Malicious patterns to scan for (compiled regexes for performance)
    PATTERNS = [
        # Path Traversal: e.g. ../../etc/passwd
        re.compile(r"\.\./"),
        # XSS: <script>, javascript:..., onload/onerror events
        re.compile(r"<script.*?>", re.IGNORECASE),
        re.compile(r"javascript\s*:", re.IGNORECASE),
        re.compile(r"on(load|error|mouseover|click|focus)\s*=", re.IGNORECASE),
        # SQL Injection: UNION SELECT, OR 1=1, hex encoding, etc.
        re.compile(r"union\s+select", re.IGNORECASE),
        re.compile(r"union\s+all\s+select", re.IGNORECASE),
        re.compile(r"\s+or\s+\d+=\d+", re.IGNORECASE),
        re.compile(r"\s+or\s+['\"].*?['\"]=[\"'].*?[\"']", re.IGNORECASE),
        re.compile(r"select\s+.*?\s+from", re.IGNORECASE),
        re.compile(r";\s*drop\s+(table|database)", re.IGNORECASE),
        # Command Injection: common unix files or shell operators in params
        re.compile(r"/etc/passwd"),
        re.compile(r"(;|\||&&)\s*(cat|ls|pwd|whoami|sh|bash|curl|wget)\b", re.IGNORECASE),
    ]

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check path and query parameters
        path_decoded = urllib.parse.unquote(request.url.path)
        query_decoded = urllib.parse.unquote(str(request.url.query))

        # Check path, query string and headers for malicious payload
        for value in (path_decoded, query_decoded):
            if value and self._is_malicious(value):
                return Response(
                    content="Solicitud bloqueada por razones de seguridad (WAF)",
                    status_code=status.HTTP_403_FORBIDDEN,
                )

        # Optional: scan headers
        for name, value in request.headers.items():
            # Skip Authorization and other normal headers to avoid false positives, focus on User-Agent/Referer
            if name.lower() in ("user-agent", "referer", "x-forwarded-for"):
                if self._is_malicious(value):
                    return Response(
                        content="Cabecera bloqueada por razones de seguridad (WAF)",
                        status_code=status.HTTP_403_FORBIDDEN,
                    )

        # Proceed if clean
        return await call_next(request)

    def _is_malicious(self, val: str) -> bool:
        for pattern in self.PATTERNS:
            if pattern.search(val):
                return True
        return False
