# Guía de Modos de Estructura - Feature-First vs Layer-First

Esta guía explica en detalle los dos modos de estructura soportados por la extensión Dart Clean Architecture.

## 📚 Índice

- [¿Qué son los modos de estructura?](#qué-son-los-modos-de-estructura)
- [Feature-First](#feature-first)
- [Layer-First](#layer-first)
- [Comparación](#comparación)
- [Detección Automática](#detección-automática)
- [Configuración Manual](#configuración-manual)
- [Casos de Uso](#casos-de-uso)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué son los modos de estructura?

Los modos de estructura definen **cómo se organizan las carpetas** en tu proyecto Flutter siguiendo Clean Architecture. Ambos modos respetan los principios de Clean Architecture (separación de capas, independencia de frameworks, etc.), pero difieren en la organización física de archivos.

---

## 📦 Feature-First

### Concepto

**Agrupa todo el código relacionado con una funcionalidad en una carpeta.**

Cada feature contiene sus propias subcarpetas de `domain`, `data` y `ui`.

### Estructura

```
lib/
  features/
    authentication/              # Feature de autenticación
      domain/
        entities/
          user.dart
        repositories/
          auth_repository.dart
        usecases/
          login.usecase.dart
          logout.usecase.dart
      data/
        datasources/
          auth_remote_datasource.dart
        models/
          user_model.dart
        repositories/
          auth_repository_impl.dart
      ui/
        screens/
          login_screen.dart
        widgets/
          login_form.dart
        blocs/
          auth_bloc.dart
      index.dart                 # Exporta toda la feature
    
    products/                    # Feature de productos
      domain/
      data/
      ui/
      index.dart
```

### Ventajas

✅ **Cohesión alta**: Todo lo relacionado con una feature está en un solo lugar  
✅ **Fácil navegación**: No necesitas saltar entre carpetas para trabajar en una feature  
✅ **Borrado simple**: Eliminar una feature = eliminar una carpeta  
✅ **Modularización natural**: Fácil extraer una feature a un paquete separado  
✅ **Onboarding rápido**: Nuevos developers entienden rápido dónde está cada cosa  

### Desventajas

⚠️ **Reutilización limitada**: Difícil compartir código entre features de la misma capa  
⚠️ **Duplicación posible**: Puede haber código duplicado en distintas features  
⚠️ **Menos escalable**: En proyectos muy grandes, puede haber muchas features de nivel raíz  

### Cuándo usar Feature-First

- ✅ Proyectos **pequeños a medianos** (< 20 features)
- ✅ Features **relativamente independientes**
- ✅ Equipos trabajando en **features específicas**
- ✅ Necesitas **modularizar** fácilmente en el futuro
- ✅ Prioridad en **velocidad de desarrollo**

---

## 🏗️ Layer-First

### Concepto

**Agrupa el código por capas arquitectónicas.**

Cada capa (`domain`, `data`, `ui`) contiene todas las features del proyecto.

### Estructura

```
lib/
  domain/                        # Capa de dominio (lógica de negocio)
    authentication/
      entities/
        user.dart
      repositories/
        auth_repository.dart
      usecases/
        login.usecase.dart
        logout.usecase.dart
    products/
      entities/
        product.dart
      repositories/
        product_repository.dart
      usecases/
        get_products.usecase.dart
  
  data/                          # Capa de datos (implementaciones)
    authentication/
      datasources/
        auth_remote_datasource.dart
      models/
        user_model.dart
      repositories/
        auth_repository_impl.dart
    products/
      datasources/
      models/
      repositories/
  
  ui/                            # Capa de presentación
    authentication/
      screens/
        login_screen.dart
      widgets/
        login_form.dart
      blocs/
        auth_bloc.dart
    products/
      screens/
      widgets/
      blocs/
```

### Ventajas

✅ **Separación clara de capas**: Fácil ver qué pertenece a cada capa  
✅ **Reutilización**: Compartir código entre features de la misma capa es natural  
✅ **Escalabilidad**: Soporta proyectos grandes con muchas features  
✅ **Equipos especializados**: Ideal si tienes equipos por capa (backend, frontend, lógica)  
✅ **Testing por capas**: Más fácil hacer test suites por capa  

### Desventajas

⚠️ **Navegación compleja**: Necesitas saltar entre `domain/`, `data/`, `ui/` frecuentemente  
⚠️ **Acoplamiento indirecto**: Cambiar una feature requiere tocar múltiples carpetas  
⚠️ **Onboarding lento**: Nuevos developers tardan más en entender la estructura  
⚠️ **Borrado complejo**: Eliminar una feature = borrar en 3 lugares distintos  

### Cuándo usar Layer-First

- ✅ Proyectos **grandes y complejos** (> 20 features)
- ✅ Features **fuertemente interconectadas**
- ✅ Equipos **especializados por capa** (arquitectura, backend, UI)
- ✅ Necesitas **máxima reutilización** entre features
- ✅ Prioridad en **mantenibilidad a largo plazo**

---

## 📊 Comparación

| Característica | Feature-First | Layer-First |
|---------------|---------------|-------------|
| **Organización** | Por funcionalidad | Por capas |
| **Cohesión** | Alta (feature) | Alta (capa) |
| **Acoplamiento** | Bajo entre features | Bajo entre capas |
| **Navegación** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Buena |
| **Reutilización** | ⭐⭐⭐ Limitada | ⭐⭐⭐⭐⭐ Excelente |
| **Escalabilidad** | ⭐⭐⭐⭐ Buena | ⭐⭐⭐⭐⭐ Excelente |
| **Curva aprendizaje** | ⭐⭐⭐⭐⭐ Fácil | ⭐⭐⭐ Media |
| **Modularización** | ⭐⭐⭐⭐⭐ Fácil | ⭐⭐⭐ Compleja |
| **Testing** | Por feature | Por capa |

---

## 🔍 Detección Automática

La extensión detecta automáticamente el modo usado en tu proyecto:

### Reglas de Detección

1. **Si existe `lib/features/`** → Feature-First
2. **Si existe `lib/domain/`, `lib/data/` o `lib/ui/`** → Layer-First
3. **Si existen ambas** → Ambiguo (pregunta al usuario)
4. **Si no existe ninguna** → Feature-First (por defecto)

### Ejemplo: Proyecto nuevo

```
lib/
  main.dart
```

**Resultado**: Se usa **Feature-First** (default)

### Ejemplo: Proyecto Feature-First existente

```
lib/
  features/
    authentication/
  main.dart
```

**Resultado**: Se detecta **Feature-First** ✅

### Ejemplo: Proyecto Layer-First existente

```
lib/
  domain/
    authentication/
  data/
  ui/
  main.dart
```

**Resultado**: Se detecta **Layer-First** ✅

### Ejemplo: Proyecto ambiguo

```
lib/
  features/          # ⚠️ Tiene Feature-First
    old_module/
  domain/            # ⚠️ También tiene Layer-First
    new_module/
  main.dart
```

**Resultado**: **Ambiguo** → La extensión pregunta cuál usar

---

## ⚙️ Configuración Manual

### Comando: Set Project Structure Mode

Para configurar manualmente el modo:

1. Abre Command Palette: `Ctrl+Shift+P` (Win/Linux) o `Cmd+Shift+P` (Mac)
2. Escribe: `Dart Clean Architecture: Set project structure mode`
3. Selecciona:
   - **📦 Feature-First** → Usar Feature-First
   - **🏗️ Layer-First** → Usar Layer-First
   - **🔄 Auto (detectar automáticamente)** → Limpiar configuración manual

### Dónde se guarda

La configuración se almacena en **workspaceState** de VSCode:

- **Proyecto normal**: Se guarda para el workspace actual
- **Monorepo Melos**: Se guarda **por app** (cada app puede tener su propio modo)

### Configuración en settings.json

Puedes ajustar el comportamiento global:

```json
{
  // Modo por defecto cuando no se puede detectar
  "dartCleanArch.structure.mode": "featureFirst",
  
  // Habilitar/deshabilitar detección automática
  "dartCleanArch.structure.autoDetect": true,
  
  // Preguntar cuando hay ambigüedad
  "dartCleanArch.structure.promptOnAmbiguous": true
}
```

### Prioridad de decisión

La extensión decide el modo en este orden:

1. **Override manual** (comando "Set project structure mode")
2. **Detección automática** (si `autoDetect` = true)
3. **Configuración por defecto** (`dartCleanArch.structure.mode`)

---

## 💼 Casos de Uso

### Caso 1: Proyecto nuevo - Feature-First

**Escenario**: Empiezas un proyecto desde cero

**Acción**: Nada. Feature-First es el default.

**Resultado**:
```
lib/
  features/
    authentication/
      domain/
      data/
      ui/
```

---

### Caso 2: Proyecto nuevo - Layer-First

**Escenario**: Prefieres Layer-First desde el inicio

**Acción**: 
1. Ejecuta: `Set project structure mode`
2. Selecciona: `🏗️ Layer-First`

**Resultado**:
```
lib/
  domain/
    authentication/
  data/
    authentication/
  ui/
    authentication/
```

---

### Caso 3: Migración de Feature-First a Layer-First

**Escenario**: Tienes un proyecto Feature-First pero creció mucho

**Acción**:
1. **Manualmente**, reorganiza los archivos a Layer-First
2. Ejecuta: `Set project structure mode` → `🏗️ Layer-First`

**Nota**: La extensión NO migra automáticamente. Debes reorganizar manualmente.

---

### Caso 4: Monorepo con apps mixtas

**Escenario**: Tienes 2 apps, una usa Feature-First y otra Layer-First

**Acción**:
1. Selecciona `app1`
2. Ejecuta: `Set project structure mode` → `📦 Feature-First`
3. Selecciona `app2`
4. Ejecuta: `Set project structure mode` → `🏗️ Layer-First`

**Resultado**: Cada app usa su propio modo ✅

---

## ❓ Preguntas Frecuentes

### ¿Puedo cambiar de modo después de crear features?

Sí, pero **debes reorganizar manualmente** los archivos. La extensión no hace migración automática.

### ¿Se puede usar Feature-First en un proyecto grande?

Sí, pero Layer-First escala mejor. Depende de tu equipo y necesidades.

### ¿Qué pasa si tengo ambos estilos (estructura ambigua)?

Si `promptOnAmbiguous` = true, la extensión te pregunta cuál usar. Si false, usa Feature-First.

### ¿Cómo sé qué modo está activo?

Al crear una feature/usecase, la extensión muestra un mensaje con el modo usado:
```
✅ Feature creada exitosamente
🏗️ Modo: Feature-First
```

### ¿El modo afecta el código generado?

No. Solo afecta **dónde** se crean los archivos. El contenido es el mismo.

### ¿Funciona con Melos?

Sí. Cada app en el monorepo puede tener su propio modo.

---

## 📚 Recursos Adicionales

- [README.md](README.md) - Documentación principal
- [MELOS_GUIDE.md](MELOS_GUIDE.md) - Guía de Monorepos Melos
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**¿Dudas o sugerencias?** Abre un issue en [GitHub](https://github.com/chiuchiolo30/vscode-extension-arq-hex/issues)
