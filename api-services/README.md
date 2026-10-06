# ⚙️ SCV API Backend (FastAPI + SQLAlchemy + Alembic)

Servicio Backend RESTful del **Sistema de Control Vehicular (SCV)** para **Comercializadora Normetales S.A.S.**

---

## 🛠️ Tecnologías Principales
* **Python:** 3.11+
* **Framework Web:** FastAPI (ASGI Uvicorn)
* **ORM:** SQLAlchemy 2.0 (modo declarativo tipado)
* **Migraciones de Base de Datos:** Alembic
* **Seguridad & Hashing:** Passlib, Bcrypt, Python-Jose (JWT HS256)
* **Firewall Integrado:** WAF Middleware (bloqueo en tiempo real de SQLi, XSS, Path Traversal)

---

## 📁 Estructura del Módulo
```text
api-services/
├── alembic/                # Historial y scripts de migración de base de datos
│   └── versions/           # Archivos de revisión versionados
├── app/
│   ├── api/
│   │   ├── deps.py         # Dependencias (get_db, require_role, get_current_user)
│   │   └── v1/
│   │       ├── api.py      # Router central de la versión 1
│   │       └── endpoints/  # Controladores REST por entidad
│   ├── core/
│   │   ├── config.py       # Pydantic Settings y variables de entorno
│   │   ├── security.py     # Bcrypt y utilidades JWT
│   │   ├── waf.py          # Middleware de Web Application Firewall
│   │   └── report_builder.py # Generador de reportes CSV/Excel
│   ├── db/
│   │   ├── base.py         # Declarative Base de SQLAlchemy
│   │   └── session.py      # Engine y SessionLocal
│   ├── models/             # Modelos de base de datos SQLAlchemy
│   └── schemas/            # Esquemas de validación Pydantic v2
├── alembic.ini             # Configuración de migraciones
├── Dockerfile              # Empaquetado de contenedor
├── main.py                 # Punto de entrada de la aplicación FastAPI
└── requirements.txt        # Dependencias de Python
```

---

## 🚀 Puesta en Marcha Local (Sin Docker)
```bash
# 1. Crear y activar entorno virtual
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Ejecutar migraciones
alembic upgrade head

# 5. Iniciar servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Acceso a documentación interactiva:
* **Swagger UI:** `http://localhost:8000/docs`
* **Redoc:** `http://localhost:8000/redoc`
