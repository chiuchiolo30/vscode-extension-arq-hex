import { BaseCommand } from './base/BaseCommand';
import { UseCaseGenerator } from '../generators/UseCaseGenerator';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';

export class CreateUseCaseCommand extends BaseCommand {
    private useCaseGenerator = new UseCaseGenerator();

    getId(): string {
        return 'flutter-arq-hex.createUseCase';
    }

    async execute(): Promise<void> {
        // Resolver el directorio de trabajo (incluye soporte para Melos)
        const workingDir = await this.resolveWorkingDirectory('crear el caso de uso');
        if (!workingDir) {
            return; // El usuario canceló o hubo un error
        }

        if (!this.projectValidator.validateProjectStructure(workingDir)) {
            this.showErrorWithDetails('⚠️ Estructura de proyecto inválida', [
                { icon: '📂', text: 'Requerido: lib/features/' },
                { icon: '💡', text: 'Crea una feature primero' }
            ]);
            return;
        }

        // Obtener la lista de features disponibles
        const availableFeatures = this.projectValidator.getAvailableFeatures(workingDir);
        
        if (!availableFeatures || availableFeatures.length === 0) {
            this.showErrorWithDetails('⚠️ No hay features disponibles', [
                { icon: '📦', text: 'Necesitas crear una feature primero' },
                { icon: '💡', text: 'Usa el comando "Create Feature"' }
            ]);
            return;
        }

        // Mostrar lista de features para seleccionar
        const featureName = await this.showQuickPick(
            availableFeatures,
            '📦 Seleccione la feature que contendrá el caso de uso'
        );

        if (!featureName) {
            this.showError('⚠️ Error: Debe seleccionar una feature');
            return;
        }

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
            await this.useCaseGenerator.createUseCase(workingDir, featureName, useCaseName, projectName);
            this.showSuccessWithDetails('✅ Caso de uso creado exitosamente', [
                { icon: '🔧', text: `Nombre: ${useCaseName}` },
                { icon: '📦', text: `Feature: ${featureName}` },
                { icon: '📁', text: `Ubicación: lib/features/${featureName}/domain/use_cases/` }
            ]);
        } catch (error) {
            this.showError(`❌ Error al crear el caso de uso: ${error}`);
        }
    }
}