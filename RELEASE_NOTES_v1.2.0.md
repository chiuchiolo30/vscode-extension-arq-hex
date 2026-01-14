# 🚀 Release Notes v1.2.0

**Fecha de lanzamiento:** 14 de enero de 2026

## 🎉 ¿Qué hay de nuevo?

### 🔍 Sistema de Previsualización Completo

¡La característica más esperada ya está aquí! Ahora **ves exactamente qué se va a crear antes de confirmar**.

**¿Qué incluye el preview?**
- 📦 Información del comando y contexto (app, feature, modo)
- 📊 Estadísticas detalladas (cantidad de carpetas y archivos)
- 📁 Lista completa de todos los elementos a crear
- ✅ Confirmación segura antes de generar

**Nuevo flujo de trabajo:**
1. Ejecutas un comando (Create Feature, etc.)
2. **VES** todo lo que se creará en un modal elegante
3. Confirmas o cancelas sin riesgo

### ⚡ Opción "Crear y no volver a mostrar"

¿Prefieres el flujo rápido? Ahora puedes **deshabilitar el preview directamente desde el modal**.

**3 opciones en cada preview:**
- ✅ **Crear** - Genera y mantiene preview activo
- ⚡ **Crear y no volver a mostrar** - Genera y desactiva preview para futuro
- ❌ **Cancelar** - No hace nada (sin riesgo)

### 🎛️ Comando Toggle Preview

Nueva forma ultra-rápida de habilitar/deshabilitar preview:

1. Abre Command Palette (`Ctrl+Shift+P`)
2. Busca: `Clean Architecture: Toggle preview before generation`
3. Elige: Habilitar o Deshabilitar

**Ventajas:**
- No necesitas editar settings manualmente
- Muestra el estado actual
- Persiste la configuración por workspace

### 💬 Micro-copy Mejorado

Todos los textos de los modales fueron revisados para mayor claridad:

**Antes:**
```
Folders: 5
Files: 10
Confirm?
```

**Ahora:**
```
📊 Resumen de generación
   • Carpetas a crear: 5
   • Archivos a crear: 10

📁 Elementos que se crearán
   ...

¿Confirmas la generación?
```


## 🎯 Casos de Uso

### Para desarrolladores que quieren control total
✅ Mantén el preview habilitado (default)
✅ Revisa cada generación antes de confirmar
✅ Cancela si algo no se ve bien

### Para desarrolladores que prefieren velocidad
✅ Usa "⚡ Crear y no volver a mostrar" la primera vez
✅ O desactiva con el comando toggle
✅ Genera directamente sin interrupciones

### Para equipos con convenciones estrictas
✅ Usa preview para entrenar nuevos miembros
✅ Verifica que la estructura sea consistente
✅ Desactiva cuando todos dominen la convención

---

## ⚙️ Configuración

### Settings disponibles

```json
{
  // Habilitar/deshabilitar preview
  "dartCleanArch.preview.enabled": true,
  
  // Máximo de items a mostrar (evita modales muy largos)
  "dartCleanArch.preview.maxItems": 200
}
```

### Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `Clean Architecture: Toggle preview before generation` | Habilita/deshabilita preview fácilmente |
| `Clean Architecture: Create Feature` | Crea feature con preview |
| `Clean Architecture: Create Feature with CRUD` | Crea feature CRUD con preview |
| `Clean Architecture: Create Use Case` | Crea use case con preview |

---

## 🐛 Correcciones

- **Modal con botón duplicado**: Eliminado botón "Cancelar" redundante (VSCode lo agrega automáticamente)
- **UX mejorada**: Textos más claros y profesionales en todos los modales

---

## 📚 Documentación

### Nuevos recursos

- **[PREVIEW_FEATURE_GUIDE.md](./PREVIEW_FEATURE_GUIDE.md)**: Guía completa del sistema de preview
  - Cómo funciona
  - Ejemplos visuales
  - Mejores prácticas
  - Cómo habilitar/deshabilitar

### Actualizaciones

- **README.md**: Sección sobre preview y comandos
- **CHANGELOG.md**: Historial completo de cambios v1.2.0

---

## 🔒 Seguridad

- ✅ Cancelar el preview **NO crea ningún archivo**
- ✅ Solo se muestran paths, no contenido sensible
- ✅ Ninguna operación de filesystem hasta confirmar

---

## 🚀 Migración desde v1.1.0

**No se requiere ninguna acción** - la extensión sigue funcionando igual:

- Preview está **habilitado por defecto**
- Puedes deshabilitarlo cuando quieras
- Todos los comandos existentes funcionan igual

**Si prefieres el comportamiento anterior:**
1. Usa "⚡ Crear y no volver a mostrar" en el primer preview
2. O ejecuta: `Clean Architecture: Toggle preview before generation`

---

## 💡 Próximas mejoras

¿Ideas para v1.3.0? Comparte tus sugerencias:
- GitHub Issues: https://github.com/chiuchiolo30/vscode-extension-arq-hex/issues
- Email: chiuchiolo30@gmail.com

---

**¡Gracias por usar Flutter Clean Architecture!** 🎉

Si te gusta la extensión, considera:
- ⭐ Dar una estrella en GitHub
- 📝 Dejar una review en VS Code Marketplace
- 🐦 Compartir con tu equipo


## 🙏 Agradecimientos

Gracias a todos los usuarios que han solicitado esta funcionalidad. El preview hace la extensión mucho más transparente y confiable.

---

## 📅 Roadmap

### Próximas versiones
- 🎨 Preview con contenido de archivos (opcional)
- 📊 Preview en formato árbol
- 🔧 Edición de paths antes de generar
- 💾 Guardar preview como template

---

**Versión**: 1.2.0  
**Fecha**: Diciembre 2025  
**Compatibilidad**: VSCode ^1.77.0  
**Cambio Principal**: Sistema de previsualización completo antes de generar código
