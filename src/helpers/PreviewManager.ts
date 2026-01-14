import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Plan de generación que describe qué carpetas y archivos se crearán
 */
export interface GenerationPlan {
    /** Nombre de la app (si es monorepo) */
    appName?: string;
    
    /** Ruta raíz de la app donde se generará el contenido */
    appRootPath: string;
    
    /** Modo de estructura (featureFirst/layerFirst) */
    structureMode: 'featureFirst' | 'layerFirst';
    
    /** Modo de detección (auto-detect / override / default) */
    modeSource?: 'auto-detect' | 'override' | 'default';
    
    /** Nombre del comando que genera (para el título) */
    commandName: string;
    
    /** Nombre de la feature (si aplica) */
    featureName?: string;
    
    /** Nombre del use case (si aplica) */
    useCaseName?: string;
    
    /** Lista de carpetas a crear (paths absolutos) */
    foldersToCreate: string[];
    
    /** Lista de archivos a crear (paths absolutos) */
    filesToCreate: Array<{
        path: string;
        contentPreview?: string; // Opcional para futuras versiones
    }>;
}

/**
 * Item de previsualización para mostrar en UI
 */
export interface PreviewItem {
    label: string;
    description?: string;
    type: 'folder' | 'file';
}

/**
 * Gestor de previsualizaciones antes de generar contenido
 */
export class PreviewManager {
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * Construye la lista de items de preview desde el plan
     */
    public buildPreviewItems(plan: GenerationPlan): PreviewItem[] {
        const items: PreviewItem[] = [];

        // Agregar carpetas
        plan.foldersToCreate.forEach(folderPath => {
            items.push({
                label: this.getRelativePath(folderPath, plan.appRootPath),
                description: '📁 Carpeta',
                type: 'folder'
            });
        });

        // Agregar archivos
        plan.filesToCreate.forEach(file => {
            items.push({
                label: this.getRelativePath(file.path, plan.appRootPath),
                description: '📄 Archivo',
                type: 'file'
            });
        });

        return items;
    }

    /**
     * Muestra el preview y solicita confirmación del usuario
     * @returns true si el usuario confirma, false si cancela
     */
    public async showPreviewAndConfirm(plan: GenerationPlan): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('dartCleanArch.preview');
        const enabled = config.get<boolean>('enabled', true);

        // Si preview está deshabilitado, confirmar automáticamente
        if (!enabled) {
            this.outputChannel.appendLine('[DCA] Preview disabled. Generating directly...');
            return true;
        }

        const maxItems = config.get<number>('maxItems', 200);
        const items = this.buildPreviewItems(plan);
        
        const totalFolders = plan.foldersToCreate.length;
        const totalFiles = plan.filesToCreate.length;
        const totalItems = totalFolders + totalFiles;

        // Construir mensaje del preview
        let message = this.buildPreviewMessage(plan, totalFolders, totalFiles, items, maxItems);

        // Mostrar modal de confirmación con checkbox
        const action = await vscode.window.showInformationMessage(
            message,
            { 
                modal: true,
                detail: '💡 Puedes desactivar esta previsualización con el comando "Toggle preview before generation"'
            },
            '✅ Crear',
            '⚡ Crear y no volver a mostrar'
        );

        // Si el usuario elige "Crear y no volver a mostrar", deshabilitar el preview
        if (action === '⚡ Crear y no volver a mostrar') {
            await config.update('enabled', false, vscode.ConfigurationTarget.Workspace);
            this.outputChannel.appendLine('[DCA] Preview deshabilitado. Los archivos se generarán directamente en el futuro.');
            vscode.window.showInformationMessage('⚡ Previsualización deshabilitada. Los archivos se generarán directamente.');
        }

        const confirmed = action === '✅ Crear' || action === '⚡ Crear y no volver a mostrar';

        if (confirmed) {
            this.outputChannel.appendLine(`[DCA] Generación confirmada. Creando ${totalFiles} archivos y ${totalFolders} carpetas.`);
        } else {
            this.outputChannel.appendLine('[DCA] Generación cancelada por el usuario. No se realizaron cambios.');
            vscode.window.showInformationMessage('❌ Generación cancelada. No se realizaron cambios.');
        }

        return confirmed;
    }

    /**
     * Construye el mensaje de previsualización
     */
    private buildPreviewMessage(
        plan: GenerationPlan,
        totalFolders: number,
        totalFiles: number,
        items: PreviewItem[],
        maxItems: number
    ): string {
        const lines: string[] = [];

        // Header
        lines.push(`🔍 Previsualización de generación`);
        lines.push('');

        // Info del comando
        lines.push(`📦 Comando: ${plan.commandName}`);
        
        if (plan.appName) {
            lines.push(`📱 App: ${plan.appName}`);
        }
        
        if (plan.featureName) {
            lines.push(`🧩 Feature: ${plan.featureName}`);
        }
        
        if (plan.useCaseName) {
            lines.push(`⚙️ Use Case: ${plan.useCaseName}`);
        }

        const modeLabel = plan.structureMode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
        const modeSourceLabel = plan.modeSource ? ` (${plan.modeSource})` : '';
        lines.push(`🧠 Modo de estructura: ${modeLabel}${modeSourceLabel}`);
        
        lines.push('');

        // Estadísticas
        lines.push(`📊 Resumen de generación`);
        lines.push(`   • Carpetas a crear: ${totalFolders}`);
        lines.push(`   • Archivos a crear: ${totalFiles}`);
        lines.push('');

        // Lista de items (truncada si es necesario)
        lines.push(`📁 Elementos que se crearán`);
        
        const itemsToShow = items.slice(0, maxItems);
        itemsToShow.forEach(item => {
            lines.push(`   ${item.description} ${item.label}`);
        });

        const remaining = items.length - maxItems;
        if (remaining > 0) {
            lines.push('');
            lines.push(`   … y ${remaining} elementos más.`);
        }

        lines.push('');
        lines.push('¿Confirmas la generación?');

        return lines.join('\n');
    }

    /**
     * Obtiene un path relativo al appRootPath
     */
    private getRelativePath(absolutePath: string, appRootPath: string): string {
        // Normalizar paths para comparación
        const normalizedAbsolute = absolutePath.replace(/\\/g, '/');
        const normalizedRoot = appRootPath.replace(/\\/g, '/');

        if (normalizedAbsolute.startsWith(normalizedRoot)) {
            const relative = normalizedAbsolute.substring(normalizedRoot.length);
            return relative.startsWith('/') ? relative.substring(1) : relative;
        }

        // Fallback: usar path.relative
        return path.relative(appRootPath, absolutePath).replace(/\\/g, '/');
    }
}
