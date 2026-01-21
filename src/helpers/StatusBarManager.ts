import * as vscode from 'vscode';
import * as path from 'path';
import { StructureModeManager } from './StructureModeManager';
import { MelosHelper } from './MelosHelper';
import { ProjectValidator } from '../validators/ProjectValidator';

/**
 * Información del contexto del Status Bar
 */
interface StatusBarContext {
    isMelosMonorepo: boolean;
    activeApp?: string;
    structureMode?: 'featureFirst' | 'layerFirst';
    modeSource?: string;
    previewEnabled: boolean;
}

/**
 * Gestor del Status Bar Item que muestra el estado actual de la extensión
 */
export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;
    private structureModeManager: StructureModeManager;
    private melosHelper: MelosHelper;
    private projectValidator: ProjectValidator;
    private melosRootPath?: string;

    constructor(
        outputChannel: vscode.OutputChannel,
        structureModeManager: StructureModeManager
    ) {
        this.outputChannel = outputChannel;
        this.structureModeManager = structureModeManager;
        this.melosHelper = new MelosHelper();
        this.projectValidator = new ProjectValidator();

        // Crear Status Bar Item (prioridad 100 para estar visible)
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

        // Asignar comando al hacer click
        this.statusBarItem.command = 'flutter-arq-hex.showStatusBarMenu';
        
        // Mostrar en la UI
        this.statusBarItem.show();

        // Actualizar estado inicial
        this.update();
    }

    /**
     * Detecta si hay un archivo activo y extrae la app de monorepo
     */
    private detectActiveApp(): string | undefined {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return undefined;
        }

        const filePath = activeEditor.document.uri.fsPath;
        
        // Si no es monorepo, no hay app activa
        if (!this.melosRootPath) {
            return undefined;
        }

        // Buscar si el path contiene apps/<appName>/
        const appsPattern = /[/\\]apps[/\\]([^/\\]+)[/\\]/;
        const match = filePath.match(appsPattern);
        
        if (match && match[1]) {
            const appName = match[1];
            
            // Validar que realmente existe el folder apps/<appName>
            const appPath = path.join(this.melosRootPath, 'apps', appName);
            
            if (this.projectValidator.isFlutterProject(appPath)) {
                this.outputChannel.appendLine(`[StatusBar] Active app detected: ${appName}`);
                return appName;
            }
        }

        return undefined;
    }

    /**
     * Actualiza el Status Bar con el estado actual
     */
    public async update(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            
            if (!workspaceFolders || workspaceFolders.length === 0) {
                this.statusBarItem.text = '$(file-code) DCA';
                this.statusBarItem.tooltip = 'Dart Clean Architecture\nNo hay workspace abierto';
                return;
            }

            const workspaceRoot = workspaceFolders[0].uri.fsPath;

            // Detectar si es monorepo Melos
            const melosRoot = this.projectValidator.findMelosRoot(workspaceRoot);
            this.melosRootPath = melosRoot || undefined;
            const isMelosMonorepo = !!this.melosRootPath;

            // Leer estado del Preview Mode
            const config = vscode.workspace.getConfiguration('dartCleanArch.preview');
            const previewEnabled = config.get<boolean>('enabled', true);

            if (isMelosMonorepo) {
                await this.updateMonorepoStatus(previewEnabled);
            } else {
                await this.updateSimpleProjectStatus(workspaceRoot, previewEnabled);
            }

        } catch (error) {
            this.outputChannel.appendLine(`[StatusBar] Error updating: ${error}`);
            this.statusBarItem.text = '$(file-code) DCA';
            this.statusBarItem.tooltip = 'Dart Clean Architecture\nError al leer configuración';
        }
    }

    /**
     * Actualiza el Status Bar para proyecto simple (no monorepo)
     */
    private async updateSimpleProjectStatus(workspaceRoot: string, previewEnabled: boolean): Promise<void> {
        // Leer estado del modo de estructura
        const effectiveModeResult = await this.structureModeManager.getEffectiveModeWithSource(workspaceRoot);
        const modeLabel = effectiveModeResult.mode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
        const previewLabel = previewEnabled ? 'Preview ON' : 'Preview OFF';
        const previewIcon = previewEnabled ? '👁️' : '⚡';

        // Construir texto del Status Bar (conciso)
        this.statusBarItem.text = `$(file-code) DCA: ${modeLabel} | ${previewIcon} ${previewLabel}`;

        // Construir tooltip detallado
        const modeSourceLabel = this.getModeSourceLabel(effectiveModeResult.source);
        this.statusBarItem.tooltip = this.buildTooltip({
            isMelosMonorepo: false,
            structureMode: effectiveModeResult.mode,
            modeSource: modeSourceLabel,
            previewEnabled
        });

        this.outputChannel.appendLine(`[StatusBar] Updated (Simple) - Mode: ${modeLabel}, Preview: ${previewEnabled}`);
    }

    /**
     * Actualiza el Status Bar para monorepo Melos
     */
    private async updateMonorepoStatus(previewEnabled: boolean): Promise<void> {
        const activeApp = this.detectActiveApp();
        const previewLabel = previewEnabled ? 'Preview ON' : 'Preview OFF';
        const previewIcon = previewEnabled ? '👁️' : '⚡';

        if (activeApp && this.melosRootPath) {
            // Caso A: Hay app activa - mostrar modo específico de esa app
            const appPath = path.join(this.melosRootPath, 'apps', activeApp);
            const effectiveModeResult = await this.structureModeManager.getEffectiveModeWithSource(appPath);
            const modeLabel = effectiveModeResult.mode === 'featureFirst' ? 'Feature-First' : 'Layer-First';

            this.statusBarItem.text = `$(file-code) DCA: ${activeApp} | ${modeLabel} | ${previewIcon} ${previewLabel}`;

            const modeSourceLabel = this.getModeSourceLabel(effectiveModeResult.source);
            this.statusBarItem.tooltip = this.buildTooltip({
                isMelosMonorepo: true,
                activeApp,
                structureMode: effectiveModeResult.mode,
                modeSource: modeSourceLabel,
                previewEnabled
            });

            this.outputChannel.appendLine(`[StatusBar] Updated (Monorepo + Active App) - App: ${activeApp}, Mode: ${modeLabel}, Preview: ${previewEnabled}`);
        } else {
            // Caso B: No hay app activa - mostrar estado neutro
            this.statusBarItem.text = `$(file-code) DCA: Monorepo | Auto | ${previewIcon} ${previewLabel}`;

            this.statusBarItem.tooltip = this.buildTooltip({
                isMelosMonorepo: true,
                previewEnabled
            });

            this.outputChannel.appendLine(`[StatusBar] Updated (Monorepo - No Active App) - Preview: ${previewEnabled}`);
        }
    }

    /**
     * Muestra el menú de acciones al hacer click en el Status Bar
     */
    public async showMenu(): Promise<void> {
        const options: vscode.QuickPickItem[] = [
            {
                label: '$(file-code) Dart Clean Architecture',
                kind: vscode.QuickPickItemKind.Separator
            },
            {
                label: '$(symbol-structure) Cambiar modo de estructura',
                description: 'Feature-First vs Layer-First',
                detail: 'Configura cómo organizar las carpetas del proyecto'
            },
            {
                label: '$(eye) Activar / desactivar Preview Mode',
                description: 'Previsualización antes de generar',
                detail: 'Muestra qué archivos se crearán antes de confirmar'
            },
            {
                label: '$(gear) Abrir configuración de la extensión',
                description: 'Settings de Dart Clean Architecture',
                detail: 'Personaliza el comportamiento de la extensión'
            }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: '¿Qué deseas configurar?',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            return;
        }

        // Ejecutar comando según la opción seleccionada
        if (selected.label.includes('modo de estructura')) {
            await vscode.commands.executeCommand('flutter-arq-hex.setStructureMode');
        } else if (selected.label.includes('Preview Mode')) {
            await vscode.commands.executeCommand('flutter-arq-hex.togglePreview');
        } else if (selected.label.includes('configuración')) {
            await vscode.commands.executeCommand(
                'workbench.action.openSettings',
                'dartCleanArch'
            );
        }

        // Actualizar Status Bar después de ejecutar el comando
        // (con pequeño delay para que el comando termine)
        setTimeout(() => this.update(), 100);
    }

    /**
     * Construye el tooltip del Status Bar
     */
    private buildTooltip(context: StatusBarContext): string {
        const lines = ['🏗️ Dart Clean Architecture', ''];

        // Información de monorepo
        lines.push(`Monorepo: ${context.isMelosMonorepo ? 'Sí' : 'No'}`);

        if (context.isMelosMonorepo) {
            if (context.activeApp) {
                lines.push(`App activa: ${context.activeApp}`);
                lines.push(`Modo de estructura: ${this.getModeLabel(context.structureMode)} ${context.modeSource || ''}`);
            } else {
                lines.push('App activa: (no seleccionada)');
                lines.push('Modo de estructura: Auto');
            }
        } else {
            lines.push(`Modo de estructura: ${this.getModeLabel(context.structureMode)} ${context.modeSource || ''}`);
        }

        lines.push('');
        lines.push(`Preview Mode: ${context.previewEnabled ? '✅ Activado' : '⚡ Desactivado'}`);
        lines.push('');
        lines.push('💡 Click para configurar');

        return lines.join('\n');
    }

    /**
     * Obtiene el label legible del modo
     */
    private getModeLabel(mode?: 'featureFirst' | 'layerFirst'): string {
        if (!mode) {
            return 'Auto';
        }
        return mode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
    }

    /**
     * Obtiene el label legible de la fuente del modo
     */
    private getModeSourceLabel(source?: string): string {
        switch (source) {
            case 'override':
                return '(Configuración manual)';
            case 'auto-detect':
                return '(Auto-detectado)';
            case 'default':
                return '(Valor por defecto)';
            default:
                return '';
        }
    }

    /**
     * Libera los recursos del Status Bar
     */
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
