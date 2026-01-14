import * as vscode from 'vscode';
import { CreateFeatureCommand } from './CreateFeatureCommand';
import { CreateFeatureWithCrudCommand } from './CreateFeatureWithCrudCommand';
import { CreateUseCaseCommand } from './CreateUseCaseCommand';
import { SetStructureModeCommand } from './SetStructureModeCommand';
import { TogglePreviewCommand } from './TogglePreviewCommand';

export class CommandManager {
    private commands = [
        new CreateFeatureCommand(),
        new CreateFeatureWithCrudCommand(),
        new CreateUseCaseCommand()
    ];

    registerCommands(context: vscode.ExtensionContext): void {
        // Registrar comandos regulares con context
        this.commands.forEach(command => {
            command.setContext(context);
            const disposable = vscode.commands.registerCommand(
                command.getId(),
                () => command.execute()
            );
            context.subscriptions.push(disposable);
        });

        // Registrar comando de configuración de estructura
        const setStructureModeCommand = new SetStructureModeCommand(context);
        const setModeDisposable = vscode.commands.registerCommand(
            setStructureModeCommand.getId(),
            () => setStructureModeCommand.execute()
        );
        context.subscriptions.push(setModeDisposable);

        // Registrar comando de toggle preview
        const togglePreviewCommand = new TogglePreviewCommand();
        togglePreviewCommand.setContext(context);
        const togglePreviewDisposable = vscode.commands.registerCommand(
            togglePreviewCommand.getId(),
            () => togglePreviewCommand.execute()
        );
        context.subscriptions.push(togglePreviewDisposable);
    }
}