# SCV Frontend

Cliente web de SCV (PWA) con HTML, CSS y JavaScript.

## Desarrollo local

```bash
python3 -m http.server 8080
```

En localhost el frontend consume API en `http://localhost:8000/api/v1`.

## Producción

- Dominio sugerido: `app.tudominio.com`
- El frontend asume API en el mismo host bajo `/api/v1`
- Si necesitas otro origen, define antes de `config.js`:

```html
<script>
  window.__SCV_API_ORIGIN = "https://api.tudominio.com";
</script>
```

## PWA

- Manifest: `manifest.json`
- Service worker: `sw.js`
- Registro SW: `js/pwa.js`

Para instalar en móvil:
1. Abrir la app en HTTPS
2. Agregar a pantalla de inicio
