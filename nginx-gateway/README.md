# 🛡️ SCV Nginx Gateway & Proxy Inverso

Puerta de enlace segura y enrutamiento perimetral para el **Sistema de Control Vehicular (SCV)**.

---

## 🔒 Características de Seguridad
* **Terminación SSL/TLS:** Soporte nativo para certificados emitidos por Let's Encrypt (Certbot).
* **Cabeceras de Protección HTTP:** HSTS, X-Frame-Options (anti-clickjacking), X-Content-Type-Options (nosniff), X-XSS-Protection.
* **Enrutamiento:** Redirige `/api/v1/*` y `/docs` hacia el contenedor `api-services:8000`, y el resto hacia `client-app:80`.
* **Compresión GZIP:** Optimización de carga para redes celulares lentas en patios industriales.
