import * as vscode from 'vscode';
import { CreateFeatureCommand } from './CreateFeatureCommand';
import { CreateFeatureWithCrudCommand } from './CreateFeatureWithCrudCommand';
import { CreateUseCaseCommand } from './CreateUseCaseCommand';
import { SetStructureModeCommand } from './SetStructureModeCommand';
import { TogglePreviewCommand } from './TogglePreviewCommand';
import { StatusBarManager } from '../helpers/StatusBarManager';

export class CommandManager {
    private commands = [
        new CreateFeatureCommand(),
        new CreateFeatureWithCrudCommand(),
        new CreateUseCaseCommand()
    ];
    private statusBarManager?: StatusBarManager;

    constructor(statusBarManager?: StatusBarManager) {
        this.statusBarManager = statusBarManager;
    }

    registerCommands(context: vscode.ExtensionContext): void {
        // Registrar comandos regulares con context
        this.commands.forEach(command => {
            command.setContext(context);
            const disposable = vscode.commands.registerCommand(
                command.getId(),
                async () => {
                    await command.execute();
                    // Actualizar Status Bar después de ejecutar comando
                    this.statusBarManager?.update();
                }
            );
            context.subscriptions.push(disposable);
        });

        // Registrar comando de configuración de estructura
        const setStructureModeCommand = new SetStructureModeCommand(context);
        const setModeDisposable = vscode.commands.registerCommand(
            setStructureModeCommand.getId(),
            async () => {
                await setStructureModeCommand.execute();
                // Actualizar Status Bar después de cambiar modo
                this.statusBarManager?.update();
            }
        );
        context.subscriptions.push(setModeDisposable);

        // Registrar comando de toggle preview
        const togglePreviewCommand = new TogglePreviewCommand();
        togglePreviewCommand.setContext(context);
        const togglePreviewDisposable = vscode.commands.registerCommand(
            togglePreviewCommand.getId(),
            async () => {
                await togglePreviewCommand.execute();
                // Actualizar Status Bar después de toggle preview
                this.statusBarManager?.update();
            }
        );
        context.subscriptions.push(togglePreviewDisposable);
    }
}