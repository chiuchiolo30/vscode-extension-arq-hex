import * as vscode from 'vscode';
import { CommandManager } from './commands/CommandManager';
import { StatusBarManager } from './helpers/StatusBarManager';
import { StructureModeManager } from './helpers/StructureModeManager';

// Instancia global del StatusBarManager para actualizaciones
let statusBarManager: StatusBarManager | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Crear Output Channel
    const outputChannel = vscode.window.createOutputChannel('Dart Clean Architecture');
    context.subscriptions.push(outputChannel);

    // Crear StructureModeManager
    const structureModeManager = new StructureModeManager(context);

    // Crear y registrar Status Bar
    statusBarManager = new StatusBarManager(outputChannel, structureModeManager);
    context.subscriptions.push(statusBarManager);

    // Registrar comando para mostrar menú del Status Bar
    const showMenuCommand = vscode.commands.registerCommand(
        'flutter-arq-hex.showStatusBarMenu',
        () => statusBarManager?.showMenu()
    );
    context.subscriptions.push(showMenuCommand);

    // Registrar comandos de la extensión  (outputChannel reutilizado en ShowArchitectureInfoCommand)
    const commandManager = new CommandManager(statusBarManager, outputChannel);
    commandManager.registerCommands(context);

    // Actualizar Status Bar cuando cambie la configuración
    const configListener = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('dartCleanArch')) {
            statusBarManager?.update();
        }
    });
    context.subscriptions.push(configListener);

    // Actualizar Status Bar cuando cambie el workspace
    const workspaceListener = vscode.workspace.onDidChangeWorkspaceFolders(() => {
        statusBarManager?.update();
    });
    context.subscriptions.push(workspaceListener);

    // Actualizar Status Bar cuando cambie el editor activo (para detectar app activa en monorepos)
    const editorListener = vscode.window.onDidChangeActiveTextEditor(() => {
        statusBarManager?.update();
    });
    context.subscriptions.push(editorListener);

    // Actualizar Status Bar cuando se abra un documento
    const documentListener = vscode.workspace.onDidOpenTextDocument(() => {
        statusBarManager?.update();
    });
    context.subscriptions.push(documentListener);
}

export function deactivate() {
    statusBarManager = undefined;
}