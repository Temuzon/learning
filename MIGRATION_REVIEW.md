# Revisión de migración: `Systux/Getux/HSDDP`

Fecha de revisión: 2026-05-19 (UTC)

## Hallazgos principales

1. **Archivos vacíos/placeholder exportados por error**
   - `Systux/webapps` (vacío)
   - `iconos/iconos` (vacío)

2. **Estructura de HSDDP aplanada**
   - En `Systux/Getux/HSDDP/` hay muchos componentes React/UI en la raíz (`button.jsx`, `dialog.jsx`, `sidebar.jsx`, etc.).
   - Para mantenimiento, conviene separar por carpetas (`src/components/ui`, `src/components/features`, `src/lib`, etc.).

3. **Nombres potencialmente inconsistentes**
   - `Calandrier.jsx` parece typo de `Calendar`/`Calendrier`.
   - Coexisten `Sidebar.jsx` y `sidebar.jsx` (diferencia solo de mayúsculas), lo cual puede romper builds en Linux/macOS dependiendo de imports.

4. **Duplicados visuales en el repo raíz**
   - Se ven iconos repetidos en raíz y en `iconos/` (ej. `icon-instagram.svg`, `icon-youtube.svg`, `icon-pinterest.svg`, `download_...svg`, etc.).

## Limpieza aplicada en este commit

- Eliminados dos archivos vacíos detectados como innecesarios:
  - `Systux/webapps`
  - `iconos/iconos`

## Próximo paso recomendado

Si quieres, en una segunda pasada puedo hacer una **normalización automática** de estructura y naming en `Systux/Getux/HSDDP` (con cambios de imports incluidos) para dejarlo listo como módulo de Systux.
