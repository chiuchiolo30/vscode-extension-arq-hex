import * as path from 'path';
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

    static getActiveFileDirectory(): string | null {
        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor || activeEditor.document.uri.scheme !== 'file') {
            return null;
        }

        const activeFilePath = activeEditor.document.uri.fsPath;
        return activeFilePath.length === 0 ? null : path.dirname(activeFilePath);
    }
}
