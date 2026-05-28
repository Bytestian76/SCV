# Deploy en hosting con dominio

Esta guía deja SCV listo para desplegar sin Docker en un servidor Linux estándar.

> Nota: para arquitectura con API Gateway centralizada y multiples subdominios en Docker,
> usar `infra/gateway/README.md` y los archivos `docker-compose.gateway.vps.yml` + `docker-compose.app.yml`.

## 1) Preparar backend

```bash
cd /opt/scv-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configura en `.env`:
- `SECRET_KEY` segura
- `CORS_ALLOWED_ORIGINS=https://app.tudominio.com`
- `DEBUG=False`
- `ENABLE_API_DOCS=False`
- `ENABLE_TEST_DB_ENDPOINT=False`

## 2) Registrar servicio systemd

Usa `deploy/systemd/scv-backend.service` como base y ajusta rutas/usuario.

```bash
sudo cp deploy/systemd/scv-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable scv-backend
sudo systemctl start scv-backend
sudo systemctl status scv-backend
```

## 3) Publicar frontend + reverse proxy

Usa `deploy/nginx/scv.conf` como base, ajusta dominio y ruta de `root`.

```bash
sudo cp deploy/nginx/scv.conf /etc/nginx/sites-available/scv.conf
sudo ln -s /etc/nginx/sites-available/scv.conf /etc/nginx/sites-enabled/scv.conf
sudo nginx -t
sudo systemctl reload nginx
```

## 4) HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d app.tudominio.com
```

## 5) Verificación

- `https://app.tudominio.com` carga frontend
- `https://app.tudominio.com/api/v1/auth/login` responde
- `https://app.tudominio.com/docs` devuelve `404`

## 6) Artefacto de release

Desde la raíz del workspace:

```bash
./scripts/build-release.sh
```

Esto crea `release/` con estructura limpia para subir al servidor.
