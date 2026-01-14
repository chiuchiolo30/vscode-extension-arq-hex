import * as vscode from 'vscode';
import { BaseCommand } from './base/BaseCommand';

/**
 * Comando para habilitar o deshabilitar la previsualización antes de generar código
 */
export class TogglePreviewCommand extends BaseCommand {
    getId(): string {
        return 'flutter-arq-hex.togglePreview';
    }

    async execute(): Promise<void> {
        // Leer configuración actual
        const config = vscode.workspace.getConfiguration('dartCleanArch.preview');
        const currentValue = config.get<boolean>('enabled', true);

        // Opciones para el QuickPick
        const options: vscode.QuickPickItem[] = [
            {
                label: '✅ Habilitar previsualización antes de generar',
                description: 'Muestra un modal de confirmación con el resumen de lo que se creará',
                detail: currentValue ? '(Actual)' : undefined
            },
            {
                label: '⚡ Deshabilitar previsualización (generar directamente)',
                description: 'Los archivos se generarán inmediatamente sin mostrar el modal',
                detail: !currentValue ? '(Actual)' : undefined
            }
        ];

        // Mostrar selector
        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Selecciona el modo de previsualización'
        });

        if (!selection) {
            return; // Usuario canceló
        }

        // Determinar el nuevo valor según la selección
        const newValue = selection.label.startsWith('✅');

        // Si no cambió, no hacer nada
        if (newValue === currentValue) {
            this.showSuccess('ℹ️ La configuración de previsualización no ha cambiado.');
            return;
        }

        try {
            // Actualizar configuración en workspace
            await config.update('enabled', newValue, vscode.ConfigurationTarget.Workspace);

            // Logging
            const outputChannel = vscode.window.createOutputChannel('Dart Clean Architecture');
            if (newValue) {
                outputChannel.appendLine('[DCA] Preview mode enabled by user.');
                this.showSuccess('✅ Previsualización habilitada. Se mostrará un modal de confirmación antes de generar.');
            } else {
                outputChannel.appendLine('[DCA] Preview mode disabled by user.');
                this.showSuccess('⚡ Previsualización deshabilitada. Los archivos se generarán directamente.');
            }
        } catch (error) {
            this.showError(`❌ Error al actualizar la configuración: ${error}`);
        }
    }
}
