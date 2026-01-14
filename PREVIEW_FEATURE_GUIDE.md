# Guía de Previsualización (Preview)

## 🔍 Descripción General

La funcionalidad de **previsualización** permite ver exactamente qué archivos y carpetas se crearán antes de que la extensión genere cualquier código. Esto te da control total y transparencia sobre lo que se va a modificar en tu proyecto.

---

## ✨ Características

### ✅ Qué muestra el preview

1. **Información del comando**: Qué operación se va a realizar (Create Feature, Create Use Case, etc.)
2. **Contexto del proyecto**:
   - Nombre de la app (si es monorepo Melos)
   - Feature seleccionada
   - Modo de estructura (Feature-First o Layer-First)
   - Origen del modo (auto-detect, override, default)
3. **Resumen estadístico**:
   - Cantidad total de carpetas a crear
   - Cantidad total de archivos a crear
4. **Lista detallada**:
   - Paths relativos de cada carpeta
   - Paths relativos de cada archivo
   - Limitado a 200 items por defecto (configurable)

### ✅ Comandos soportados

- ✅ **Create Feature** (sin CRUD)
- ✅ **Create Feature with CRUD**
- ✅ **Create Use Case**

### ✅ Funciona en

- ✅ Proyectos Flutter standalone
- ✅ Monorepos Melos (todas las versiones)
- ✅ Modo Feature-First
- ✅ Modo Layer-First
- ✅ Con auto-detección de estructura
- ✅ Con override manual de estructura

---

## ⚙️ Configuración

### Settings disponibles

En tu `settings.json` de VSCode:

```json
{
  // Habilitar o deshabilitar la previsualización
  "dartCleanArch.preview.enabled": true,
  
  // Número máximo de items a mostrar en el preview
  "dartCleanArch.preview.maxItems": 200
}
```

### `dartCleanArch.preview.enabled`

- **Tipo**: `boolean`
- **Default**: `true`
- **Descripción**: Controla si se muestra la previsualización antes de generar código.

**Valores:**
- `true`: Muestra el preview y solicita confirmación antes de crear archivos
- `false`: Genera directamente sin mostrar preview (comportamiento anterior)

**Cómo cambiar:**
1. **Mediante comando** (recomendado):
   - Abre Command Palette: `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
   - Busca: "Clean Architecture: Toggle preview before generation"
   - Selecciona la opción deseada

2. **Manualmente en settings.json**:
   ```json
   {
     "dartCleanArch.preview.enabled": false
   }
   ```

### `dartCleanArch.preview.maxItems`

- **Tipo**: `number`
- **Default**: `200`
- **Descripción**: Número máximo de items (carpetas + archivos) a mostrar en el preview.

Si el total de items supera este límite, se truncará la lista y se mostrará un mensaje como:
```
... y 37 items más.
```

---

## 📋 Ejemplo de Preview

### Caso: Create Feature with CRUD

```
🔍 Previsualización de generación

📋 Comando: Create Feature with CRUD
📦 App: mobile_app
🎯 Feature: authentication
🏗️ Modo: Feature-First (auto-detect)

📊 Resumen:
   • Carpetas: 11
   • Archivos: 18

📁 Se crearán:
   📁 Carpeta lib/features
   📁 Carpeta lib/features/authentication/data/datasources/api
   📁 Carpeta lib/features/authentication/data/datasources/local
   📁 Carpeta lib/features/authentication/data/datasources/remote
   📁 Carpeta lib/features/authentication/data/models
   📁 Carpeta lib/features/authentication/data/repositories
   📁 Carpeta lib/features/authentication/domain/entities
   📁 Carpeta lib/features/authentication/domain/usecases
   📁 Carpeta lib/features/authentication/domain/repositories
   📁 Carpeta lib/features/authentication/ui/blocs
   📁 Carpeta lib/features/authentication/ui/screens
   📁 Carpeta lib/features/authentication/ui/widgets
   📄 Archivo lib/features/authentication/data/datasources/index.dart
   📄 Archivo lib/features/authentication/data/models/index.dart
   📄 Archivo lib/features/authentication/domain/entities/index.dart
   📄 Archivo lib/features/authentication/domain/usecases/index.dart
   📄 Archivo lib/features/authentication/ui/blocs/index.dart
   📄 Archivo lib/features/authentication/ui/screens/index.dart
   📄 Archivo lib/features/authentication/ui/widgets/index.dart
   📄 Archivo lib/features/authentication/data/repositories/authentication.repository_impl.dart
   📄 Archivo lib/features/authentication/domain/repositories/authentication.repository.dart
   📄 Archivo lib/features/authentication/data/index.dart
   📄 Archivo lib/features/authentication/domain/index.dart
   📄 Archivo lib/features/authentication/ui/index.dart
   📄 Archivo lib/features/authentication/index.dart
   📄 Archivo lib/features/authentication/domain/usecases/create_authentication.usecase.dart
   📄 Archivo lib/features/authentication/domain/usecases/read_authentication.usecase.dart
   📄 Archivo lib/features/authentication/domain/usecases/update_authentication.usecase.dart
   📄 Archivo lib/features/authentication/domain/usecases/delete_authentication.usecase.dart

¿Desea continuar con la generación?

[Crear] [Cancelar]
```

### Caso: Create Use Case

```
🔍 Previsualización de generación

📋 Comando: Create Use Case
🎯 Feature: products
⚙️ Use Case: get-product-by-id
🏗️ Modo: Layer-First (override)

📊 Resumen:
   • Carpetas: 0
   • Archivos: 1

📁 Se crearán:
   📄 Archivo lib/domain/products/usecases/get_product_by_id.usecase.dart

¿Desea continuar con la generación?

[Crear] [Cancelar]
```

---

## 🎬 Flujo de Uso

### 1. Usuario ejecuta un comando

Ejemplo: "Clean Architecture - Create feature with CRUD"

### 2. Selecciona opciones

- Directorio de trabajo (app en monorepo)
- Nombre de la feature
- Etc.

### 3. Se genera el plan

La extensión calcula todos los paths que se crearían, **sin tocar el filesystem**.

### 4. Se muestra el preview

Un modal muestra:
- Resumen del comando
- Lista de carpetas y archivos
- Botones: **Crear** o **Cancelar**

### 5. Usuario decide

**Si presiona "Crear":**
- ✅ Se ejecuta la generación real
- ✅ Se crean carpetas y archivos
- ✅ Se muestra mensaje de éxito

**Si presiona "Cancelar":**
- ❌ No se crea ningún archivo
- ❌ No se modifica el proyecto
- ℹ️ Se muestra: "❌ Generación cancelada. No se crearon archivos."

---

## 🔧 Habilitar o Deshabilitar el Preview

### Opción 1: Usando el Comando (Recomendado)

La forma más rápida y sencilla:

1. Abre Command Palette: `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
2. Busca: **"Clean Architecture: Toggle preview before generation"**
3. Selecciona una opción:
   - ✅ **Habilitar previsualización antes de generar** - Muestra modal de confirmación
   - ⚡ **Deshabilitar previsualización (generar directamente)** - Genera sin preguntar

El comando muestra cuál es la configuración actual y te permite cambiarla con un solo clic.

**Mensajes de confirmación:**
- Si habilitas: "✅ Previsualización habilitada. Se mostrará un modal de confirmación antes de generar."
- Si deshabilitas: "⚡ Previsualización deshabilitada. Los archivos se generarán directamente."

### Opción 2: Editando Settings Manualmente

Si prefieres editar la configuración directamente:

1. Abre Settings: `Ctrl+,` (Windows/Linux) ou `Cmd+,` (Mac)
2. Busca: `dartCleanArch.preview.enabled`
3. Desmarca el checkbox (o pon `false` en `settings.json`)

O edita `settings.json`:

```json
{
  "dartCleanArch.preview.enabled": false
}
```

---

## 🎯 Casos de Uso Recomendados

### ✅ Cuándo usar preview

- **Proyectos grandes**: Ver el impacto completo antes de generar
- **Aprendizaje**: Entender qué archivos crea la extensión
- **Validación**: Verificar que se usa el modo correcto (Feature-First vs Layer-First)
- **Monorepos**: Confirmar que se seleccionó la app correcta
- **Prevención de errores**: Evitar generar en el lugar equivocado

### ⚠️ Cuándo deshabilitar preview

- **Flujo rápido**: Si ya conoces bien la extensión
- **Confianza total**: Si siempre usas las mismas opciones
- **Automatización**: Si ejecutas comandos desde scripts

---

## 🛡️ Seguridad

### ✅ Garantías del preview

1. **No destructivo**: Cancelar el preview **garantiza** que no se creará ningún archivo
2. **Sin modificaciones**: El preview solo **lee** información, nunca escribe
3. **Transparencia total**: Ves exactamente qué se va a crear, sin sorpresas
4. **Paths seguros**: Todos los paths se calculan antes de cualquier operación de FS

### 🔒 Qué NO muestra el preview (por seguridad)

- ❌ **Contenido de archivos**: Solo muestra paths, no el código que se generará
- ❌ **Datos sensibles**: No hay información del usuario ni del sistema

---

## 📝 Logging

### Output Channel

La extensión usa un Output Channel llamado **"Dart Clean Architecture"**.

Para verlo:
1. Abre el panel Output: `View` > `Output` (o `Ctrl+Shift+U`)
2. Selecciona "Dart Clean Architecture" en el dropdown

### Mensajes del preview

**Si preview está deshabilitado:**
```
[DCA] Preview disabled. Generating directly...
```

**Si el usuario confirma:**
```
[DCA] Preview confirmed. Generating...
```

**Si el usuario cancela:**
```
[DCA] Preview canceled. No files were created.
```

---

## 🧪 Casos de Prueba

### ✅ Escenario 1: Feature simple sin CRUD

**Input:**
- Comando: Create Feature
- Feature: `authentication`
- Modo: Feature-First

**Preview esperado:**
- ~11 carpetas
- ~14 archivos
- Paths en `lib/features/authentication/...`

**Resultado después de confirmar:**
- ✅ Estructura completa creada
- ✅ Archivos index vacíos
- ✅ Repositorios vacíos

### ✅ Escenario 2: Feature con CRUD

**Input:**
- Comando: Create Feature with CRUD
- Feature: `users`
- Modo: Layer-First

**Preview esperado:**
- ~11 carpetas
- ~18 archivos (14 base + 4 use cases CRUD)
- Paths en `lib/domain/users/...`, `lib/data/users/...`, `lib/ui/users/...`

**Resultado después de confirmar:**
- ✅ Estructura Layer-First creada
- ✅ 4 use cases CRUD generados (create, read, update, delete)
- ✅ Repositorio con firmas de métodos

### ✅ Escenario 3: Use Case en feature existente

**Input:**
- Comando: Create Use Case
- Feature: `products` (existente)
- Use Case: `get-product-by-id`

**Preview esperado:**
- ~0 carpetas (ya existe la estructura)
- ~1 archivo (solo el use case)
- Path: `lib/features/products/domain/usecases/get_product_by_id.usecase.dart`

**Resultado después de confirmar:**
- ✅ Use case creado
- ✅ Método agregado al repository
- ✅ Método agregado al repository impl

### ✅ Escenario 4: Cancelación

**Input:**
- Cualquier comando
- Usuario presiona "Cancelar" en el preview

**Resultado:**
- ❌ No se crea ningún archivo ni carpeta
- ℹ️ Mensaje: "❌ Generación cancelada. No se crearon archivos."
- 📝 Log: `[DCA] Preview canceled. No files were created.`

### ✅ Escenario 5: Límite de maxItems

**Input:**
- Feature muy grande que genera >200 items
- `dartCleanArch.preview.maxItems`: 200

**Preview esperado:**
- Muestra primeros 200 items
- Al final: `... y 37 items más.`

**Comportamiento:**
- ✅ Generación completa después de confirmar (todos los items)
- ✅ Preview truncado solo para legibilidad

---

## 🔄 Integración con Otras Funcionalidades

### ✅ Modos de Estructura

El preview muestra el modo que se usará:
- **Feature-First**: `lib/features/<feature>/...`
- **Layer-First**: `lib/domain|data|ui/<feature>/...`

Y la fuente del modo:
- **auto-detect**: Detectado automáticamente
- **override**: Configurado manualmente por el usuario
- **default**: Configuración global por defecto

### ✅ Monorepos Melos

En monorepos, el preview muestra:
- **App seleccionada**: `📦 App: mobile_app`
- **Paths relativos**: Relativos a la raíz de la app, no del monorepo

### ✅ Validaciones

El preview se muestra **después** de todas las validaciones:
- ✅ Directorio válido
- ✅ Nombre de feature válido
- ✅ Feature no existe (para Create Feature)
- ✅ Feature existe (para Create Use Case)

Si alguna validación falla, **no se muestra el preview**.

---

## 🚀 Beneficios

### Para Desarrolladores

1. **Confianza**: Sabes exactamente qué se va a crear
2. **Control**: Puedes cancelar si algo no se ve bien
3. **Aprendizaje**: Entiendes mejor la estructura generada
4. **Prevención**: Evitas errores antes de que sucedan

### Para Equipos

1. **Transparencia**: Todos ven lo mismo antes de confirmar
2. **Consistencia**: Verificación visual de la estructura
3. **Documentación viva**: El preview sirve como referencia

### Para Proyectos

1. **Seguridad**: No se crean archivos por error
2. **Orden**: Confirmas la estructura antes de comprometerte
3. **Reversibilidad**: Fácil cancelar sin limpiar el filesystem

---

## 💡 Tips y Mejores Prácticas

### ✅ Usa el preview para

- **Validar el modo**: Asegúrate de que sea Feature-First o Layer-First según prefieras
- **Verificar la app**: En monorepos, confirma que seleccionaste la app correcta
- **Contar archivos**: Si te parece demasiado o muy poco, revisa tu input
- **Aprender**: Si eres nuevo, lee los paths para entender la estructura

### ⚙️ Configura según tu workflow

- **Desarrollador nuevo**: Mantén `preview.enabled: true` para aprender
- **Desarrollador experto**: Puedes deshabilitarlo para ir más rápido
- **Trabajo en equipo**: Mantén habilitado para transparencia
- **Proyectos grandes**: Aumenta `maxItems` si necesitas ver más

### 📊 Monitorea los logs

Revisa el Output Channel ocasionalmente:
- Ver qué comandos se ejecutan
- Detectar si se cancela con frecuencia (puede indicar confusión)
- Confirmar que el preview funciona correctamente

---

## 🆘 Troubleshooting

### ❓ No se muestra el preview

**Posibles causas:**
1. `dartCleanArch.preview.enabled: false` → Habilítalo en settings
2. Error de validación previo → Revisa mensajes de error anteriores
3. Bug de la extensión → Revisa el Output Channel y reporta

### ❓ Preview truncado con "... y N más"

**Causa:**
- Total de items supera `dartCleanArch.preview.maxItems`

**Solución:**
- Aumenta el límite en settings: `"dartCleanArch.preview.maxItems": 500`

**Nota:** Todos los items se crearán al confirmar, solo el preview está truncado.

### ❓ Paths incorrectos en el preview

**Causa:**
- Bug en cálculo de paths relativos

**Solución:**
- Reportar el issue con:
  - Estructura de tu proyecto
  - Comando ejecutado
  - Preview mostrado vs esperado

---

## 📞 Soporte

Si encuentras problemas con el preview:

1. **Revisa el Output Channel**: `View` > `Output` > "Dart Clean Architecture"
2. **Verifica tu configuración**: `dartCleanArch.preview.*` en settings
3. **Reporta el issue**: https://github.com/chiuchiolo30/vscode-extension-arq-hex/issues

Incluye:
- Screenshot del preview
- Configuración de settings
- Logs del Output Channel
- Estructura de tu proyecto (sanitizada)

---

**Versión del documento**: 1.0  
**Fecha**: Diciembre 2025  
**Compatible con**: Dart Clean Architecture Extension v1.2.0+
