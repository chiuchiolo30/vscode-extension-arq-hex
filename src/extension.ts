import * as vscode from 'vscode';
import { CommandManager } from './commands/CommandManager';

export function activate(context: vscode.ExtensionContext) {
    const commandManager = new CommandManager();
    commandManager.registerCommands(context);
}

export function deactivate() {}