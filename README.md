# 🚗 SCV - Sistema de Control Vehicular (Versión 2.0)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/Estado-Producci%C3%B3n%20Listo-success.svg)]()

> **Plataforma Tecnológica Integral para Comercializadora Normetales S.A.S.**  
> Automatización de operaciones de patio de acopio, pesaje por báscula, inspecciones de seguridad vial preoperacionales (PESV) y control de mantenimiento automotriz.

---

## 📑 Tabla de Contenidos
1. [Descripción General](#-descripción-general)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Estructura del Repositorio](#-estructura-del-repositorio)
4. [Roles y Matriz de Acceso](#-roles-y-matriz-de-acceso)
5. [Puesta en Marcha Rápida](#-puesta-en-marcha-rápida)
6. [Índice de Documentación Especializada](#-índice-de-documentación-especializada)
7. [Entrega de Prácticas y Autoría](#-entrega-de-prácticas-y-autoría)

---

## 📌 Descripción General

El **Sistema de Control Vehicular (SCV)** reemplaza las planillas en papel y los formularios sueltos de Google Forms por una solución centralizada, inmutable y disponible en tiempo real:
* **Logística de Báscula y Despacho:** Registro ágil de entradas, salidas, pesaje en kilogramos, sacas y condición del furgón.
* **Inspecciones Preoperacionales:** Lista de chequeo móvil de 45 ítems normativos. Si un componente falla, se rechaza la salida y se alerta al taller mecánico de inmediato.
* **Mantenimiento y Taller:** Emisión de Órdenes de Trabajo (OT), control de actividades técnicas, repuestos consumidos, costos y soporte fotográfico.
* **Centro de Mando Administrativo:** KPIs en vivo, gráficas horarias de flujo y reportes descargables en formato Excel/CSV.

---

## 🏛️ Arquitectura del Sistema

```mermaid
graph TD
    Client["📱 Navegadores / Dispositivos Móviles (PWA)"] -->|HTTP / HTTPS| Nginx["🛡️ NGINX Gateway & SSL Reverse Proxy"]
    
    subgraph DockerNet ["Red Contenerizada (Docker Compose)"]
        Nginx -->|/ (SPA)| Frontend["🎨 Frontend SPA (React 18 + Vite)"]
        Nginx -->|/api/v1 (REST)| Backend["⚙️ Backend API (FastAPI + WAF Middleware)"]
        Backend -->|TCP 5432| DB[("🗄️ PostgreSQL 16 Alpine")]
    end
```

---

## 🏗️ Estructura del Repositorio

```text
/
├── /api-services          # Backend RESTful (FastAPI, SQLAlchemy 2.0, Alembic, WAF)
├── /client-app            # Frontend SPA PWA (React 18, Vite, UI de Alto Contraste)
├── /db-scripts            # DDL oficial SQL y semillas de datos (PostgreSQL 16)
├── /nginx-gateway         # Proxy inverso Nginx, reglas WAF y configuración SSL
├── /docs                  # DOCUMENTACIÓN TÉCNICA Y OPERATIVA COMPLETA (6 Guías)
│   ├── 01_ARQUITECTURA.md
│   ├── 02_BASE_DE_DATOS.md
│   ├── 03_API_ENDPOINTS.md
│   ├── 04_MANUAL_USUARIO.md
│   ├── 05_GUIA_DESPLIEGUE_Y_DEVOPS.md
│   └── 06_ENTREGA_PRACTICAS_TRANSFERENCIA.md
├── docker-compose.yml     # Orquestación para desarrollo local
├── docker-compose.prod.yml# Orquestación blindada para servidores de producción
├── setup_vps.sh           # Asistente instalador automático 'Zero to Hero' en VPS
├── init-letsencrypt.sh    # Script de emisión inicial de certificados SSL Let's Encrypt
├── backup-db.sh           # Script de copias de seguridad automáticas de PostgreSQL
├── .env.example           # Plantilla de variables de entorno seguras
└── README.md              # Documento raíz de presentación
```

---

## 👥 Roles y Matriz de Acceso

| Rol | Correo Inicial de Prueba | Contraseña | Funciones Principales |
|---|---|---|---|
| **`admin`** | `admin@scv.local` | `admin123` | Control total, flota, usuarios, reportes globales y auditoría forense. |
| **`operario_movimientos`** | `despacho@scv.local` | `admin123` | Registro de entradas/salidas de patio, peso en báscula y sacas. |
| **`operario_chequeo`** | `carlos.chofer@scv.local` | `admin123` | Inspección preoperacional de seguridad vial diaria (45 ítems). |
| **`mecanico`** | `mecanico@scv.local` | `admin123` | Ejecución de tareas de taller, registro de repuestos y evidencias. |
| **`jefe_mecanicos`** | `jefe.taller@scv.local` | `admin123` | Diagnóstico de averías, emisión y cierre de Órdenes de Trabajo (OT). |

---

## 🚀 Puesta en Marcha Rápida

### Opción 1: Despliegue en la Nube / VPS (Producción Automática)
```bash
git clone https://github.com/Bytestian76/SCV.git
cd SCV
chmod +x setup_vps.sh
./setup_vps.sh
```

### Opción 2: Desarrollo Local con Docker Compose
```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar los 4 servicios
docker compose up -d --build

# 3. Aplicar migraciones
docker compose exec api-services alembic upgrade head
```
* **Frontend PWA:** `http://localhost`
* **API Backend:** `http://localhost/api/v1`
* **Documentación Swagger:** `http://localhost/docs`

---

## 📚 Índice de Documentación Especializada

La totalidad de los manuales y especificaciones técnicas se encuentran detallados en la carpeta [`/docs`](docs/):

1. 🏛️ **[01_ARQUITECTURA.md](docs/01_ARQUITECTURA.md):** Arquitectura por capas, diagramas C4/Mermaid, seguridad WAF, ciclo JWT y decisiones arquitectónicas (ADRs).
2. 🗄️ **[02_BASE_DE_DATOS.md](docs/02_BASE_DE_DATOS.md):** Diagrama Entidad-Relación (ERD), diccionario de datos completo de las 12 tablas, migraciones Alembic y política de backups.
3. 📡 **[03_API_ENDPOINTS.md](docs/03_API_ENDPOINTS.md):** Catálogo de endpoints REST, esquemas de entrada/salida JSON, códigos de respuesta HTTP y permisos por rol.
4. 📘 **[04_MANUAL_USUARIO.md](docs/04_MANUAL_USUARIO.md):** Manual de operación paso a paso para operarios, conductores, mecánicos y administradores + guía PWA.
5. 🚀 **[05_GUIA_DESPLIEGUE_Y_DEVOPS.md](docs/05_GUIA_DESPLIEGUE_Y_DEVOPS.md):** Guía de despliegue en VPS Linux, configuración DNS, certificados SSL Let's Encrypt y cronjobs.
6. 📋 **[06_ENTREGA_PRACTICAS_TRANSFERENCIA.md](docs/06_ENTREGA_PRACTICAS_TRANSFERENCIA.md):** Acta formal de entrega de etapa productiva SENA, inventario de software, matriz de requisitos y recomendaciones futuras.

---

## 🎓 Entrega de Prácticas y Autoría

* **Desarrollador / Practicante:** Jhoan Sebastian Prada Carrascal ([@Bytestian76](https://github.com/Bytestian76))
* **Institución Educativa:** Servicio Nacional de Aprendizaje (SENA)
* **Empresa Patrocinadora:** Comercializadora Normetales S.A.S.
* **Fecha:** Octubre de 2026
