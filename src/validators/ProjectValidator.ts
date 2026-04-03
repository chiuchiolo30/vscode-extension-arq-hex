import * as fs from "fs";
import * as path from "path";
import { StringTransformer } from "../utils/StringTransformer";
import * as vscode from 'vscode';

export class ProjectValidator {
  isFlutterProject(projectPath: string): boolean {
    return fs.existsSync(path.join(projectPath, "pubspec.yaml"));
  }

  /**
   * Verifica si un directorio es un proyecto Melos
   * Busca melos en dev_dependencies del pubspec.yaml
   */
  isMelosProject(projectPath: string): boolean {
    // Verificar si existe melos.yaml (Melos < 7.x)
    if (fs.existsSync(path.join(projectPath, 'melos.yaml'))) {
      return true;
    }

    // Verificar si pubspec.yaml tiene melos en dev_dependencies
    const pubspecPath = path.join(projectPath, 'pubspec.yaml');
    if (fs.existsSync(pubspecPath)) {
      try {
        const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
        // Buscar melos en dev_dependencies
        return /dev_dependencies:[\s\S]*?\n\s+melos:/m.test(pubspecContent);
      } catch (error) {
        return false;
      }
    }

    return false;
  }

  /**
   * Encuentra el directorio raíz del monorepo Melos desde cualquier subdirectorio
   * Busca melos.yaml o melos en dev_dependencies del pubspec.yaml
   */
  findMelosRoot(startPath: string): string | null {
    let currentPath = startPath;
    const maxDepth = 10;
    let depth = 0;

    while (depth < maxDepth) {
      const melosYamlPath = path.join(currentPath, 'melos.yaml');
      if (fs.existsSync(melosYamlPath)) {
        return currentPath;
      }

      const pubspecPath = path.join(currentPath, 'pubspec.yaml');
      if (fs.existsSync(pubspecPath)) {
        try {
          const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
          if (/dev_dependencies:[\s\S]*?\n\s+melos:/m.test(pubspecContent)) {
            return currentPath;
          }
        } catch {
          // ignore read errors and continue traversal
        }
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        break;
      }

      currentPath = parentPath;
      depth++;
    }

    return null;
  }

  /**
   * Obtiene la versión de Melos del pubspec.yaml
   * @returns número de versión mayor (ej: 7) o null si no se encuentra
   */
  getMelosVersion(projectPath: string): number | null {
    const pubspecPath = path.join(projectPath, 'pubspec.yaml');
    if (!fs.existsSync(pubspecPath)) {
      return null;
    }

    try {
      const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
      // Buscar melos: ^7.3.0 o melos: 7.3.0 en dev_dependencies
      const match = pubspecContent.match(/dev_dependencies:[\s\S]*?\n\s+melos:\s*['"]?\^?(\d+)/m);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    } catch {
      // ignore version detection errors
    }

    return null;
  }

  /**
   * Determina si una ruta está dentro de un paquete de un monorepo Melos
   */
  isInsideMelosPackage(currentPath: string): boolean {
    const melosRoot = this.findMelosRoot(currentPath);
    if (!melosRoot) {
      return false;
    }

    // Verificar que no estamos directamente en la raíz de Melos
    return currentPath !== melosRoot && this.isFlutterProject(currentPath);
  }

  /**
   * Encuentra la app contenedora cuando el archivo activo está dentro de apps/<app_name>/...
   * Retorna null si la ruta pertenece al root del monorepo o a un package compartido.
   */
  findContainingApp(currentPath: string, melosRoot: string): string | null {
    let lookupPath = path.resolve(currentPath);
    const normalizedMelosRoot = path.resolve(melosRoot);

    while (lookupPath.startsWith(normalizedMelosRoot)) {
      const pubspecPath = path.join(lookupPath, 'pubspec.yaml');
      if (fs.existsSync(pubspecPath)) {
        const relativePath = path.relative(normalizedMelosRoot, lookupPath).replace(/\\/g, '/').toLowerCase();
        if (relativePath.startsWith('apps/')) {
          return lookupPath;
        }
      }

      if (lookupPath === normalizedMelosRoot) {
        break;
      }

      const parentPath = path.dirname(lookupPath);
      if (parentPath === lookupPath) {
        break;
      }

      lookupPath = parentPath;
    }

    return null;
  }

  getProjectName(projectPath: string): string | null {
    try {
      const pubspecPath = path.join(projectPath, "pubspec.yaml");
      const pubspecContents = fs.readFileSync(pubspecPath, "utf8");
      const match = pubspecContents.match(/name: (.+)/);
      return match ? match[1].trim() : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Valida estructura del proyecto considerando Feature-First o Layer-First
   * @param projectPath Ruta del proyecto
   * @param mode Opcional: 'featureFirst' | 'layerFirst'. Si no se especifica, valida que exista al menos uno
   */
  validateProjectStructure(projectPath: string, mode?: 'featureFirst' | 'layerFirst'): boolean {
    if (!this.isFlutterProject(projectPath)) {
      return false;
    }

    if (!fs.existsSync(path.join(projectPath, "lib"))) {
      return false;
    }

    if (mode === 'featureFirst') {
      return fs.existsSync(path.join(projectPath, "lib/features"));
    } else if (mode === 'layerFirst') {
      // Para Layer-First, al menos una capa debe existir
      return fs.existsSync(path.join(projectPath, "lib/domain")) ||
             fs.existsSync(path.join(projectPath, "lib/data")) ||
             fs.existsSync(path.join(projectPath, "lib/ui"));
    } else {
      // Si no se especifica modo, validar que exista alguna estructura
      const hasFeatureFirst = fs.existsSync(path.join(projectPath, "lib/features"));
      const hasLayerFirst = fs.existsSync(path.join(projectPath, "lib/domain")) ||
                            fs.existsSync(path.join(projectPath, "lib/data")) ||
                            fs.existsSync(path.join(projectPath, "lib/ui"));
      return hasFeatureFirst || hasLayerFirst;
    }
  }

  featureExists(projectPath: string, featureName: string, mode: 'featureFirst' | 'layerFirst' = 'featureFirst'): boolean {
    const transformedName = StringTransformer.transformInput(featureName);
    
    if (mode === 'featureFirst') {
      const featurePath = path.join(projectPath, `lib/features/${transformedName}`);
      return fs.existsSync(featurePath);
    } else {
      // Layer-First: verificar si existe en domain, data o ui
      const domainPath = path.join(projectPath, `lib/domain/${transformedName}`);
      const dataPath = path.join(projectPath, `lib/data/${transformedName}`);
      const uiPath = path.join(projectPath, `lib/ui/${transformedName}`);
      return fs.existsSync(domainPath) || fs.existsSync(dataPath) || fs.existsSync(uiPath);
    }
  }

  /**
   * Obtiene las features disponibles considerando el modo de estructura
   * @param projectPath Ruta del proyecto
   * @param mode Modo de estructura
   */
  getAvailableFeatures(projectPath: string, mode: 'featureFirst' | 'layerFirst' = 'featureFirst'): string[] {
    try {
      if (mode === 'featureFirst') {
        const featuresPath = path.join(projectPath, "lib/features");
      
        if (!fs.existsSync(featuresPath)) {
          return [];
        }

        const items = fs.readdirSync(featuresPath, { withFileTypes: true });
        const features = items
          .filter((item) => item.isDirectory())
          .map((item) => item.name)
          .filter((name) => !name.startsWith("."))
          .sort();

        return features;
      } else {
        // Layer-First: buscar features en la carpeta domain (que debería tener todas)
        const domainPath = path.join(projectPath, "lib/domain");
        
        if (!fs.existsSync(domainPath)) {
          return [];
        }

        const items = fs.readdirSync(domainPath, { withFileTypes: true });
        const features = items
          .filter((item) => item.isDirectory())
          .map((item) => item.name)
          .filter((name) => !name.startsWith("."))
          .sort();

        return features;
      }
    } catch (error) {
      console.error("Error al obtener las features disponibles:", error);
      return [];
    }
  }

  /**
   * Returns the use case names that exist inside a feature's domain/usecases folder.
   * Works for both Feature-First and Layer-First modes.
   */
  getFeatureUseCases(projectPath: string, featureName: string, mode: 'featureFirst' | 'layerFirst' = 'featureFirst'): string[] {
    try {
      const usecasesPath = mode === 'featureFirst'
        ? path.join(projectPath, 'lib', 'features', featureName, 'domain', 'usecases')
        : path.join(projectPath, 'lib', 'domain', featureName, 'usecases');

      if (!fs.existsSync(usecasesPath)) { return []; }

      return fs.readdirSync(usecasesPath, { withFileTypes: true })
        .filter(f => f.isFile() && f.name.endsWith('.dart') && !f.name.startsWith('_'))
        .map(f => f.name.replace(/\.dart$/, ''))
        .sort();
    } catch {
      return [];
    }
  }
}
