# Change Log

All notable changes to the "flutter-arq-hex" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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