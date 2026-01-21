import * as vscode from 'vscode';
import { GenerationPlan } from './PreviewManager';

/**
 * Resultado de la interacción con el preview
 */
export type PreviewResult = 'create' | 'create_disable' | 'cancel';

/**
 * WebviewPanel para mostrar el preview de generación con layout fijo
 */
export class PreviewWebview {
    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Muestra el preview y espera la decisión del usuario
     */
    public async showPreview(plan: GenerationPlan): Promise<PreviewResult> {
        return new Promise<PreviewResult>((resolve) => {
            let resolved = false; // Flag para evitar múltiples resoluciones

            // Crear panel
            this.panel = vscode.window.createWebviewPanel(
                'dartCleanArchPreview',
                '🔍 Previsualización de generación',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: []
                }
            );

            // Configurar CSP y contenido HTML
            this.panel.webview.html = this.getHtmlContent(plan, this.panel.webview);

            // Manejar mensajes desde el webview
            const messageListener = this.panel.webview.onDidReceiveMessage(
                async (message) => {
                    if (resolved) {
                        return; // Ya resolvimos, ignorar mensajes adicionales
                    }

                    console.log('[PreviewWebview] Message received:', message.command);

                    switch (message.command) {
                        case 'confirm_create':
                            resolved = true;
                            this.dispose();
                            resolve('create');
                            break;
                        case 'confirm_create_disable_preview':
                            resolved = true;
                            // Deshabilitar preview
                            await vscode.workspace.getConfiguration('dartCleanArch.preview')
                                .update('enabled', false, vscode.ConfigurationTarget.Workspace);
                            this.dispose();
                            resolve('create_disable');
                            break;
                        case 'cancel':
                            resolved = true;
                            this.dispose();
                            resolve('cancel');
                            break;
                        default:
                            console.log('[PreviewWebview] Unknown command:', message.command);
                    }
                },
                null,
                this.disposables
            );

            // Manejar cierre del panel
            this.panel.onDidDispose(
                () => {
                    if (!resolved) {
                        resolved = true;
                        this.dispose();
                        resolve('cancel');
                    }
                },
                null,
                this.disposables
            );
        });
    }

    /**
     * Genera el contenido HTML del preview
     */
    private getHtmlContent(plan: GenerationPlan, webview: vscode.Webview): string {
        const nonce = this.getNonce();
        
        const modeLabel = plan.structureMode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
        const modeSourceLabel = this.getModeSourceLabel(plan.modeSource);
        
        const totalFolders = plan.foldersToCreate.length;
        const totalFiles = plan.filesToCreate.length;

        // Construir listas de carpetas y archivos
        const foldersHtml = plan.foldersToCreate
            .map(folder => {
                const relativePath = this.getRelativePath(folder, plan.appRootPath);
                return `<div class="item folder-item">📁 ${this.escapeHtml(relativePath)}</div>`;
            })
            .join('');

        const filesHtml = plan.filesToCreate
            .map(file => {
                const relativePath = this.getRelativePath(file.path, plan.appRootPath);
                return `<div class="item file-item">📄 ${this.escapeHtml(relativePath)}</div>`;
            })
            .join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
    <title>Previsualización de generación</title>
    <style nonce="${nonce}">
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
        }

        /* Header fijo */
        .header {
            position: sticky;
            top: 0;
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            padding: 16px 20px;
            z-index: 100;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--vscode-editor-foreground);
        }

        .metadata {
            display: grid;
            gap: 8px;
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
        }

        .metadata-item {
            display: flex;
            align-items: baseline;
        }

        .metadata-label {
            font-weight: 600;
            min-width: 140px;
            color: var(--vscode-editor-foreground);
        }

        .metadata-value {
            color: var(--vscode-descriptionForeground);
        }

        .summary {
            margin-top: 12px;
            padding: 12px;
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textLink-foreground);
            border-radius: 4px;
        }

        .summary-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-editor-foreground);
        }

        .summary-stats {
            display: flex;
            gap: 24px;
            font-size: 13px;
        }

        .stat {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .stat-value {
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
        }

        /* Body scrolleable */
        .body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 12px;
            color: var(--vscode-editor-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .section-count {
            color: var(--vscode-descriptionForeground);
            font-weight: normal;
            font-size: 13px;
        }

        .items-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .item {
            padding: 8px 12px;
            background-color: var(--vscode-list-hoverBackground);
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 13px;
            line-height: 1.4;
            word-break: break-all;
        }

        .folder-item {
            color: var(--vscode-symbolIcon-folderForeground, #dcb67a);
        }

        .file-item {
            color: var(--vscode-symbolIcon-fileForeground, var(--vscode-editor-foreground));
        }

        /* Footer fijo */
        .footer {
            position: sticky;
            bottom: 0;
            background-color: var(--vscode-editor-background);
            border-top: 1px solid var(--vscode-panel-border);
            padding: 16px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            z-index: 100;
        }

        .button {
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            transition: background-color 0.15s ease;
        }

        .button:hover {
            opacity: 0.9;
        }

        .button:active {
            transform: scale(0.98);
        }

        .button-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .button-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .button-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .button-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .button-cancel {
            background-color: transparent;
            color: var(--vscode-button-foreground);
            border: 1px solid var(--vscode-button-border);
        }

        .button-cancel:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        /* Scrollbar personalizado */
        .body::-webkit-scrollbar {
            width: 10px;
        }

        .body::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
        }

        .body::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-activeBackground);
            border-radius: 5px;
        }

        .body::-webkit-scrollbar-thumb:hover {
            background: var(--vscode-scrollbarSlider-hoverBackground);
        }
    </style>
</head>
<body>
    <!-- Header fijo -->
    <div class="header">
        <h1>🔍 Previsualización de generación</h1>
        
        <div class="metadata">
            <div class="metadata-item">
                <span class="metadata-label">📦 Comando:</span>
                <span class="metadata-value">${this.escapeHtml(plan.commandName)}</span>
            </div>
            ${plan.appName ? `
            <div class="metadata-item">
                <span class="metadata-label">📱 App:</span>
                <span class="metadata-value">${this.escapeHtml(plan.appName)}</span>
            </div>
            ` : ''}
            ${plan.featureName ? `
            <div class="metadata-item">
                <span class="metadata-label">🧩 Feature:</span>
                <span class="metadata-value">${this.escapeHtml(plan.featureName)}</span>
            </div>
            ` : ''}
            ${plan.useCaseName ? `
            <div class="metadata-item">
                <span class="metadata-label">⚙️ Use Case:</span>
                <span class="metadata-value">${this.escapeHtml(plan.useCaseName)}</span>
            </div>
            ` : ''}
            <div class="metadata-item">
                <span class="metadata-label">🧠 Modo de estructura:</span>
                <span class="metadata-value">${modeLabel} ${modeSourceLabel}</span>
            </div>
        </div>

        <div class="summary">
            <div class="summary-title">📊 Resumen de generación</div>
            <div class="summary-stats">
                <div class="stat">
                    <span>Carpetas a crear:</span>
                    <span class="stat-value">${totalFolders}</span>
                </div>
                <div class="stat">
                    <span>Archivos a crear:</span>
                    <span class="stat-value">${totalFiles}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Body scrolleable -->
    <div class="body">
        ${totalFolders > 0 ? `
        <div class="section">
            <div class="section-title">
                📁 Carpetas
                <span class="section-count">(${totalFolders})</span>
            </div>
            <div class="items-list">
                ${foldersHtml}
            </div>
        </div>
        ` : ''}

        ${totalFiles > 0 ? `
        <div class="section">
            <div class="section-title">
                📄 Archivos
                <span class="section-count">(${totalFiles})</span>
            </div>
            <div class="items-list">
                ${filesHtml}
            </div>
        </div>
        ` : ''}
    </div>

    <!-- Footer fijo -->
    <div class="footer">
        <button class="button button-cancel">
            ❌ Cancelar
        </button>
        <button class="button button-secondary">
            ⚡ Crear y no volver a mostrar
        </button>
        <button class="button button-primary">
            ✅ Crear
        </button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        function sendMessage(command) {
            console.log('[PreviewWebview HTML] Sending message:', command);
            try {
                vscode.postMessage({ command: command });
                console.log('[PreviewWebview HTML] Message sent successfully');
            } catch (error) {
                console.error('[PreviewWebview HTML] Error sending message:', error);
            }
        }

        // Agregar listeners explícitos a los botones como fallback
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[PreviewWebview HTML] DOM loaded, setting up button listeners');
            
            const cancelBtn = document.querySelector('.button-cancel');
            const disableBtn = document.querySelector('.button-secondary');
            const createBtn = document.querySelector('.button-primary');

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    console.log('[PreviewWebview HTML] Cancel button clicked');
                    sendMessage('cancel');
                });
            }

            if (disableBtn) {
                disableBtn.addEventListener('click', () => {
                    console.log('[PreviewWebview HTML] Disable button clicked');
                    sendMessage('confirm_create_disable_preview');
                });
            }

            if (createBtn) {
                createBtn.addEventListener('click', () => {
                    console.log('[PreviewWebview HTML] Create button clicked');
                    sendMessage('confirm_create');
                });
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                console.log('[PreviewWebview HTML] Ctrl+Enter pressed');
                sendMessage('confirm_create');
            } else if (e.key === 'Escape') {
                console.log('[PreviewWebview HTML] Escape pressed');
                sendMessage('cancel');
            }
        });

        console.log('[PreviewWebview HTML] Script loaded successfully');
    </script>
</body>
</html>`;
    }

    /**
     * Genera un nonce para CSP
     */
    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Obtiene un path relativo al appRootPath
     */
    private getRelativePath(absolutePath: string, appRootPath: string): string {
        const normalizedAbsolute = absolutePath.replace(/\\/g, '/');
        const normalizedRoot = appRootPath.replace(/\\/g, '/');

        if (normalizedAbsolute.startsWith(normalizedRoot)) {
            const relative = normalizedAbsolute.substring(normalizedRoot.length);
            return relative.startsWith('/') ? relative.substring(1) : relative;
        }

        return absolutePath;
    }

    /**
     * Obtiene el label legible de la fuente del modo
     */
    private getModeSourceLabel(source?: string): string {
        switch (source) {
            case 'override':
                return '(Configuración manual)';
            case 'auto-detect':
                return '(Auto-detectado)';
            case 'default':
                return '(Valor por defecto)';
            default:
                return '';
        }
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Libera recursos
     */
    private dispose(): void {
        this.panel?.dispose();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
