# SCV - Sistema de Control Vehicular

Backend API REST desarrollado con FastAPI (Python).

## Instalación

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar (Linux/Mac)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecución

```bash
# Servidor de desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Acceso local
# http://localhost:8000
# Documentación API: http://localhost:8000/docs
```

## Estructura del Proyecto

```
scv-backend/
├── app/
│   ├── api/          # Endpoints de la API
│   ├── core/        # Configuración central
│   ├── db/         # Base de datos
│   ├── models/      # Modelos SQLAlchemy
│   └── schemas/     # Schemas Pydantic
├── tests/           # Pruebas
├── requirements.txt
└── main.py         # Punto de entrada
```

## Roles de Usuario

- `admin` - Acceso total
- `operario_movimientos` - Registra entradas/salidas
- `operario_chequeo` - Realiza chequeos preoperacionales

## Documentación

Ver `../Documentacion/SCV_Endpoints_v1.md` para lista completa de endpoints.