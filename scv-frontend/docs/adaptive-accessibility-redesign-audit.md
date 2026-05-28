# Auditoria inicial - rediseño adaptativo y accesibilidad

## Contexto de uso
- La aplicacion sera usada por personas con distintos niveles de alfabetizacion.
- La interfaz debe priorizar reconocimiento visual sobre lectura extensa.
- Objetivo operativo: acciones criticas comprensibles en pocos segundos.

## Hallazgos base (frontend actual)
- Botones detectados en `index.html`: 72.
- Botones con icono embebido (`<img>`): 18.
- Botones sin icono embebido: 54.
- Paleta visual mezclada: predominan tonos verdes en login, pero existen acentos azules en dashboards y modulos.
- Tipografia no unificada del todo: se usa Inter como base, con reglas repetidas en varios bloques.
- Sistema de botones parcialmente consistente: coexisten `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-large`, `action-btn` con alturas y ritmos distintos.

## Riesgos UX para usuarios con baja alfabetizacion
- Dependencia excesiva de texto para entender acciones.
- Inconsistencia de color para acciones principales entre modulos.
- Diferencia de tamanos en botones similares provoca duda de prioridad.
- Toolbars y paneles administrativos con comandos visualmente homogeneos (dificil escaneo rapido).

## Criterios de rediseño acordados
- Iconografia obligatoria en acciones interactivas principales y secundarias.
- Color de enfasis global verde, consistente con la pantalla de login.
- Sistema de tipografia unificado para toda la aplicacion.
- Sistema de botones estandarizado por tamano, estados y jerarquia visual.

## Estrategia de los primeros 3 commits
1. `chore(ui): add adaptive accessibility baseline audit`
   - Registrar esta linea base para medir avance por commit.
2. `feat(ui): unify typography and apply green-first visual tokens`
   - Unificar familia tipografica global.
   - Reorientar tokens y acentos globales a verde.
3. `feat(ui): standardize button sizing and unified icon pack behavior`
   - Normalizar alturas y espaciado de botones.
   - Aplicar un mecanismo unificado de iconos en botones mediante mapa semantico.

## Definition of Done inicial
- Todos los botones de accion visibles con icono + texto corto.
- Todos los modulos usan el mismo sistema tipografico.
- Acentos de accion primaria coherentes en verde.
- Sin ruptura visual en desktop y mobile.
