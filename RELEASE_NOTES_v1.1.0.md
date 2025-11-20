# 🚀 Release Notes - Version 1.1.0

## 🎉 ¡Nueva versión con soporte Melos y UX mejorada!

---

## ✨ Novedades Principales

### 📦 **Soporte Completo para Monorepos Melos**

¿Trabajas con múltiples apps en un mismo repositorio? ¡Esta versión está diseñada para ti!

- ✅ **Detección automática** de proyectos Melos
- ✅ **Selector visual** de apps Flutter en tu monorepo
- ✅ **Filtrado inteligente**: Solo muestra apps (carpeta `apps/`), no packages compartidos
- ✅ **Workflow consistente** entre proyectos normales y monorepos

### 💬 **Mensajes Mejorados con Íconos**

Experiencia de usuario completamente renovada:

- ✅ **Notificaciones claras** con íconos descriptivos
- ✅ **Información detallada** (nombre, ubicación, feature)
- ✅ **Sugerencias útiles** cuando hay errores
- ✅ **Ejemplos contextuales** en cada input

**Ejemplo de mensaje:**
```
✅ Caso de uso creado exitosamente - 🔧 Nombre: get-user-profile | 📦 Feature: authentication | 📁 Ubicación: lib/features/authentication/domain/use_cases/
```

### 🎯 **Convenciones de Nombre Dart**

Ahora respeta completamente los estándares de Dart:

- ✅ **snake_case** para archivos y carpetas
- ✅ **PascalCase** para clases e interfaces
- ✅ **camelCase** para métodos y variables
- ✅ Conversión automática de guiones a underscores

---

## 🔧 Mejoras Técnicas

### Arquitectura
- Nuevo `MelosHelper` para gestión de monorepos
- `ProjectValidator` mejorado con detección de Melos
- Método `resolveWorkingDirectory()` unificado en todos los comandos

### UX Refinements
- Placeholders descriptivos con ejemplos
- Mensajes contextuales por tipo de comando
- Selector de apps con íconos nativos de VS Code

### Code Quality
- Logs de debug comentados (listos para producción)
- Tests unitarios para nuevas funcionalidades
- Documentación completa (MELOS_GUIDE.md)

---

## 📊 Estadísticas

- **505 descargas** y creciendo
- Soporte para **Monorepos + Apps normales**
- **3 comandos** principales optimizados

---

## 🎓 Cómo Usar las Nuevas Características

### En un Monorepo Melos:

1. Ejecuta cualquier comando (Create Feature, Create Use Case, etc.)
2. La extensión detectará automáticamente tu monorepo
3. Selecciona la app donde quieres trabajar
4. ¡Continúa como siempre!

### En una App Normal:

Todo funciona exactamente igual que antes, sin cambios en tu workflow.

---

## 🔗 Links Útiles

- **Marketplace**: [Dart Clean Architecture - Arq. Hex](https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex)
- **Repositorio**: [GitHub](https://github.com/chiuchiolo30/vscode-extension-arq-hex)
- **Issues**: [Reportar un problema](https://github.com/chiuchiolo30/vscode-extension-arq-hex/issues)
- **Guía Melos**: [MELOS_GUIDE.md](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/MELOS_GUIDE.md)

---

## 🙏 Agradecimientos

Gracias a todos los usuarios que han descargado y usado esta extensión. ¡Su feedback es invaluable!

---

## 📅 Próximas Versiones

Estamos trabajando en:
- 🎨 Templates personalizables
- 🔧 Más opciones de configuración
- 📦 Soporte para otros monorepo tools
- 🧪 Testing integrado

---

**¿Te gusta esta extensión? ¡Déjanos una ⭐ en GitHub y una reseña en el Marketplace!**
