# 🗄️ SCV Database Scripts (PostgreSQL 16)

Scripts de inicialización DDL y datos semilla (seeds) del **Sistema de Control Vehicular (SCV)**.

---

## 📁 Archivos Disponibles
* **`01_init_schema.sql`:** DDL oficial con la definición de las 12 tablas, claves primarias, claves foráneas, restricciones `CHECK`, índices y extensiones (`uuid-ossp`).
* **`02_seed_initial_data.sql`:** Usuarios iniciales con roles segregados (claves cifradas con bcrypt) y vehículos maestros para pruebas inmediatas.

---

## 🚀 Uso Automático con Docker
Al levantar el contenedor `postgres-db`, estos archivos se montan en `/docker-entrypoint-initdb.d` y se ejecutan automáticamente por orden alfabético si el volumen de datos está vacío.
