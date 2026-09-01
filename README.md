# 🚗 SCV - Sistema de Control Vehicular (Nueva Arquitectura)

---

## 📌 Descripción General
El **Sistema de Control Vehicular (SCV)** es una plataforma tecnológica integral para la administración, auditoría y control en tiempo real de operaciones de patio de carga, inspecciones preoperacionales y mantenimiento mecánico de flota vehicular.

---

## 🏗️ Estructura del Repositorio

```text
/scv-proyecto-raiz
├── /client-app            # Frontend SPA (React + PWA, Store, UI Minimalista Alto Contraste)
├── /api-services          # Backend REST (FastAPI, SQLAlchemy 2.0, Alembic, JWT, WAF)
├── /db-scripts            # DDL SQL y scripts de inicialización / semillas (PostgreSQL)
├── /nginx-gateway         # Proxy inverso Nginx, enrutamiento y seguridad WAF
├── docker-compose.yml     # Orquestación de contenedores y servicios
└── README.md
```

---

## 🚀 Puesta en Marcha con Docker

1. **Copiar variables de entorno:**
   ```bash
   cp api-services/.env.example api-services/.env
   ```

2. **Construir y levantar servicios:**
   ```bash
   docker compose up -d --build
   ```

3. **Ejecutar migraciones de base de datos con Alembic:**
   ```bash
   docker compose exec api-services alembic upgrade head
   ```

4. **Acceso:**
   * **Frontend:** `http://localhost`
   * **API Backend:** `http://localhost/api/v1`
