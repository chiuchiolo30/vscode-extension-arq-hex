import { BaseCommand } from './base/BaseCommand';
import { FeatureStructureGenerator } from '../generators/FeatureStructureGenerator';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';

export class CreateFeatureCommand extends BaseCommand {
    private featureGenerator = new FeatureStructureGenerator();

    getId(): string {
        return 'flutter-arq-hex.createFeature';
    }

    async execute(): Promise<void> {
        // 1. Primero resolver el directorio de trabajo (incluye soporte para Melos)
        const workingDir = await this.resolveWorkingDirectory('crear la feature');
        if (!workingDir) {
            return; // El usuario canceló o hubo un error
        }

        // 2. Luego pedir el nombre de la feature
        const featureName = await this.showInputBox('✨ Ingrese el nombre de la feature (ej: authentication, products)');
        
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
            await this.featureGenerator.createFeature(workingDir, featureName, projectName);
            this.showSuccessWithDetails('✅ Feature creada exitosamente', [
                { icon: '📦', text: `Nombre: ${featureName}` },
                { icon: '📁', text: `Ubicación: lib/features/${featureName}` }
            ]);
        } catch (error) {
            this.showError(`❌ Error al crear la feature: ${error}`);
        }
    }
}