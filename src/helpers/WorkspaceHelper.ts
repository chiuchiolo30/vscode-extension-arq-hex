import * as vscode from 'vscode';

export class WorkspaceHelper {
    static getCurrentDirectory(): string | null {
        let currentDir = vscode.workspace.rootPath;

        if (!currentDir) {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                return null;
            }
            currentDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        return currentDir.length === 0 ? null : currentDir;
    }
}
