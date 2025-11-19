# 📦 Guía de Publicación - v1.1.0

## ✅ Checklist Pre-Publicación

### Código
- [x] Logs de debug comentados
- [x] Compilación sin errores
- [x] CHANGELOG.md actualizado
- [ ] Testing en monorepo Melos
- [ ] Testing en app normal

### Documentación
- [x] README.md actualizado
- [x] package.json con keywords
- [x] Release notes creadas
- [x] LinkedIn post preparado
- [ ] Screenshots actualizados
- [ ] GIF demo creado

### Metadata
- [x] Versión: 1.1.0
- [x] Descripción mejorada
- [x] Keywords agregadas
- [x] Display name actualizado

---

## 🎬 Pasos para Publicar

### 1. Testing Final

```bash
# En VS Code, presiona F5 para debug
# Probar:
✓ Create Feature en app normal
✓ Create Feature en monorepo Melos
✓ Create Feature with CRUD
✓ Create Use Case
✓ Validaciones de error
✓ Mensajes con íconos
```

### 2. Capturar Screenshots

**Necesarios:**
1. Selector de apps Melos con íconos
2. Mensaje de éxito con detalles
3. Input con placeholder de ejemplo
4. Estructura de carpetas generada
5. Selector de feature para use case

**Tools recomendadas:**
- Windows: Snipping Tool o Snagit
- ScreenToGif para GIFs
- Optimizar con TinyPNG

### 3. Crear GIF Demo

**Flujo sugerido:**
```
1. Abrir proyecto Melos
2. Cmd+Shift+P → "Create Feature"
3. Selector de apps aparece
4. Seleccionar app
5. Ingresar nombre
6. Mensaje de éxito
7. Mostrar carpetas creadas
```

**Configuración ScreenToGif:**
- Frame rate: 15 fps
- Tamaño: 800x600 max
- Optimizar para web

### 4. Compilar para Producción

```bash
# Limpiar
rm -rf out/

# Compilar
npm run compile

# Verificar
ls out/
```

### 5. Publicar a Marketplace

```bash
# Instalar vsce si no lo tienes
npm install -g @vscode/vsce

# Login (necesitas Personal Access Token)
vsce login FlutterCleanArchitecture

# Empaquetar (preview)
vsce package

# Publicar
vsce publish

# O todo en uno
npm run deploy
```

### 6. Crear Release en GitHub

```bash
# Tag
git tag v1.1.0
git push origin v1.1.0

# En GitHub:
# Releases → New Release
# Tag: v1.1.0
# Title: "v1.1.0 - Melos Support + UX Improvements"
# Description: Copiar de RELEASE_NOTES_v1.1.0.md
# Attach: .vsix file
```

### 7. Publicar en LinkedIn

**Timing:**
- Mejor: Martes-Jueves, 8-10 AM
- Usar opción 2 (Post Detallado con Historia)

**Incluir:**
- 3-4 screenshots/GIFs
- Link al marketplace
- Link a GitHub
- Hashtags principales

**Engagement:**
- Responder comentarios < 2 horas
- Compartir en grupos Flutter/Dart
- Agradecer shares

### 8. Monitoreo Post-Launch

**Día 1-3:**
- Monitorear issues en GitHub
- Responder reviews en Marketplace
- Engagement en LinkedIn

**Semana 1:**
- Analizar descargas
- Recopilar feedback
- Planear próximas features

---

## 🔗 Links Importantes

### Marketplace
- Dashboard: https://marketplace.visualstudio.com/manage/publishers/FlutterCleanArchitecture
- Extension: https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clean-architecture-hex

### GitHub
- Repo: https://github.com/chiuchiolo30/vscode-extension-arq-hex
- Issues: https://github.com/chiuchiolo30/vscode-extension-arq-hex/issues
- Releases: https://github.com/chiuchiolo30/vscode-extension-arq-hex/releases

### VS Code
- Extension Development: https://code.visualstudio.com/api
- Publishing: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

---

## 📊 Métricas a Seguir

### Marketplace
- Descargas totales
- Descargas diarias
- Rating & reviews
- Instalaciones activas

### GitHub
- Stars
- Forks
- Issues abiertos
- Contributors

### LinkedIn
- Impresiones
- Engagement rate
- Clicks al link
- Compartidos

---

## 🚨 Troubleshooting

### Error: "Publisher not found"
```bash
vsce login <publisher-name>
# Ingresa tu Personal Access Token
```

### Error: "Package failed"
```bash
# Verificar package.json
# Asegurar que 'files' incluye todo
# Limpiar node_modules y reinstalar
npm ci
```

### Screenshots no se ven en Marketplace
- Verificar que están en carpeta 'images/' o 'screenshots/'
- Agregar en package.json → "files"
- Usar URLs absolutas en README

---

## ✨ Post-Publicación

### Anuncios Adicionales

**Twitter/X:**
```
🚀 Flutter Clean Architecture v1.1.0 is live!

✅ Melos Monorepo support
✅ Better UX with icons
✅ Dart conventions

Try it: [link]

#Flutter #Dart #CleanArchitecture
```

**Reddit:**
- r/FlutterDev
- r/dartlang
- Título: "Released: Flutter Clean Architecture v1.1.0 with Melos support"
- Post detallado con changelog

**Dev.to:**
- Artículo técnico sobre Clean Architecture
- Incluir cómo usar la extensión
- Tutorial paso a paso

### Próximas Versiones

**v1.2.0 Ideas:**
- [ ] Templates personalizables
- [ ] Más configuraciones
- [ ] Soporte Nx/Turborepo
- [ ] Tests integrados
- [ ] Documentation generator

---

**¿Listo para publicar? ¡Vamos! 🚀**
