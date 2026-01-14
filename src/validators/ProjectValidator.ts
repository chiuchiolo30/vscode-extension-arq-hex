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
    console.log('[DEBUG ProjectValidator] Finding Melos root from:', startPath);
    let currentPath = startPath;
    const maxDepth = 10; // Evitar bucles infinitos
    let depth = 0;

    while (depth < maxDepth) {
      // Verificar si existe melos.yaml (Melos < 7.x)
      const melosYamlPath = path.join(currentPath, 'melos.yaml');
      if (fs.existsSync(melosYamlPath)) {
        console.log('[DEBUG ProjectValidator] ✅ Found Melos root (melos.yaml) at:', currentPath);
        return currentPath;
      }

      // Verificar si pubspec.yaml tiene melos en dev_dependencies (Melos >= 7.x)
      const pubspecPath = path.join(currentPath, 'pubspec.yaml');
      if (fs.existsSync(pubspecPath)) {
        try {
          const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
          // Buscar melos en dev_dependencies
          if (/dev_dependencies:[\s\S]*?\n\s+melos:/m.test(pubspecContent)) {
            console.log('[DEBUG ProjectValidator] ✅ Found Melos root (dev_dependencies) at:', currentPath);
            return currentPath;
          }
        } catch (error) {
          console.log('[DEBUG ProjectValidator] Error reading pubspec.yaml:', error);
        }
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        console.log('[DEBUG ProjectValidator] ❌ Reached system root, no Melos config found');
        break;
      }

      currentPath = parentPath;
      depth++;
    }

    console.log('[DEBUG ProjectValidator] ❌ No Melos root found');
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
    } catch (error) {
      console.log('[DEBUG ProjectValidator] Error reading Melos version:', error);
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
}
