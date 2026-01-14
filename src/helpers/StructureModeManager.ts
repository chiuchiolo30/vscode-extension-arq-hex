import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export type StructureMode = 'featureFirst' | 'layerFirst';
export type DetectionResult = StructureMode | 'unknown' | 'ambiguous';

/**
 * Gestiona la detección, almacenamiento y recuperación del modo de estructura
 * de proyectos (Feature-First vs Layer-First)
 */
export class StructureModeManager {
    private static readonly storageKeyPrefix = 'dartCleanArch.structureMode.';
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Detecta automáticamente el modo de estructura analizando el directorio lib/
     * @param appRootPath Ruta raíz de la aplicación/paquete
     * @returns El modo detectado o 'unknown'/'ambiguous' si no se puede determinar
     */
    detectStructureMode(appRootPath: string): DetectionResult {
        const libPath = path.join(appRootPath, 'lib');

        // Verificar si existe el directorio lib
        if (!fs.existsSync(libPath)) {
            return 'unknown';
        }

        // Verificar indicadores de Feature-First
        const hasFeaturesDir = fs.existsSync(path.join(libPath, 'features'));

        // Verificar indicadores de Layer-First
        const hasDomainDir = fs.existsSync(path.join(libPath, 'domain'));
        const hasDataDir = fs.existsSync(path.join(libPath, 'data'));
        const hasUiDir = fs.existsSync(path.join(libPath, 'ui'));
        const hasLayerFirst = hasDomainDir || hasDataDir || hasUiDir;

        // Determinar el resultado
        if (hasFeaturesDir && hasLayerFirst) {
            return 'ambiguous';
        } else if (hasFeaturesDir) {
            return 'featureFirst';
        } else if (hasLayerFirst) {
            return 'layerFirst';
        } else {
            return 'unknown';
        }
    }

    /**
     * Obtiene el modo efectivo para una aplicación, considerando:
     * 1. Override manual guardado
     * 2. Detección automática (si está habilitada)
     * 3. Configuración por defecto
     * @param appRootPath Ruta raíz de la aplicación/paquete
     * @returns El modo efectivo a usar
     */
    async getEffectiveMode(appRootPath: string): Promise<StructureMode> {
        const result = await this.getEffectiveModeWithSource(appRootPath);
        return result.mode;
    }

    /**
     * Obtiene el modo efectivo y su fuente de origen
     * @param appRootPath Ruta raíz de la aplicación/paquete
     * @returns El modo efectivo y la fuente ('auto-detect', 'override' o 'default')
     */
    async getEffectiveModeWithSource(appRootPath: string): Promise<{ mode: StructureMode, source: 'auto-detect' | 'override' | 'default' }> {
        // 1. Verificar si hay un override manual guardado
        const savedMode = this.getSavedMode(appRootPath);
        if (savedMode) {
            return { mode: savedMode, source: 'override' };
        }

        // 2. Obtener configuraciones
        const config = vscode.workspace.getConfiguration('dartCleanArch.structure');
        const autoDetect = config.get<boolean>('autoDetect', true);
        const defaultMode = config.get<StructureMode>('mode', 'featureFirst');

        // 3. Si autoDetect está deshabilitado, usar el modo por defecto
        if (!autoDetect) {
            return { mode: defaultMode, source: 'default' };
        }

        // 4. Detectar automáticamente
        const detected = this.detectStructureMode(appRootPath);

        // 5. Manejar resultado de detección
        if (detected === 'featureFirst' || detected === 'layerFirst') {
            return { mode: detected, source: 'auto-detect' };
        }

        if (detected === 'ambiguous') {
            const promptOnAmbiguous = config.get<boolean>('promptOnAmbiguous', true);
            
            if (promptOnAmbiguous) {
                const mode = await this.promptForMode(appRootPath, 
                    '⚠️ Se detectaron ambos estilos de estructura. ¿Cuál deseas usar?');
                return { mode, source: 'override' };
            }
            
            // Si no se debe preguntar en ambiguo, usar default
            return { mode: defaultMode, source: 'default' };
        }

        // detected === 'unknown' - usar default
        return { mode: defaultMode, source: 'default' };
    }

    /**
     * Obtiene el modo guardado manualmente para una app específica
     * @param appRootPath Ruta raíz de la aplicación
     * @returns El modo guardado o undefined si no hay override
     */
    private getSavedMode(appRootPath: string): StructureMode | undefined {
        const key = this.getStorageKey(appRootPath);
        return this.context.workspaceState.get<StructureMode>(key);
    }

    /**
     * Guarda el modo seleccionado manualmente para una app específica
     * @param appRootPath Ruta raíz de la aplicación
     * @param mode Modo a guardar
     */
    async saveMode(appRootPath: string, mode: StructureMode): Promise<void> {
        const key = this.getStorageKey(appRootPath);
        await this.context.workspaceState.update(key, mode);
    }

    /**
     * Elimina el override guardado para una app específica
     * @param appRootPath Ruta raíz de la aplicación
     */
    async clearSavedMode(appRootPath: string): Promise<void> {
        const key = this.getStorageKey(appRootPath);
        await this.context.workspaceState.update(key, undefined);
    }

    /**
     * Muestra un diálogo para que el usuario seleccione el modo
     * @param appRootPath Ruta raíz de la aplicación
     * @param message Mensaje personalizado para el diálogo
     * @returns El modo seleccionado
     */
    async promptForMode(appRootPath: string, message?: string): Promise<StructureMode> {
        const options: vscode.QuickPickItem[] = [
            {
                label: '📦 Feature-First',
                description: 'lib/features/<feature>/domain|data|ui/...',
                detail: 'Agrupa código por funcionalidad (recomendado para proyectos pequeños/medianos)'
            },
            {
                label: '🏗️ Layer-First',
                description: 'lib/domain|data|ui/<feature>/...',
                detail: 'Agrupa código por capas arquitectónicas (recomendado para proyectos grandes)'
            },
            {
                label: '🔄 Auto (detectar automáticamente)',
                description: 'La extensión detectará el estilo existente',
                detail: 'Usa Feature-First si no se detecta ningún estilo'
            }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: message || '🏗️ Selecciona el modo de estructura del proyecto',
            ignoreFocusOut: true
        });

        if (!selected) {
            // Usuario canceló - usar default
            const config = vscode.workspace.getConfiguration('dartCleanArch.structure');
            return config.get<StructureMode>('mode', 'featureFirst');
        }

        // Parsear selección
        if (selected.label.includes('Feature-First')) {
            await this.saveMode(appRootPath, 'featureFirst');
            return 'featureFirst';
        } else if (selected.label.includes('Layer-First')) {
            await this.saveMode(appRootPath, 'layerFirst');
            return 'layerFirst';
        } else {
            // Auto - limpiar override y volver a detectar
            await this.clearSavedMode(appRootPath);
            const detected = this.detectStructureMode(appRootPath);
            
            if (detected === 'featureFirst' || detected === 'layerFirst') {
                return detected;
            }
            
            // Si no se puede detectar, usar default
            const config = vscode.workspace.getConfiguration('dartCleanArch.structure');
            return config.get<StructureMode>('mode', 'featureFirst');
        }
    }

    /**
     * Genera una clave única para el almacenamiento basada en la ruta de la app
     * @param appRootPath Ruta raíz de la aplicación
     * @returns Clave para workspaceState
     */
    private getStorageKey(appRootPath: string): string {
        // Normalizar la ruta para evitar problemas con separadores
        const normalizedPath = path.normalize(appRootPath).toLowerCase();
        // Usar un hash simple de la ruta
        const hash = Buffer.from(normalizedPath).toString('base64');
        return `${StructureModeManager.storageKeyPrefix}${hash}`;
    }

    /**
     * Obtiene información de diagnóstico sobre el modo de estructura
     * Útil para debugging y mostrar al usuario
     */
    getDiagnostics(appRootPath: string): {
        detected: DetectionResult;
        saved: StructureMode | undefined;
        config: {
            mode: StructureMode;
            autoDetect: boolean;
            promptOnAmbiguous: boolean;
        };
    } {
        const config = vscode.workspace.getConfiguration('dartCleanArch.structure');
        
        return {
            detected: this.detectStructureMode(appRootPath),
            saved: this.getSavedMode(appRootPath),
            config: {
                mode: config.get<StructureMode>('mode', 'featureFirst'),
                autoDetect: config.get<boolean>('autoDetect', true),
                promptOnAmbiguous: config.get<boolean>('promptOnAmbiguous', true)
            }
        };
    }
}
