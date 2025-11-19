import * as vscode from 'vscode';
import { CreateFeatureCommand } from './CreateFeatureCommand';
import { CreateFeatureWithCrudCommand } from './CreateFeatureWithCrudCommand';
import { CreateUseCaseCommand } from './CreateUseCaseCommand';

export class CommandManager {
    private commands = [
        new CreateFeatureCommand(),
        new CreateFeatureWithCrudCommand(),
        new CreateUseCaseCommand()
    ];

    registerCommands(context: vscode.ExtensionContext): void {
        this.commands.forEach(command => {
            const disposable = vscode.commands.registerCommand(
                command.getId(),
                () => command.execute()
            );
            context.subscriptions.push(disposable);
        });
    }
}