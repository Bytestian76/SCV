# Guía Rápida de Despliegue en VPS (Zero to Hero)

Esta guía está diseñada para que cualquier persona pueda desplegar el Sistema de Control Vehicular (SCV) en un servidor en la nube (ej. Google Cloud Compute Engine) desde cero, de la manera más fácil y rápida posible.

## Requisitos Previos

Antes de ejecutar los comandos, debes cumplir con dos requisitos indispensables:
1. **Un servidor en la nube (VPS)** corriendo Linux (Ubuntu 22.04 LTS o Debian 12 recomendados).
2. **Un nombre de dominio** (ej. `mi-empresa.com`).

---

## Paso 1: Configurar el Servidor y la Red (Ejemplo Google Cloud)

1. Ve a tu consola de Google Cloud y crea una instancia de **Compute Engine**.
2. **Sistema Operativo:** Selecciona Ubuntu 22.04 LTS (o Debian).
3. **Firewall (MUY IMPORTANTE):** Asegúrate de marcar las casillas:
   - [x] Permitir tráfico HTTP
   - [x] Permitir tráfico HTTPS
4. **IP Pública:** Una vez creada la máquina, Google Cloud te asignará una "IP Externa" (IP pública). Anótala.

## Paso 2: Configurar tu Dominio (DNS)

1. Entra a la página donde compraste tu dominio (GoDaddy, Namecheap, Cloudflare, etc).
2. Ve a la zona de administración de DNS.
3. Crea un **Registro de tipo A** apuntando a la IP pública de tu servidor:
   - **Tipo:** A
   - **Nombre/Host:** `@` (o `scv` si quieres un subdominio como `scv.mi-empresa.com`)
   - **Valor/Destino:** `La IP pública de tu servidor de Google Cloud`
4. *Nota: Los cambios de DNS pueden tardar unos minutos en propagarse por internet.*

---

## Paso 3: Clonar el Repositorio e Instalar

Inicia sesión en tu servidor (usando SSH o el botón "SSH" de la consola de Google Cloud). Una vez dentro de la consola negra (terminal), ejecuta los siguientes comandos:

**1. Instalar git y clonar el código:**
```bash
sudo apt update && sudo apt install -y git
git clone https://github.com/Bytestian76/SCV.git
cd SCV
```

**2. Dar permisos de ejecución al script instalador:**
```bash
chmod +x setup_vps.sh
```

**3. Ejecutar el instalador automático:**
```bash
./setup_vps.sh
```

## Paso 4: Seguir el Asistente

El script `setup_vps.sh` hará todo por ti. Solamente te hará un par de preguntas:
- Te preguntará tu dominio (ej. `scv.mi-empresa.com`).
- Te preguntará un correo para registrar el candado verde de seguridad (Let's Encrypt).
- Te confirmará si el dominio ya apunta a la IP. Dile que "Sí" (teclea `s`).

¡Y listo! El script instalará Docker automáticamente, generará contraseñas ultra seguras y blindadas para la base de datos sin que tengas que pensarlas, solicitará los certificados de seguridad, y levantará el sistema en internet.

### Administrar el sistema

- **Ver los registros (logs) si algo falla:**
  `sudo docker compose -f docker-compose.prod.yml logs -f`
- **Reiniciar el sistema:**
  `sudo docker compose -f docker-compose.prod.yml restart`
- **Apagar el sistema:**
  `sudo docker compose -f docker-compose.prod.yml down`
