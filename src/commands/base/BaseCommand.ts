import * as vscode from "vscode";
import { ProjectValidator } from "../../validators/ProjectValidator";
import { InputValidator } from "../../validators/InputValidator";
import { MelosHelper } from "../../helpers/MelosHelper";
import { WorkspaceHelper } from "../../helpers/WorkspaceHelper";
import { StructureModeManager } from "../../helpers/StructureModeManager";

export abstract class BaseCommand {
  protected projectValidator = new ProjectValidator();
  protected inputValidator = new InputValidator();
  protected melosHelper = new MelosHelper();
  protected structureModeManager?: StructureModeManager;
  protected context?: vscode.ExtensionContext;

  abstract getId(): string;
  abstract execute(): Promise<void>;

  /**
   * Establece el context de VSCode para acceder al StructureModeManager
   * Debe ser llamado desde CommandManager al registrar los comandos
   */
  setContext(context: vscode.ExtensionContext): void {
    this.context = context;
    this.structureModeManager = new StructureModeManager(context);
  }

  /**
   * Resuelve el directorio de trabajo, considerando monorepos de Melos
   * @param context Mensaje contextual para el selector (ej: "crear feature", "crear caso de uso")
   * @returns La ruta del proyecto donde se ejecutará el comando, o null si se cancela
   */
  protected async resolveWorkingDirectory(context: string = 'trabajar'): Promise<string | null> {
    const currentDir = WorkspaceHelper.getCurrentDirectory();
    
    console.log('[DEBUG resolveWorkingDirectory] Current directory:', currentDir);
    
    if (!currentDir) {
      this.showError('Error: No se pudo encontrar el directorio del proyecto');
      return null;
    }

    // Verificar si estamos en un monorepo Melos
    const melosRoot = this.projectValidator.findMelosRoot(currentDir);
    
    console.log('[DEBUG resolveWorkingDirectory] Melos root found:', melosRoot);
    
    if (melosRoot) {
      // Detectamos un monorepo Melos
      const selectedDir = await this.handleMelosWorkspace(melosRoot, currentDir, context);
      console.log('[DEBUG resolveWorkingDirectory] Selected directory from Melos:', selectedDir);
      return selectedDir;
    }

    console.log('[DEBUG resolveWorkingDirectory] Not a Melos project, checking Flutter...');

    // No es Melos, verificar que sea un proyecto Flutter válido
    if (!this.projectValidator.isFlutterProject(currentDir)) {
      this.showError('❌ No se encontró pubspec.yaml. Asegúrate de estar en la raíz de tu proyecto Flutter.');
      return null;
    }

    console.log('[DEBUG resolveWorkingDirectory] Returning currentDir:', currentDir);
    return currentDir;
  }

  /**
   * Maneja la selección de paquete en un monorepo Melos
   * @param context Mensaje contextual para el selector
   */
  private async handleMelosWorkspace(melosRoot: string, currentDir: string, context: string): Promise<string | null> {
    // Si ya estamos dentro de un paquete específico, usarlo directamente
    if (this.projectValidator.isInsideMelosPackage(currentDir)) {
      const useCurrentPackage = await vscode.window.showQuickPick(
        ['Sí', 'No, seleccionar otro paquete'],
        {
          placeHolder: `¿Deseas usar el paquete actual? (${currentDir.split('\\').pop()})`
        }
      );

      if (useCurrentPackage === 'Sí') {
        return currentDir;
      }
    }

    // Obtener todos los paquetes del monorepo
    const packages = this.melosHelper.getMelosPackages(melosRoot);
    
    if (packages.length === 0) {
      this.showError('No se encontraron paquetes Flutter en el monorepo de Melos');
      return null;
    }

    // Mostrar selector de paquetes con mensaje contextual
    const placeholder = `Selecciona la app donde ${context}`;
    const selectedPackage = await this.melosHelper.showPackageSelector(packages, placeholder);
    
    if (!selectedPackage) {
      // El usuario canceló la selección
      return null;
    }

    // Validar que el paquete tenga una estructura válida
    if (!this.melosHelper.validatePackageForFeatures(selectedPackage.path)) {
      this.showError(`El paquete seleccionado no tiene una estructura válida (falta el directorio lib)`);
      return null;
    }

    return selectedPackage.path;
  }

  /**
   * Resuelve el directorio de trabajo y retorna información adicional (nombre de app)
   * Útil para preview y logging
   */
  protected async resolveWorkingDirectoryWithInfo(context: string = 'trabajar'): Promise<{ workingDir: string, appName?: string } | null> {
    const currentDir = WorkspaceHelper.getCurrentDirectory();
    
    if (!currentDir) {
      this.showError('Error: No se pudo encontrar el directorio del proyecto');
      return null;
    }

    const melosRoot = this.projectValidator.findMelosRoot(currentDir);
    
    if (melosRoot) {
      const packages = this.melosHelper.getMelosPackages(melosRoot);
      
      if (packages.length === 0) {
        this.showError('No se encontraron paquetes Flutter en el monorepo de Melos');
        return null;
      }

      const placeholder = `Selecciona la app donde ${context}`;
      const selectedPackage = await this.melosHelper.showPackageSelector(packages, placeholder);
      
      if (!selectedPackage) {
        return null;
      }

      if (!this.melosHelper.validatePackageForFeatures(selectedPackage.path)) {
        this.showError(`El paquete seleccionado no tiene una estructura válida (falta el directorio lib)`);
        return null;
      }

      return {
        workingDir: selectedPackage.path,
        appName: selectedPackage.name
      };
    }

    if (!this.projectValidator.isFlutterProject(currentDir)) {
      this.showError('❌ No se encontró pubspec.yaml. Asegúrate de estar en la raíz de tu proyecto Flutter.');
      return null;
    }

    return { workingDir: currentDir };
  }

  protected async showInputBox(prompt: string): Promise<string | undefined> {
    return vscode.window.showInputBox({ prompt });
  }

  protected showError(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  protected showSuccess(message: string): void {
    vscode.window.showInformationMessage(message);
  }

  /**
   * Muestra un mensaje de éxito con múltiples líneas de información
   */
  protected showSuccessWithDetails(title: string, details: Array<{icon: string, text: string}>): void {
    const message = `${title} - ${details.map(d => `${d.icon} ${d.text}`).join(' | ')}`;
    vscode.window.showInformationMessage(message);
  }

  /**
   * Muestra un mensaje de error con múltiples líneas de información
   */
  protected showErrorWithDetails(title: string, details: Array<{icon: string, text: string}>): void {
    const message = `${title} - ${details.map(d => `${d.icon} ${d.text}`).join(' | ')}`;
    vscode.window.showErrorMessage(message);
  }

  protected async showQuickPick(
    items: string[],
    placeHolder: string
  ): Promise<string | undefined> {
    const quickPickItems: vscode.QuickPickItem[] = items.map((item) => ({
      label: item,
    }));

    const selection = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder,
      canPickMany: false,
    });

    return selection?.label;
  }
}
