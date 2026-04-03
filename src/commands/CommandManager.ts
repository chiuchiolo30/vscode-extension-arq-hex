import * as vscode from 'vscode';
import { CreateFeatureCommand } from './CreateFeatureCommand';
import { CreateFeatureWithCrudCommand } from './CreateFeatureWithCrudCommand';
import { CreateUseCaseCommand } from './CreateUseCaseCommand';
import { SetStructureModeCommand } from './SetStructureModeCommand';
import { TogglePreviewCommand } from './TogglePreviewCommand';
import { ShowArchitectureInfoCommand } from './ShowArchitectureInfoCommand';
import { GenerateInstructionsCommand } from './GenerateInstructionsCommand';
import { StatusBarManager } from '../helpers/StatusBarManager';

export class CommandManager {
    private commands = [
        new CreateFeatureCommand(),
        new CreateFeatureWithCrudCommand(),
        new CreateUseCaseCommand()
    ];
    private statusBarManager?: StatusBarManager;
    private outputChannel?: vscode.OutputChannel;

    constructor(statusBarManager?: StatusBarManager, outputChannel?: vscode.OutputChannel) {
        this.statusBarManager = statusBarManager;
        this.outputChannel = outputChannel;
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

        // Registrar comando "Show Architecture Info"
        const showInfoChannel = this.outputChannel
            ?? vscode.window.createOutputChannel('Dart Clean Architecture');
        const showInfoCommand = new ShowArchitectureInfoCommand(showInfoChannel);
        showInfoCommand.setContext(context);
        const showInfoDisposable = vscode.commands.registerCommand(
            showInfoCommand.getId(),
            async () => showInfoCommand.execute()
        );
        context.subscriptions.push(showInfoDisposable);

        // Registrar comando "Generate AI Instructions"
        const generateInstructionsCommand = new GenerateInstructionsCommand();
        generateInstructionsCommand.setContext(context);
        const generateInstructionsDisposable = vscode.commands.registerCommand(
            generateInstructionsCommand.getId(),
            async () => generateInstructionsCommand.execute()
        );
        context.subscriptions.push(generateInstructionsDisposable);
    }
}