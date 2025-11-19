# 🚀 Cómo Hacer un Release

## 📋 Proceso de Release

### 1. Preparación Local

```bash
# Asegurarte de estar en master y actualizado
git checkout master
git pull origin master

# Verificar que todo compile
npm run compile

# Ejecutar tests
npm test

# Verificar lint
npm run lint
```

### 2. Actualizar Versión

```bash
# Actualizar versión en package.json (ya está en 1.1.0)
# Si necesitas cambiarla:
# npm version patch  # 1.1.0 -> 1.1.1
# npm version minor  # 1.1.0 -> 1.2.0
# npm version major  # 1.1.0 -> 2.0.0
```

### 3. Commit y Push

```bash
# Agregar cambios
git add .
git commit -m "Release v1.1.0: Melos support + UX improvements"

# Push a master
git push origin master
```

### 4. Crear Release en GitHub

**Opción A: Interfaz Web**
1. Ve a: https://github.com/chiuchiolo30/vscode-extension-arq-hex/releases
2. Click en "Create a new release"
3. Tag: `v1.1.0` (crear nuevo)
4. Target: `master`
5. Release title: `v1.1.0 - Melos Support + UX Improvements`
6. Description: Copiar de `RELEASE_NOTES_v1.1.0.md`
7. Adjuntar el archivo `.vsix` (opcional)
8. Click "Publish release"

**Opción B: Git CLI**
```bash
# Crear tag
git tag -a v1.1.0 -m "Release v1.1.0: Melos support + UX improvements"

# Push tag
git push origin v1.1.0

# Luego crear release en GitHub web con ese tag
```

### 5. El Pipeline se Ejecutará Automáticamente

Una vez que publiques el release en GitHub:
- ✅ Se ejecutarán los tests en Ubuntu y Windows
- ✅ Se compilará el código
- ✅ Se empaquetará la extensión (.vsix)
- ✅ Se publicará automáticamente al VS Code Marketplace
- ✅ El archivo .vsix quedará como artifact en GitHub

### 6. Verificar Publicación

1. **Marketplace**: https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clean-architecture-hex
2. **GitHub Actions**: https://github.com/chiuchiolo30/vscode-extension-arq-hex/actions
3. Esperar ~5-10 minutos para que aparezca en Marketplace

---

## 🔧 Troubleshooting

### Error: "VSCE_PAT secret not found"

Necesitas configurar el Personal Access Token:

1. Ve a GitHub: Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Name: "VS Code Marketplace Publishing"
4. Expiration: No expiration o 1 año
5. Scopes: Marcar `Marketplace: Manage`
6. Generate token y copiarlo

En tu repo:
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `VSCE_PAT`
4. Value: [tu token]
5. Add secret

### Error: "Tests failed"

```bash
# Ejecutar tests localmente
npm test

# Si fallan, corregir y volver a commitear
```

### Error: "Version already exists"

Ya hay una versión 1.1.0 publicada:
```bash
# Incrementar versión
npm version patch
git push origin master
git push origin --tags
```

---

## 📝 Checklist Pre-Release

- [ ] Todos los tests pasan localmente
- [ ] Compilación sin errores
- [ ] CHANGELOG.md actualizado
- [ ] README.md actualizado
- [ ] Versión correcta en package.json
- [ ] Screenshots actualizados (si aplica)
- [ ] VSCE_PAT configurado en GitHub
- [ ] Probado en F5 (debug mode)

---

## 🎯 Workflow Completo

```
1. Desarrollar feature
   ↓
2. Commit y push a master
   ↓
3. Testing automático (CI)
   ↓
4. Si todo OK, actualizar versión
   ↓
5. Crear release en GitHub
   ↓
6. Pipeline automático:
   - Tests
   - Build
   - Publish to Marketplace
   ↓
7. Verificar en Marketplace
   ↓
8. Anunciar en LinkedIn/Twitter
```

---

## 🚀 Para Esta Versión (v1.1.0)

```bash
# 1. Todo ya está commiteado, así que:
git push origin master

# 2. Crear tag
git tag -a v1.1.0 -m "Release v1.1.0: Melos support + UX improvements"
git push origin v1.1.0

# 3. Ir a GitHub y crear release con ese tag
# https://github.com/chiuchiolo30/vscode-extension-arq-hex/releases/new

# 4. El pipeline hará el resto automáticamente
```

---

## 📊 Post-Release

- [ ] Verificar en Marketplace (5-10 min)
- [ ] Publicar en LinkedIn
- [ ] Actualizar proyecto en portfolio
- [ ] Monitorear issues/feedback
- [ ] Agradecer en comunidades

---

**¿Listo para el lanzamiento? ¡Adelante! 🎉**
