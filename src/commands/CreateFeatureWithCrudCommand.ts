import { BaseCommand } from './base/BaseCommand';
import { FeatureStructureGenerator } from '../generators/FeatureStructureGenerator';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';
import { PreviewManager } from '../helpers/PreviewManager';
import * as vscode from 'vscode';

export class CreateFeatureWithCrudCommand extends BaseCommand {
    private featureGenerator = new FeatureStructureGenerator();
    private previewManager?: PreviewManager;

    constructor() {
        super();
    }

    getId(): string {
        return 'flutter-arq-hex.createFeatureWithCrud';
    }

    async execute(): Promise<void> {
        // Inicializar PreviewManager si no existe
        if (!this.previewManager) {
            const outputChannel = vscode.window.createOutputChannel('Dart Clean Architecture');
            this.previewManager = new PreviewManager(outputChannel, this.context!);
        }

        // 1. Primero resolver el directorio de trabajo (incluye soporte para Melos)
        const resolveResult = await this.resolveWorkingDirectoryWithInfo('crear la feature');
        console.log('[DEBUG CreateFeatureWithCrudCommand] Working directory resolved:', resolveResult);
        if (!resolveResult) {
            return; // El usuario canceló o hubo un error
        }

        const { workingDir, appName } = resolveResult;

        // 2. Determinar el modo de estructura efectivo
        const modeResult = await this.structureModeManager!.getEffectiveModeWithSource(workingDir);
        const mode = modeResult.mode;
        const modeSource = modeResult.source;
        console.log('[DEBUG CreateFeatureWithCrudCommand] Mode determined:', mode, 'Source:', modeSource);

        // 3. Luego pedir el nombre de la feature
        const featureName = await this.showInputBox('✨ Ingrese el nombre de la feature (ej: users, products)');
        
        if (!featureName) {
            this.showError('⚠️ Error: Debe ingresar un nombre');
            return;
        }

        if (!this.inputValidator.isValidFeatureName(featureName)) {
            this.showError('⚠️ Error: El nombre debe ser solo una palabra sin espacios');
            return;
        }

        const projectName = this.projectValidator.getProjectName(workingDir);
        if (!projectName) {
            this.showError('❌ No se pudo obtener el nombre del proyecto desde pubspec.yaml');
            return;
        }

        try {
            // 4. Planificar la generación
            const plan = this.featureGenerator.planFeatureGeneration(
                workingDir,
                featureName,
                projectName,
                true, // withCrud
                mode,
                appName,
                modeSource
            );

            // 5. Mostrar preview y solicitar confirmación
            const confirmed = await this.previewManager.showPreviewAndConfirm(plan);
            if (!confirmed) {
                return; // Usuario canceló
            }

            // 6. Ejecutar la generación real
            await this.featureGenerator.createFeatureWithCrud(workingDir, featureName, projectName, mode);
            
            // Mensaje de ubicación dinámico según el modo
            const location = mode === 'featureFirst' 
                ? `lib/features/${featureName}` 
                : `lib/domain|data|ui/${featureName}`;
            
            this.showSuccessWithDetails('✅ Feature con CRUD creada exitosamente', [
                { icon: '📦', text: `Nombre: ${featureName}` },
                { icon: '📁', text: `Ubicación: ${location}` },
                { icon: '🎉', text: 'Incluye: Create, Read, Update, Delete' },
                { icon: '🏗️', text: `Modo: ${mode === 'featureFirst' ? 'Feature-First' : 'Layer-First'}` }
            ]);
        } catch (error) {
            this.showError(`❌ Error al crear la feature con CRUD: ${error}`);
        }
    }
}
