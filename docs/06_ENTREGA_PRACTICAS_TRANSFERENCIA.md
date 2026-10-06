# 📋 Acta de Entrega y Transferencia Tecnológica de Prácticas

**Empresa Patrocinadora:** Comercializadora Normetales S.A.S.  
**Entidad Educativa:** Servicio Nacional de Aprendizaje (SENA)  
**Proyecto:** Sistema de Control Vehicular (SCV) - Versión 2.0  
**Desarrollador / Practicante:** Jhoan Sebastian Prada Carrascal ([@Bytestian76](https://github.com/Bytestian76))  
**Área:** Tecnología de la Información, Logística y Mantenimiento  
**Fecha de Entrega:** Octubre de 2026 (Cierre de Etapa Productiva)

---

## 📌 1. Resumen Ejecutivo y Cumplimiento de Metas

El presente documento certifica la entrega formal, transferencia tecnológica y cierre de actividades del proyecto **Sistema de Control Vehicular (SCV)** desarrollado durante la etapa productiva de prácticas en **Comercializadora Normetales S.A.S.**

El objetivo primordial del proyecto fue la **digitalización, centralización y automatización integral** de la logística vehicular de la empresa, eliminando la dispersión de información, las pérdidas de registros físicos en papel y la vulnerabilidad operativa generada por la dependencia de herramientas externas como Google Forms y hojas de cálculo desconectadas.

### 🎯 Metas y Logros Clave Alcanzados:
* ✅ **Digitalización del 100% de Inspecciones Preoperacionales:** Reemplazo de formularios físicos por una PWA móvil conforme a los lineamientos del Plan Estratégico de Seguridad Vial (PESV) del Ministerio de Transporte.
* ✅ **Control de Despacho y Báscula en Tiempo Real:** Registro digital inmediato de entradas, salidas, pesaje de carga (kg), sacas y estado del cajón con trazabilidad por operario.
* ✅ **Módulo Avanzado de Taller Automotriz:** Detección automática de anomalías a partir de chequeos fallidos, emisión de Órdenes de Trabajo (OT), control de actividades, repuestos, costos y evidencias fotográficas.
* ✅ **Arquitectura Segura y Contenerizada:** Modernización del sistema hacia un stack robusto (FastAPI + React PWA + PostgreSQL 16 + Nginx Gateway) orquestado con Docker.
* ✅ **Protección Criptográfica y Perimetral:** Implementación de WAF a nivel de aplicación, sesiones JWT con blacklist para revocación en logout y cifrado SSL/TLS automático con Let's Encrypt.

---

## 📦 2. Inventario Formal de Entregables Tecnológicos

Se entrega a Comercializadora Normetales S.A.S. la totalidad de los activos digitales, código fuente y documentación técnica:

| Componente | Tipo de Entregable | Ubicación / Referencia | Descripción del Entregable |
|---|---|---|---|
| **Código Fuente** | Repositorio Git | [`github.com/Bytestian76/SCV`](https://github.com/Bytestian76/SCV) | Repositorio completo versionado, ramas sincronizadas y rama `main` en estado productivo. |
| **Backend REST API** | Servicio Docker | `/api-services` | API desarrollada en FastAPI con Python 3.11, ORM SQLAlchemy 2.0 y validaciones Pydantic v2. |
| **Frontend PWA** | Aplicación Web SPA | `/client-app` | Interfaz React 18 + Vite con soporte PWA, tema oscuro de alto contraste y diseño adaptable a móviles. |
| **Base de Datos** | Scripts DDL y Migraciones | `/db-scripts` y `/api-services/alembic` | Esquema relacional oficial para PostgreSQL 16 (12 tablas) con control de versiones Alembic. |
| **Infraestructura** | Contenedores & Nginx | `/nginx-gateway` y `docker-compose.*.yml` | Proxy inverso Nginx, configuración SSL Let's Encrypt y orquestación multi-contenedor. |
| **Automatización** | Shell Scripts | Raíz del proyecto | Scripts de instalación (`setup_vps.sh`), SSL (`init-letsencrypt.sh`, `fix-ssl.sh`) y copias de seguridad (`backup-db.sh`). |
| **Documentación** | Paquete Markdown | `/docs` y `/README.md` | 6 documentos técnicos especializados que cubren arquitectura, datos, API, manual de usuario y DevOps. |

---

## 📊 3. Matriz de Cumplimiento de Requisitos

A continuación se detalla el estado final de los requisitos planteados al inicio del proyecto (documento IEEE 830 / Especificación de Requerimientos):

| ID | Módulo | Descripción del Requisito | Estado Final | Observaciones de Entrega |
|---|---|---|:---:|---|
| **RF-01** | Autenticación | Login seguro con correo y contraseña cifrada (Bcrypt) | **Completado (100%)** | Tokens JWT con 8 horas de vigencia y protección anti-fuerza bruta. |
| **RF-02** | Autenticación | Segregación de roles (RBAC) | **Completado (100%)** | 5 roles implementados: Admin, Op. Movimientos, Op. Chequeo, Mecánico, Jefe Taller. |
| **RF-03** | Autenticación | Cierre de sesión y revocación inmediata de credenciales | **Completado (100%)** | Blacklist de tokens mediante JTI persistido en PostgreSQL. |
| **RF-04** | Vehículos | Padrón maestro de flota vehicular (CRUD) | **Completado (100%)** | Control de odómetro acumulado, alertas de SOAT y Técnico-Mecánica. |
| **RF-05** | Personal | Unificación de usuarios y catálogo de conductores | **Completado (100%)** | Control de licencias de conducción, categorías (C1, C2, C3) y teléfonos. |
| **RF-06** | Movimientos | Captura de salidas y entradas de vehículos | **Completado (100%)** | Registro de peso de báscula en kg, cantidad de sacas y estado del cajón. |
| **RF-07** | Movimientos | Exportación de despachos a formatos de hoja de cálculo | **Completado (100%)** | Descarga instantánea en CSV compatible con Microsoft Excel. |
| **RF-08** | Chequeos | Diligenciamiento de lista de chequeo preoperacional diaria | **Completado (100%)** | Formulario móvil de 45 ítems con opciones Conforme, No Conforme y No Aplica. |
| **RF-09** | Chequeos | Detección automática de no conformidades | **Completado (100%)** | Si un ítem falla, el chequeo se rechaza y se genera un hallazgo técnico inmediato. |
| **RF-10** | Taller | Emisión y control de Órdenes de Trabajo (OT) | **Completado (100%)** | Flujo completo de asignación de mecánicos, tareas y cambio de estados. |
| **RF-11** | Taller | Imputación de repuestos y costos de reparación | **Completado (100%)** | Liquidación de insumos mecánicos y mano de obra por orden. |
| **RF-12** | Taller | Registro de evidencias fotográficas | **Completado (100%)** | Subida y vinculación de fotos antes, durante y después del arreglo. |
| **RF-13** | Dashboard | Centro de mando y métricas operativas en tiempo real | **Completado (100%)** | KPIs de flota activa vs taller, gráfico de flujos horarios y panel de alertas. |
| **RF-14** | PWA | Instalación directa en dispositivos móviles sin tienda | **Completado (100%)** | Web App Manifest y Service Worker configurados para Android y escritorio. |
| **RF-15** | Seguridad | Firewall de aplicaciones web (WAF) | **Completado (100%)** | Bloqueo activo contra SQL Injection, Cross-Site Scripting y Path Traversal. |

---

## 🔑 4. Matriz de Accesos y Credenciales Entregadas

Para la custodia del área de sistemas y supervisores designados por Comercializadora Normetales S.A.S.:

### 4.1. Cuentas de Acceso a la Plataforma (Entorno Local y Pruebas)
* **Administrador:** `admin@scv.local` / Clave: `admin123`
* **Despacho / Báscula:** `despacho@scv.local` / Clave: `admin123`
* **Inspector / Chofer:** `carlos.chofer@scv.local` / Clave: `admin123`
* **Mecánico:** `mecanico@scv.local` / Clave: `admin123`
* **Jefe de Taller:** `jefe.taller@scv.local` / Clave: `admin123`

> [!IMPORTANT]
> Al desplegar en el servidor de producción definitivo, el administrador debe ingresar al módulo de Usuarios y cambiar de inmediato las contraseñas iniciales por claves alfanuméricas robustas.

### 4.2. Repositorio de Código y Llaves de Despliegue
* **URL del Repositorio:** `https://github.com/Bytestian76/SCV`
* **Rama Principal:** `main` (Código consolidado listo para despliegue).
* **Rama de Trabajo:** `develop` (Sincronizada con `main` para desarrollos futuros).
* **Plantilla de Secretos:** `.env.example` en la raíz del proyecto.

---

## 🔮 5. Recomendaciones y Hoja de Ruta para Futuras Versiones (Fase 3+)

Como sugerencia técnica para los ingenieros o futuros desarrolladores que asuman el mantenimiento del software, se recomienda priorizar las siguientes evoluciones:

1. **Integración Directa con la Báscula Camionera (IoT):**  
   Conectar el indicador electrónico de la báscula física (vía puerto serial RS-232 o convertidor Ethernet TCP/IP) con un script local en Python o webhook para capturar el peso bruto automáticamente sin digitación manual del operador.
2. **Geolocalización Satelital (GPS en Tiempo Real):**  
   Aprovechar la API de geolocalización del navegador móvil para registrar las coordenadas GPS exactas en el momento de la salida y llegada del vehículo.
3. **Notificaciones Push y Alertas por Mensajería:**  
   Integrar un bot de Telegram o la API de WhatsApp Business para alertar automáticamente al Jefe de Taller y al Administrador cuando un chequeo preoperacional sea rechazado por falla crítica.
4. **Validación de Identidad por Código QR:**  
   Generar códigos QR para cada vehículo pegados en el parabrisas. El operario escaneará el QR con la cámara del celular desde la PWA, abriendo al instante la ficha del camión para acelerar el inicio del chequeo.

---

## ✍️ 6. Conformidad de Entrega

El software se entrega probado, verificado, documentado exhaustivamente y con todas sus dependencias contenerizadas para garantizar su continuidad operativa y soberanía tecnológica en Comercializadora Normetales S.A.S.

```text
Entregado por:                                  Recibido por:

________________________________________        ________________________________________
Jhoan Sebastian Prada Carrascal                 Área de Sistemas / Tutor Empresarial
Practicante de Desarrollo de Software           Comercializadora Normetales S.A.S.
SENA - Regional Bogotá                          Bogotá D.C., Colombia
```
