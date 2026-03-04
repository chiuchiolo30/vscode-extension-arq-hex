# Change Log

All notable changes to the "flutter-arq-hex" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.3.0] - 2026-03-03

### Changed
- **🎨 Rebranding**: Display name actualizado a "Flutter Clean Architecture Generator"
- **📝 README.md**: Reescritura completa con formato profesional
  - Badges (licencia, CI, descargas)
  - GIF de demo al inicio
  - Árboles de directorios con formato visual
  - Tabla de comandos
  - Workflow paso a paso
  - Sección de contribución y soporte
- **🔍 SEO & Marketplace**: Mejoras para mayor visibilidad
  - Descripción en inglés optimizada para búsquedas
  - Keywords ampliadas y enfocadas en Flutter
  - Categoría actualizada a "Snippets"
  - Gallery banner color actualizado (#02569B - Flutter blue)
  - Badge de Flutter Clean Architecture
- **📦 package.json**: Mejoras de metadata
  - `extensionDependencies`: Requiere Dart extension
  - `capabilities`: virtualWorkspaces y untrustedWorkspaces
  - Formato de código mejorado
- **🖼️ Assets**: Agregado preview.gif para demo en README

---

## [1.2.1] - 2026-01-21

### Added
- **📊 Status Bar inteligente**: Muestra estado actual de la extensión en tiempo real
  - En proyecto simple: `DCA: Feature-First | Preview ON`
  - En monorepo con app activa: `DCA: menu_app | Feature-First | Preview ON`
  - En monorepo sin app activa: `DCA: Monorepo | Auto | Preview OFF`
  - Click abre menú Quick Pick con opciones de configuración
  - Actualización automática al cambiar editor, configuración o ejecutar comandos
- **🎨 WebviewPanel para Preview**: Reemplaza modal por panel dedicado
  - Header fijo con metadata del comando (no scrollea)
  - Body scrolleable con lista de carpetas y archivos
  - Footer fijo con botones siempre visibles
  - Soporta listas largas (500+ items) sin ocultar botones
  - Estilo nativo VS Code (tema claro/oscuro)
  - Atajos de teclado: Ctrl+Enter (crear), Escape (cancelar)

### Changed
- **StatusBarManager**: Nueva clase para gestión del Status Bar
  - Detecta app activa en monorepos basándose en archivo abierto
  - Muestra modo de estructura específico por app
  - Tooltip detallado con contexto completo
- **PreviewWebview**: Implementación del panel dedicado para preview
  - Seguridad: CSP estricta con nonce, sanitización HTML
  - Layout: Header y footer fijos, body con overflow-y
  - Event listeners explícitos en lugar de onclick inline
- **PreviewManager**: Ahora usa WebviewPanel en lugar de modal
  - Mejora UX con botones siempre visibles
  - Secciones separadas para carpetas y archivos
- **BaseCommand**: Expone context para acceso desde comandos
- **extension.ts**: Registra listeners para actualización automática del Status Bar
  - onDidChangeActiveTextEditor
  - onDidOpenTextDocument
  - onDidChangeConfiguration
  - onDidChangeWorkspaceFolders

### Fixed
- Preview webview: Botones ahora funcionan correctamente con event listeners
- Status Bar: Se actualiza automáticamente al cambiar de archivo en monorepos
- Preview: Evita múltiples resoluciones de promesa con flag `resolved`

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