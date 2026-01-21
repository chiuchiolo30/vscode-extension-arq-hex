import { BaseCommand } from './base/BaseCommand';
import { UseCaseGenerator } from '../generators/UseCaseGenerator';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';
import { PreviewManager } from '../helpers/PreviewManager';
import * as vscode from 'vscode';

export class CreateUseCaseCommand extends BaseCommand {
    private useCaseGenerator = new UseCaseGenerator();
    private previewManager?: PreviewManager;

    constructor() {
        super();
    }

    getId(): string {
        return 'flutter-arq-hex.createUseCase';
    }

    async execute(): Promise<void> {
        // Inicializar PreviewManager si no existe
        if (!this.previewManager) {
            const outputChannel = vscode.window.createOutputChannel('Dart Clean Architecture');
            this.previewManager = new PreviewManager(outputChannel, this.context!);
        }

        // 1. Resolver el directorio de trabajo (incluye soporte para Melos)
        const resolveResult = await this.resolveWorkingDirectoryWithInfo('crear el caso de uso');
        if (!resolveResult) {
            return; // El usuario canceló o hubo un error
        }

        const { workingDir, appName } = resolveResult;

        // 2. Determinar el modo de estructura efectivo
        const modeResult = await this.structureModeManager!.getEffectiveModeWithSource(workingDir);
        const mode = modeResult.mode;
        const modeSource = modeResult.source;

        // 3. Validar estructura según el modo
        if (!this.projectValidator.validateProjectStructure(workingDir, mode)) {
            const requiredStructure = mode === 'featureFirst' 
                ? 'lib/features/' 
                : 'lib/domain|data|ui/';
            
            this.showErrorWithDetails('⚠️ Estructura de proyecto inválida', [
                { icon: '📂', text: `Requerido: ${requiredStructure}` },
                { icon: '💡', text: 'Crea una feature primero' }
            ]);
            return;
        }

        // 4. Obtener la lista de features disponibles según el modo
        const availableFeatures = this.projectValidator.getAvailableFeatures(workingDir, mode);
        
        if (!availableFeatures || availableFeatures.length === 0) {
            this.showErrorWithDetails('⚠️ No hay features disponibles', [
                { icon: '📦', text: 'Necesitas crear una feature primero' },
                { icon: '💡', text: 'Usa el comando "Create Feature"' }
            ]);
            return;
        }

        // 5. Mostrar lista de features para seleccionar
        const featureName = await this.showQuickPick(
            availableFeatures,
            '📦 Seleccione la feature que contendrá el caso de uso'
        );

        if (!featureName) {
            this.showError('⚠️ Error: Debe seleccionar una feature');
            return;
        }

        // 6. Solicitar nombre del caso de uso
        const useCaseName = await this.showInputBox('🔧 Ingrese el nombre del caso de uso (ej: get-user-profile, create-order)');
        
        if (!useCaseName) {
            this.showError('⚠️ Error: Debe ingresar un nombre de caso de uso');
            return;
        }

        if (!this.inputValidator.isValidFeatureName(useCaseName)) {
            this.showError('⚠️ Error: Ingrese un nombre válido (sin espacios ni caracteres especiales)');
            return;
        }

        const projectName = this.projectValidator.getProjectName(workingDir);
        if (!projectName) {
            this.showError('❌ No se pudo obtener el nombre del proyecto desde pubspec.yaml');
            return;
        }

        try {
            // 7. Planificar la generación
            const plan = this.useCaseGenerator.planUseCaseGeneration(
                workingDir,
                featureName,
                useCaseName,
                projectName,
                mode,
                appName,
                modeSource
            );

            // 8. Mostrar preview y solicitar confirmación
            const confirmed = await this.previewManager.showPreviewAndConfirm(plan);
            if (!confirmed) {
                return; // Usuario canceló
            }

            // 9. Ejecutar la generación real
            await this.useCaseGenerator.createUseCase(workingDir, featureName, useCaseName, projectName, mode);
            
            // Mensaje de ubicación dinámico según el modo
            const location = mode === 'featureFirst' 
                ? `lib/features/${featureName}/domain/usecases/` 
                : `lib/domain/${featureName}/usecases/`;
            
            this.showSuccessWithDetails('✅ Caso de uso creado exitosamente', [
                { icon: '🔧', text: `Nombre: ${useCaseName}` },
                { icon: '📦', text: `Feature: ${featureName}` },
                { icon: '📁', text: `Ubicación: ${location}` },
                { icon: '🏗️', text: `Modo: ${mode === 'featureFirst' ? 'Feature-First' : 'Layer-First'}` }
            ]);
        } catch (error) {
            this.showError(`❌ Error al crear el caso de uso: ${error}`);
        }
    }
}