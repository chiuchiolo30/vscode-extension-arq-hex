import * as vscode from 'vscode';
import { BaseCommand } from './base/BaseCommand';
import { StructureModeManager } from '../helpers/StructureModeManager';

/**
 * Comando para que el usuario establezca manualmente el modo de estructura
 * (Feature-First o Layer-First) para un proyecto/app específico
 */
export class SetStructureModeCommand extends BaseCommand {
    private localStructureModeManager: StructureModeManager;

    constructor(context: vscode.ExtensionContext) {
        super();
        this.localStructureModeManager = new StructureModeManager(context);
    }

    getId(): string {
        return 'flutter-arq-hex.setStructureMode';
    }

    async execute(): Promise<void> {
        // 1. Resolver el directorio de trabajo (incluye soporte para Melos)
        const workingDir = await this.resolveWorkingDirectory('configurar el modo de estructura');
        if (!workingDir) {
            return; // El usuario canceló o hubo un error
        }

        // 2. Mostrar diagnósticos actuales (opcional, para dar contexto al usuario)
        const diagnostics = this.localStructureModeManager.getDiagnostics(workingDir);
        
        let contextMessage = '🏗️ Selecciona el modo de estructura del proyecto';
        
        // Agregar información contextual sobre el estado actual
        if (diagnostics.saved) {
            contextMessage += ` (actual: ${diagnostics.saved === 'featureFirst' ? 'Feature-First' : 'Layer-First'} - manual)`;
        } else if (diagnostics.config.autoDetect && diagnostics.detected !== 'unknown') {
            const detectedLabel = diagnostics.detected === 'featureFirst' ? 'Feature-First' : 
                                   diagnostics.detected === 'layerFirst' ? 'Layer-First' : 
                                   diagnostics.detected;
            contextMessage += ` (detectado: ${detectedLabel})`;
        }

        // 3. Solicitar al usuario que seleccione el modo
        const selectedMode = await this.localStructureModeManager.promptForMode(workingDir, contextMessage);

        // 4. Mostrar confirmación
        const modeLabel = selectedMode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
        const modeDescription = selectedMode === 'featureFirst' 
            ? 'lib/features/<feature>/domain|data|ui/...'
            : 'lib/domain|data|ui/<feature>/...';

        this.showSuccessWithDetails(
            '✅ Modo de estructura configurado',
            [
                { icon: '🏗️', text: `Modo: ${modeLabel}` },
                { icon: '📁', text: `Estructura: ${modeDescription}` },
                { icon: '📍', text: `App: ${workingDir.split(/[\\/]/).pop() || 'proyecto'}` }
            ]
        );

        // 5. Mostrar información adicional sobre cómo funciona
        const learnMore = await vscode.window.showInformationMessage(
            '💡 La próxima vez que crees un feature o use case, se usará esta estructura automáticamente.',
            '📖 Ver configuración',
            'Entendido'
        );

        if (learnMore === '📖 Ver configuración') {
            vscode.commands.executeCommand('workbench.action.openSettings', 'dartCleanArch.structure');
        }
    }
}
