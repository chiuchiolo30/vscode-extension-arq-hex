# Guía de Uso - Soporte para Melos

## 🎯 Flujo de Trabajo con Monorepos Melos

Esta guía explica cómo la extensión maneja proyectos con **Melos monorepo**.

---

## 📋 Escenarios de Uso

### Escenario 1: Proyecto Flutter Normal (Sin Melos)

```
mi_proyecto/
├── lib/
├── test/
└── pubspec.yaml
```

**Comportamiento:** La extensión funciona normalmente, creando la feature en `lib/features/`.

---

### Escenario 2: Monorepo Melos - Desde Raíz

```
mi_monorepo/
├── melos.yaml
├── packages/
│   ├── core/
│   │   └── pubspec.yaml
│   └── shared/
│       └── pubspec.yaml
└── apps/
    ├── mobile_app/
    │   ├── lib/
    │   └── pubspec.yaml
    └── admin_app/
        ├── lib/
        └── pubspec.yaml
```

**Comportamiento:**
1. Detecta que estás en un monorepo Melos
2. Escanea todos los paquetes definidos en `melos.yaml`
3. Filtra solo los paquetes Flutter (que tienen dependencia de Flutter)
4. Muestra un selector con opciones:
   ```
   📱 mobile_app (apps/mobile_app)
   📱 admin_app (apps/admin_app)
   ```
5. Crea la feature en el paquete seleccionado

---

### Escenario 3: Monorepo Melos - Desde un Paquete

Si ejecutas el comando **desde dentro** de `apps/mobile_app/`:

**Comportamiento:**
1. Detecta que estás dentro de un paquete del monorepo
2. Pregunta: *"¿Deseas usar el paquete actual? (mobile_app)"*
   - **Sí:** Usa `mobile_app` directamente
   - **No, seleccionar otro paquete:** Muestra el selector completo

---

## 🔧 Configuración de melos.yaml

La extensión lee automáticamente la configuración de `melos.yaml`:

```yaml
name: mi_monorepo

packages:
  - apps/*
  - packages/*
```

También soporta paths específicos:

```yaml
name: mi_monorepo

packages:
  - apps/mobile_app
  - apps/admin_app
  - packages/core
  - packages/shared
```

---

## ✅ Requisitos para Paquetes

Para que un paquete sea elegible:

1. Debe tener un archivo `pubspec.yaml`
2. Debe tener dependencias de Flutter (`sdk: flutter`)
3. Debe tener un directorio `lib/`

---

## 🎬 Ejemplo de Uso

### Comando: "Clean Architecture - Create feature with CRUD"

#### En un proyecto normal:
```
Input: "authentication"
Output: lib/features/authentication/ con estructura completa
```

#### En un monorepo Melos:
```
1. Selector aparece:
   📱 mobile_app (apps/mobile_app)
   📱 admin_app (apps/admin_app)

2. Seleccionas: mobile_app

3. Input: "authentication"

4. Output: apps/mobile_app/lib/features/authentication/ con estructura completa

5. Mensaje: "Feature 'authentication' con CRUD creada exitosamente en x:/monorepo/apps/mobile_app"
```

---

## 🐛 Solución de Problemas

### "No se encontraron paquetes Flutter en el monorepo"

**Causa:** Ningún paquete tiene dependencias de Flutter.

**Solución:** Verifica que tus paquetes tengan en `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
```

### "El paquete seleccionado no tiene una estructura válida"

**Causa:** El paquete no tiene el directorio `lib/`.

**Solución:** Crea el directorio `lib/` en el paquete seleccionado.

---

## 🚀 Características Avanzadas

### Detección Automática de Contexto

La extensión es inteligente y detecta:
- ✅ Si estás en la raíz del monorepo
- ✅ Si estás dentro de un paquete
- ✅ Si estás en un proyecto normal Flutter
- ✅ Si el proyecto tiene la estructura `lib/features/` creada

### Filtrado Inteligente

- Solo muestra paquetes **Flutter** (no Dart puro)
- Ordena alfabéticamente los paquetes
- Muestra la ruta relativa para fácil identificación

---

## 📝 Notas Adicionales

- Todos los comandos de la extensión soportan Melos
- La selección se puede cancelar en cualquier momento
- Los mensajes de éxito muestran la ruta completa donde se creó la feature
- Compatible con cualquier estructura de monorepo que use Melos
