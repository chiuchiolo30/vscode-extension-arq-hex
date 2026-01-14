# Change Log

All notable changes to the "flutter-arq-hex" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.2.0] - 2026-01-14

### Added
- **🔍 Sistema de Previsualización (Preview)**: Nueva funcionalidad que muestra qué archivos y carpetas se crearán antes de confirmar
  - Modal con resumen completo (comando, app, feature, modo de estructura)
  - Estadísticas (cantidad de carpetas y archivos)
  - Lista detallada de todos los paths a crear
  - Confirmación segura con botones "✅ Crear" y "Cancelar"
  - **Opción "⚡ Crear y no volver a mostrar"**: Permite deshabilitar el preview directamente desde el modal
  - Aplicado a todos los comandos de generación (Create Feature, Create Feature with CRUD, Create Use Case)
- **Comando Toggle Preview**: `Clean Architecture: Toggle preview before generation`
  - Habilita/deshabilita la previsualización desde Command Palette
  - Muestra estado actual y opciones con íconos claros
  - Persiste configuración a nivel workspace
- **Settings de Preview**:
  - `dartCleanArch.preview.enabled` (default: true) - Habilitar/deshabilitar preview
  - `dartCleanArch.preview.maxItems` (default: 200) - Máximo de items a mostrar
- **PreviewManager**: Nueva clase helper para gestión de previsualizaciones
- **TogglePreviewCommand**: Comando para alternar preview fácilmente
- **Output Channel**: "Dart Clean Architecture" para logging detallado
- **Documentación completa**: `PREVIEW_FEATURE_GUIDE.md` con ejemplos, mejores prácticas y guía de uso

### Changed
- **Micro-copy mejorado**: Textos más claros y profesionales en modales
  - Títulos descriptivos con emojis
  - Labels específicos ("Carpetas a crear", "Archivos a crear")
  - Hint visible sobre cómo desactivar preview
- `FeatureStructureGenerator.planFeatureGeneration()`: Nuevo método que planifica sin ejecutar
- `UseCaseGenerator.planUseCaseGeneration()`: Nuevo método que planifica sin ejecutar
- `BaseCommand.resolveWorkingDirectoryWithInfo()`: Retorna información adicional (app name)
- `StructureModeManager.getEffectiveModeWithSource()`: Retorna modo y su fuente (auto-detect/override/default)
- Todos los comandos ahora integran preview antes de generar
- README actualizado con sección sobre Preview y comando toggle

### Fixed
- Modal de preview ahora usa un solo botón custom (VSCode agrega "Cancelar" automáticamente)
- Eliminado botón "Cancelar" duplicado para mejor UX

### Security
- Preview garantiza que cancelar no crea ningún archivo
- Solo muestra paths, no contenido de archivos
- No se ejecuta ninguna operación de filesystem hasta confirmar

## [1.1.0] - 2025-11-19

### Added
- **Soporte completo para monorepos Melos**: La extensión ahora detecta automáticamente proyectos Melos
- Selector de paquetes/apps: Permite elegir en qué paquete del monorepo ejecutar los comandos
- `MelosHelper`: Nueva clase helper para gestión de monorepos
- Métodos `findMelosRoot()` y `isInsideMelosPackage()` en `ProjectValidator`
- `resolveWorkingDirectory()` en `BaseCommand` para resolución inteligente de directorios
- Tests unitarios básicos para la funcionalidad Melos
- **Mensajes amigables con íconos**: Todos los mensajes del sistema ahora incluyen íconos visuales
- Mensajes contextuales diferenciados para cada tipo de comando
- Sugerencias útiles (💡) cuando ocurre un error o advertencia
- Placeholders descriptivos con ejemplos en todos los inputs

### Changed
- Todos los comandos ahora usan `resolveWorkingDirectory()` para soporte Melos
- Mejorada la experiencia de usuario al trabajar con monorepos
- Mensajes de éxito ahora muestran la ruta exacta donde se creó la feature/use case
- Mensajes de error más descriptivos con íconos (✅, ⚠️, ❌)
- Selector de apps Melos con íconos nativos de VS Code
- Inputs con ejemplos contextuales para guiar al usuario

### Fixed
- Detección mejorada de proyectos Flutter en contextos de monorepo
- Filtrado correcto de apps (solo apps/, no packages compartidos)
- Convenciones de nombre Dart respetadas (snake_case → PascalCase)

## [1.0.4] - Previous Release

- Initial stable release