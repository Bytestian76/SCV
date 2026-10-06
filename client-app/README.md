# 📱 SCV Client App (Frontend React + PWA)

Aplicación Web Progresiva (PWA) de interfaz de usuario para el **Sistema de Control Vehicular (SCV)** de **Comercializadora Normetales S.A.S.**

---

## 🎨 Principios de UI/UX Oficiales
* **Minimalismo Funcional:** Máxima área útil para visualización y captura de datos de patio y taller.
* **Tema Oscuro de Alto Contraste:** Reducción de fatiga visual y lectura óptima bajo luz solar y ambientes industriales.
* **Componentización:** Navegación fluida tipo SPA sin recargas de página.
* **PWA (Progressive Web App):** Instalable en dispositivos Android/iOS y escritorios sin requerir tiendas de aplicaciones.

---

## 🛠️ Tecnologías y Dependencias
* **Librería UI:** React 18
* **Herramienta de Construcción:** Vite 5
* **Iconografía:** Lucide React
* **Plugin PWA:** `vite-plugin-pwa`
* **Estilos:** CSS Tokens de diseño y utilidades responsive

---

## 📁 Estructura del Módulo
```text
client-app/
├── public/                 # Favicon, manifiesto PWA e iconos de instalación
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── dashboard/      # Tarjetas y gráficos del centro de mando
│   │   ├── layout/         # Header y Sidebar interactivo
│   │   └── modals/         # Modales de creación/edición de datos
│   ├── pages/              # Vistas principales del sistema por rol
│   ├── services/
│   │   └── api.js          # Cliente HTTP centralizado con token JWT
│   ├── App.jsx             # Enrutador y controlador de vista activa
│   ├── index.css           # Estilos globales y variables de alto contraste
│   └── main.jsx            # Punto de montaje de React en el DOM
├── index.html              # Shell HTML
├── package.json            # Scripts y dependencias npm
└── vite.config.js          # Configuración del bundler y PWA
```

---

## 🚀 Ejecución en Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm run dev

# Compilar para producción
npm run build
```
