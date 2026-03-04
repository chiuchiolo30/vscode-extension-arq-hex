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

Generate a complete **Clean Architecture (Hexagonal Architecture)** structure for **Flutter/Dart projects** automatically.

⚡ Create features in seconds  
⚡ Maintain a consistent architecture across your project  
⚡ Full support for **Melos Monorepos**

---

# 🎬 Demo

![Preview](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview.gif)

Generate a full Clean Architecture feature directly from VS Code in seconds.

---

# 🚀 Why this extension

Implementing Clean Architecture in Flutter usually requires creating a significant amount of boilerplate:

- folders
- repositories
- entities
- use cases
- datasources
- models
- UI structure

This extension automates the entire process, allowing teams to focus on **business logic instead of manual project setup**.

It ensures a **consistent architecture across teams and projects**, reducing setup time and avoiding structural mistakes.

---

# ✨ Key Features

## 🔍 Generation Preview (NEW)

Preview the structure **before files are created**.

- Full preview of folders and files
- Generation summary (number of folders and files)
- Context information (feature name, structure mode)
- Safe confirmation before generating
- Option to enable or disable preview

Documentation:  
[Preview Feature Guide](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/PREVIEW_FEATURE_GUIDE.md)

---

## 🏗️ Two Structure Modes

Supports the two most common Clean Architecture project structures.

### Feature-First (default)

Organize code by feature.

```
lib/
└── features/
    └── <feature>/
        ├── domain/
        ├── data/
        └── ui/
```

Advantages:

- Easy to navigate
- All feature logic in one place
- Easy to remove features
- Ideal for small and medium projects

---

### Layer-First

Organize code by architectural layers.

```
lib/
├── domain/
│   └── <feature>/
├── data/
│   └── <feature>/
└── ui/
    └── <feature>/
```

Advantages:

- Clear separation of layers
- Better for large projects
- Easier reuse across features
- Suitable for larger teams

---

### Automatic Detection

The extension automatically detects your project structure:

1. Detects **Feature-First** if `lib/features/` exists
2. Detects **Layer-First** if `lib/domain`, `lib/data` or `lib/ui` exist
3. Defaults to **Feature-First** in new projects
4. Prompts the user if both styles are detected

You can also manually configure the structure mode.

---

## ⚡ Automatic Architecture Generation

Generate complete architecture structures instantly.

Includes:

- Domain layer
- Data layer
- UI layer
- Entities
- Repositories
- Use cases
- Datasources
- Models
- Bloc structure
- Screens
- Widgets
- Automatic `index.dart` exports

---

## 🧩 CRUD Feature Generation

Generate full CRUD features automatically.

Includes:

- Create
- Read
- Update
- Delete

All following Clean Architecture principles.

---

## 🚀 Melos Monorepo Support

Full support for **Flutter monorepos using Melos**.

Features:

- Automatic detection of Melos projects
- Intelligent app selector
- Filters only valid Flutter apps
- Each app can have its own structure mode
- Works seamlessly inside large monorepos

Documentation:  
[Melos Guide](https://github.com/chiuchiolo30/vscode-extension-arq-hex/blob/master/MELOS_GUIDE.md)

---

# 📦 Installation

1. Open **Visual Studio Code**
2. Go to **Extensions** (`Ctrl + Shift + X`)
3. Search for: `Dart Clean Architecture - Arq. Hex`
4. Click **Install**

Marketplace page:

https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex

---

# 📖 Quick Usage

Open the command palette: `Ctrl + Shift + P`

Available commands:

| Command | Description |
|--------|-------------|
| Clean Architecture: Create Feature | Create a basic feature |
| Clean Architecture: Create Feature with CRUD | Generate a complete CRUD feature |
| Clean Architecture: Create Use Case | Add a use case to an existing feature |
| Clean Architecture: Set project structure mode | Switch between Feature-First or Layer-First |
| Clean Architecture: Toggle preview before generation | Enable or disable preview |

---

# 🧠 Example Workflow

1. Open the command palette
`Ctrl + Shift + P`

2. Run: `Create Feature with CRUD`

3. Enter the feature name.

4. Review the preview.

5. Confirm generation.

The extension generates the complete architecture automatically.

---

# 📂 Example Generated Structure

```
lib/
└── features/
    └── notifications/
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


---

# 🎥 Examples

## Create Feature

![Create Feature](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview-3.gif)

---


## Create Use Case

![Create Use Case](https://raw.githubusercontent.com/chiuchiolo30/vscode-extension-arq-hex/master/assets/preview-2.gif)

---

# 🤝 Contributing

Contributions are welcome.

If you have suggestions, improvements, or bug reports, feel free to open an issue or submit a pull request.

Repository:

https://github.com/chiuchiolo30/vscode-extension-arq-hex

---

# ⭐ Support the project

If this extension helps you, consider:

- Leaving a **review on the VS Code Marketplace**
- Giving the repository a **GitHub star**
- Sharing it with your team

Your feedback helps improve the project and support future development.

---

# 📄 License

This project is licensed under the **MIT License**.

https://opensource.org/licenses/MIT
