<a href="https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex">
  <img src="https://dart-clean-architecture-banner-v.vercel.app" width="100%">
</a>
<p align="left">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-purple.svg" alt="License">
  </a>
  <a href="https://github.com/chiuchiolo30/vscode-extension-arq-hex/actions/workflows/pipeline.yaml">
    <img src="https://github.com/chiuchiolo30/vscode-extension-arq-hex/actions/workflows/pipeline.yaml/badge.svg" alt="CI Pipeline">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex">
    <img src="https://img.shields.io/visual-studio-marketplace/d/FlutterCleanArchitecture.dart-clena-architecture-hex?label=downloads&color=blue" alt="Downloads">
  </a>
</p>

**Stop writing Flutter boilerplate by hand.**  
Generate production-ready Clean Architecture in seconds — from the Command Palette or directly with Copilot & AI agents.  
Built for scalable Flutter teams and Melos monorepos.

---

## 🎬 Demo

![Demo](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/demo.gif)

Generate a full Clean Architecture feature directly from VS Code — via the **Command Palette** or using **GitHub Copilot Chat** with AI-assisted scaffolding.

---

## 🚀 Why use this extension

Setting up Clean Architecture in Flutter means creating the same folders, files, and wiring every single time:

> entities · repositories · use cases · datasources · models · index exports · UI structure…

That's repetitive, error-prone, and inconsistent across teams.

**This extension solves that.**

| Without the extension | With the extension |
|---|---|
| Create folders manually | Structure generated instantly |
| Write boilerplate from scratch | Files created with correct naming and content |
| Risk inconsistent architecture | Consistent across every feature and every developer |
| Copy-paste across projects | One command — always correct |
| Configure Copilot manually | AI instructions generated from your actual stack |

Works for **single Flutter projects** and **large Melos monorepos**.  
Works from the **Command Palette** and from **GitHub Copilot Chat**.

---

## 🤖 AI & Copilot Chat Integration

The extension registers **6 Language Model Tools** that GitHub Copilot (and compatible AI agents) can call automatically.  
No manual steps. Just describe what you want.

| Tool | What it does |
|------|--------------|
| `dartarch_inspect_architecture` | Lists all features, use cases, and structure mode of the project or monorepo |
| `dartarch_detect_stack` | Detects state management, DI, routing, serialization, networking, and storage packages |
| `dartarch_create_feature` | Creates a blank feature with domain, data, and ui layers |
| `dartarch_create_feature_crud` | Creates a typed CRUD feature with entity, repository, and 4 use cases |
| `dartarch_create_usecase` | Adds a use case to an existing feature and updates the repository contract |
| `dartarch_generate_instructions` | Generates `.github/copilot-instructions.md` with stack-aware architecture guidance |

### Example — paste this in Copilot Chat

```
1. Inspect the monorepo architecture and list all apps.
2. Detect the technology stack for each app.
3. In menu_app, create a feature "orders" with full CRUD for the entity
   Order(id: String, customerId: String, total: double, status: String, createdAt: DateTime).
4. Add the use case "get-orders-by-customer" to the orders feature.
5. Finally, generate the AI instructions file (.github/copilot-instructions.md) in menu_app.

When done, display all completed tasks in a professional markdown table with columns: #, Task, Status, and Details.
```

Copilot executes all 5 steps autonomously — architecture inspected, CRUD feature scaffolded, use case added, and AI instructions generated. No manual input needed.

---

## ✨ Key Features

### 🏗️ Complete Architecture Generation

Generate the full layer structure in one command.

- Domain layer — entities, repositories (abstract), use cases
- Data layer — repository implementation, models, datasources
- UI layer — bloc structure, screens, widgets
- Automatic `index.dart` barrel exports for every layer

### 🧩 Typed CRUD Scaffolding

Define your entity once. Get the full CRUD wired up automatically.

- Typed entity class with `copyWith`, equality, and `toString`
- Abstract repository contract with typed CRUD signatures
- 4 use cases: `create`, `read`, `update`, `delete`
- Repository implementation skeleton ready to fill in

### 🔍 Generation Preview

See exactly what will be created **before confirming**.

- Dedicated WebviewPanel — fixed header, scrollable body, fixed footer
- Buttons always visible even with 500+ items in the list
- Summary: command, app, feature, structure mode and detection source
- **"Confirm & Disable Preview"** — skip future previews in one click
- Configurable item limit (`dartCleanArch.preview.maxItems`, default: 200)

[→ Preview Feature Guide](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/PREVIEW_FEATURE_GUIDE.md)

### 📊 Intelligent Status Bar

Real-time context at the bottom of VS Code.

```
$(file-code) DCA: menu_app | Feature-First | 👁️ Preview ON
```

- Single project: shows structure mode and preview state
- Monorepo: auto-detects the active app from your open file
- Click → Quick Pick menu with all configuration options
- Updates automatically when you switch files or change settings

### 🧠 Architecture Inspection & Stack Detection

Understand any project instantly — no external tools needed.

- Lists all features and their use cases as a formatted tree
- Detects structure mode with source (auto-detect / override / default)
- Identifies your technology stack across 8 categories:

| Category | Detected packages |
|---|---|
| State Management | bloc, flutter_bloc, riverpod, provider, mobx, get |
| Dependency Injection | get_it, injectable |
| Routing | go_router, auto_route, beamer |
| Serialization | freezed, json_serializable, built_value |
| Networking | dio, http, retrofit, chopper |
| Local Storage | hive, drift, sqflite, isar, shared_preferences |
| Forms | formz, reactive_forms |
| Testing | mocktail, mockito, bloc_test |

### 📝 AI Instructions Generator

Generate a `.github/copilot-instructions.md` file tailored to your project.

- Stack-aware: guidance specific to your detected packages
- Documents your Clean Architecture rules and naming conventions
- Per-app support inside Melos monorepos
- Keeps every AI assistant aligned with your architecture from day one

### 🚀 Melos Monorepo Support

Full support for Flutter monorepos using Melos.

- Automatic detection of Melos projects (v6 and v7+)
- Intelligent app selector — filters only valid Flutter apps
- Each app maintains its own structure mode independently
- Status bar reflects the active app based on your open file

[→ Melos Guide](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/MELOS_GUIDE.md)

---

## 🎯 Use Cases

- **Bootstrap a new Flutter project** with the right architecture from the first feature
- **Standardize architecture across teams** — everyone generates the same structure
- **Accelerate feature development** — remove the scaffolding bottleneck
- **Scale Melos monorepos** — manage multiple apps with independent structure modes
- **Let AI scaffold your architecture** — Copilot creates real files, not just suggestions
- **Onboard AI assistants** — generate accurate instructions so Copilot knows your stack and conventions

---

## 📦 Installation

1. Open **Visual Studio Code**
2. Go to **Extensions** (`Ctrl + Shift + X`)
3. Search for: `Dart Clean Architecture - Arq. Hex`
4. Click **Install**

→ [Open in VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex)

---

## 📖 Quick Usage

Open the command palette with `Ctrl + Shift + P` and run any of these commands:

| Command | Description |
|---|---|
| `Clean Architecture: Create Feature` | Create a blank feature with domain, data, and ui layers |
| `Clean Architecture: Create Feature with CRUD` | Scaffold a typed CRUD feature with entity and 4 use cases |
| `Clean Architecture: Create Use Case` | Add a use case to an existing feature |
| `Clean Architecture: Set project structure mode` | Switch between Feature-First and Layer-First |
| `Clean Architecture: Toggle preview before generation` | Enable or disable the generation preview |
| `Clean Architecture: Show architecture info` | Inspect features, use cases, and technology stack |
| `Clean Architecture: Generate AI instructions` | Generate `.github/copilot-instructions.md` |

---

## 🏗️ Structure Modes

### Feature-First *(default)*

All layers for a feature live together.

```
lib/
└── features/
    └── orders/
        ├── domain/
        │   ├── entities/
        │   ├── repositories/
        │   └── usecases/
        ├── data/
        │   ├── datasources/
        │   ├── models/
        │   └── repositories/
        └── ui/
            ├── blocs/
            ├── screens/
            └── widgets/
```

Best for: small to medium projects, easy feature removal, high cohesion per feature.

---

### Layer-First

All features grouped by architectural layer.

```
lib/
├── domain/
│   └── orders/
├── data/
│   └── orders/
└── ui/
    └── orders/
```

Best for: large projects with 20+ features, cross-feature code reuse, larger teams.

---

### Automatic Detection

The extension detects which mode your project uses:

1. `lib/features/` exists → **Feature-First**
2. `lib/domain/`, `lib/data/` or `lib/ui/` exist → **Layer-First**
3. Neither found → defaults to **Feature-First**
4. Both detected → prompts you to choose

You can also override the mode manually at any time.

[→ Structure Modes Guide](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/STRUCTURE_MODES_GUIDE.md)

---

## 🧠 Workflows

### Via Command Palette

1. Press `Ctrl + Shift + P`
2. Run: `Clean Architecture: Create Feature with CRUD`
3. Enter the feature name and entity details
4. Review the preview — inspect every file before anything is written
5. Click **Confirm**

![Command Palette workflow](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview.gif)

---

### Via Copilot Chat

1. Open Copilot Chat in **Agent mode**
2. Paste the prompt from the [AI Integration section](#-ai--copilot-chat-integration)
3. Copilot calls the tools, creates the files, and reports back

![AI-assisted workflow](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/demo.gif)

---

## 🎥 More Examples

### Create Feature

![Create Feature](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview-3.gif)

### Create Use Case

![Create Use Case](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview-2.gif)

---

## 🤝 Contributing

Contributions are welcome — issues, suggestions, and pull requests.

→ [GitHub Repository](https://github.com/chiuchiolo30/vscode-extension-arq-hex)

---

## ⭐ Support the project

If this extension helps your team, consider:

- Leaving a **review on the VS Code Marketplace**
- Giving the repository a **star on GitHub**
- Sharing it with your team or community

Your feedback directly shapes the roadmap.

---

## 📄 License

MIT — [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)
