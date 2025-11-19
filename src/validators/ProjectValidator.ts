import * as fs from "fs";
import * as path from "path";
import { StringTransformer } from "../utils/StringTransformer";
import * as vscode from 'vscode';

export class ProjectValidator {
  isFlutterProject(projectPath: string): boolean {
    return fs.existsSync(path.join(projectPath, "pubspec.yaml"));
  }

  isMelosProject(projectPath: string): boolean {
    return fs.existsSync(path.join(projectPath, "melos.yaml"));
  }

  /**
   * Encuentra el directorio raíz del monorepo Melos desde cualquier subdirectorio
   */
  findMelosRoot(startPath: string): string | null {
    // console.log('[DEBUG ProjectValidator] Finding Melos root from:', startPath);
    let currentPath = startPath;
    const maxDepth = 10; // Evitar bucles infinitos
    let depth = 0;

    while (depth < maxDepth) {
      const melosYamlPath = path.join(currentPath, 'melos.yaml');
      // console.log('[DEBUG ProjectValidator] Checking:', melosYamlPath);
      const exists = fs.existsSync(melosYamlPath);
      // console.log('[DEBUG ProjectValidator] Exists?', exists);
      
      if (exists) {
        // console.log('[DEBUG ProjectValidator] ✅ Found Melos root at:', currentPath);
        return currentPath;
      }

      const parentPath = path.dirname(currentPath);
      if (parentPath === currentPath) {
        // Llegamos a la raíz del sistema
        // console.log('[DEBUG ProjectValidator] ❌ Reached system root, no melos.yaml found');
        break;
      }

      currentPath = parentPath;
      depth++;
    }

    // console.log('[DEBUG ProjectValidator] ❌ No Melos root found');
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

  validateProjectStructure(projectPath: string): boolean {
    if (!this.isFlutterProject(projectPath)) {
      return false;
    }

    if (!fs.existsSync(path.join(projectPath, "lib"))) {
      return false;
    }

    if (!fs.existsSync(path.join(projectPath, "lib/features"))) {
      return false;
    }

    return true;
  }

  featureExists(projectPath: string, featureName: string): boolean {
    const featurePath = path.join(
      projectPath,
      `lib/features/${StringTransformer.transformInput(featureName)}`
    );
    return fs.existsSync(featurePath);
  }

  getAvailableFeatures(projectPath: string): string[] {
    try {
      const featuresPath = path.join(projectPath, "lib/features");
    
      if (!fs.existsSync(featuresPath)) {
       
        return [];
      }

      // Leer el contenido del directorio features
      const items = fs.readdirSync(featuresPath, { withFileTypes: true });

      // Filtrar solo directorios (features) y excluir archivos
      const features = items
        .filter((item) => item.isDirectory())
        .map((item) => item.name)
        .filter((name) => !name.startsWith(".")) // Excluir directorios ocultos
        .sort(); // Ordenar alfabéticamente

      return features;
    } catch (error) {
      console.error("Error al obtener las features disponibles:", error);
      return [];
    }
  }
}
