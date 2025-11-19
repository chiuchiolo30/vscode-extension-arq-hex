# Technical Overview - Extensión Clean Architecture

## 📐 Arquitectura del Código

Este documento describe la arquitectura técnica de la extensión.

---

## 🏗️ Estructura de Directorios

```
src/
├── commands/                    # Comandos de la extensión
│   ├── base/
│   │   └── BaseCommand.ts      # Clase base abstracta
│   ├── CommandManager.ts        # Orquestador de comandos
│   ├── CreateFeatureCommand.ts
│   ├── CreateFeatureWithCrudCommand.ts
│   └── CreateUseCaseCommand.ts
│
├── generators/                  # Generadores de código
│   ├── FeatureStructureGenerator.ts
│   ├── TemplateGenerator.ts
│   └── UseCaseGenerator.ts
│
├── helpers/                     # Utilidades auxiliares
│   ├── FileSystemHelper.ts
│   ├── WorkspaceHelper.ts
│   └── MelosHelper.ts          # ✨ Nuevo: Gestión de Melos
│
├── utils/                       # Transformaciones
│   └── StringTransformer.ts
│
├── validators/                  # Validadores
│   ├── InputValidator.ts
│   └── ProjectValidator.ts     # ✨ Actualizado con Melos
│
└── extension.ts                 # Punto de entrada
```

---

## 🎯 Patrones de Diseño Utilizados

### 1. **Command Pattern**
- Cada comando hereda de `BaseCommand`
- Implementa `getId()` y `execute()`
- Desacopla la invocación de la ejecución

### 2. **Template Method Pattern**
- `BaseCommand` define el flujo común
- `resolveWorkingDirectory()` es el template method
- Subclases implementan lógica específica

### 3. **Strategy Pattern**
- `TemplateGenerator` encapsula estrategias de generación
- Diferentes estrategias para CRUD vs sin CRUD

### 4. **Facade Pattern**
- `MelosHelper` actúa como facade para operaciones Melos
- Simplifica la interacción con monorepos

---

## 🔄 Flujo de Ejecución

### Comando: Create Feature

```
User Invokes Command
        ↓
CommandManager.registerCommands()
        ↓
CreateFeatureCommand.execute()
        ↓
┌─────────────────────────────────┐
│ BaseCommand.resolveWorkingDirectory() │
│   ├── getCurrentDirectory()           │
│   ├── findMelosRoot() [Nuevo]         │
│   │   ├── isMelosProject()            │
│   │   └── handleMelosWorkspace()      │
│   │       ├── isInsideMelosPackage()  │
│   │       ├── getMelosPackages()      │
│   │       └── showPackageSelector()   │
│   └── return workingDir              │
└─────────────────────────────────┘
        ↓
FeatureStructureGenerator.createFeature()
        ↓
   Create Directories
   Create Index Files
   Create CRUD Files (optional)
        ↓
   Success Message
```

---

## 🧩 Componentes Clave

### BaseCommand

**Responsabilidad:** Proporcionar funcionalidad común a todos los comandos.

**Métodos importantes:**
- `resolveWorkingDirectory()`: Detecta y resuelve el directorio de trabajo
- `handleMelosWorkspace()`: Gestiona la selección de paquetes en Melos
- `showInputBox()`, `showQuickPick()`: Interacción con usuario

### MelosHelper

**Responsabilidad:** Gestionar la interacción con monorepos Melos.

**Métodos importantes:**
- `getMelosPackages()`: Obtiene todos los paquetes del monorepo
- `extractPackagePaths()`: Lee y parsea `melos.yaml`
- `findPackagesInPath()`: Resuelve wildcards y busca paquetes
- `showPackageSelector()`: Muestra UI para selección
- `validatePackageForFeatures()`: Valida estructura del paquete

**Algoritmo de búsqueda:**
1. Leer `melos.yaml`
2. Extraer paths (soporta wildcards como `apps/*`)
3. Para cada path:
   - Si contiene `*`, listar directorios
   - Buscar `pubspec.yaml` en cada uno
   - Verificar si es Flutter package
4. Filtrar y ordenar resultados

### ProjectValidator

**Responsabilidad:** Validar estructura de proyectos.

**Métodos importantes:**
- `findMelosRoot()`: Busca recursivamente hacia arriba
- `isInsideMelosPackage()`: Determina contexto actual
- `isMelosProject()`: Verifica existencia de `melos.yaml`
- `isFlutterProject()`: Verifica existencia de `pubspec.yaml`

---

## 🔧 Transformaciones de Nombres

La clase `StringTransformer` maneja todas las conversiones:

| Input | transformInput() | transformOutput() | toCamelCase() | toPascalCase() |
|-------|------------------|-------------------|---------------|----------------|
| `MyFeature` | `my_feature` | `MyFeature` | `myFeature` | `MyFeature` |
| `user_auth` | `user_auth` | `UserAuth` | `userAuth` | `UserAuth` |
| `get-users` | `get-users` | `GetUsers` | `getUsers` | `GetUsers` |

**Uso:**
- **Archivos/directorios:** `transformInput()` → snake_case
- **Clases:** `transformOutput()` o `toPascalCase()` → PascalCase
- **Métodos:** `toCamelCase()` → camelCase

---

## 🧪 Testing

### Estructura de Tests

```
src/test/suite/
├── extension.test.ts                  # Tests generales
├── melosHelper.test.ts               # Tests MelosHelper
└── projectValidator.melos.test.ts    # Tests ProjectValidator Melos
```

### Ejecutar Tests

```bash
npm test
```

---

## 📦 Dependencias Clave

```json
{
  "@types/vscode": "^1.77.0",     // API de VS Code
  "typescript": "^4.9.5",          // Lenguaje
  "mocha": "^10.2.0",              // Framework de tests
  "eslint": "^8.36.0"              // Linting
}
```

---

## 🚀 Extensibilidad

### Agregar un Nuevo Comando

1. **Crear clase de comando:**
```typescript
export class MyNewCommand extends BaseCommand {
    getId(): string {
        return 'flutter-arq-hex.myNewCommand';
    }

    async execute(): Promise<void> {
        const workingDir = await this.resolveWorkingDirectory();
        // Tu lógica aquí
    }
}
```

2. **Registrar en CommandManager:**
```typescript
private commands = [
    new CreateFeatureCommand(),
    new MyNewCommand()  // ← Agregar aquí
];
```

3. **Actualizar package.json:**
```json
{
  "contributes": {
    "commands": [
      {
        "command": "flutter-arq-hex.myNewCommand",
        "title": "Clean Architecture - My New Command"
      }
    ]
  }
}
```

---

## 🐛 Debugging

### VS Code Launch Configuration

```json
{
  "type": "extensionHost",
  "request": "launch",
  "name": "Launch Extension",
  "runtimeExecutable": "${execPath}",
  "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
}
```

### Logging

Todos los errores se registran en la consola de desarrollador:
- `Ctrl+Shift+I` (Windows/Linux)
- `Cmd+Option+I` (Mac)

---

## 📊 Métricas de Calidad

| Métrica | Valor |
|---------|-------|
| Líneas de código | ~3000 |
| Archivos TypeScript | 15 |
| Cobertura de tests | ~30% |
| Complejidad ciclomática | Baja-Media |

---

## 🔮 Mejoras Futuras

1. **Testing:**
   - Aumentar cobertura al 80%+
   - Tests de integración con proyectos mock
   - Tests E2E

2. **Funcionalidad:**
   - Soporte para otros gestores de monorepo (Nx, Turborepo)
   - Templates personalizables
   - Snippets de código

3. **UX:**
   - Progress bars para operaciones largas
   - Preview de estructura antes de crear
   - Undo/Redo para comandos

4. **Performance:**
   - Caché de paquetes Melos
   - Lazy loading de comandos
   - Operaciones asíncronas optimizadas

---

## 📚 Referencias

- [VS Code Extension API](https://code.visualstudio.com/api)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Melos Documentation](https://melos.invertase.dev/)
