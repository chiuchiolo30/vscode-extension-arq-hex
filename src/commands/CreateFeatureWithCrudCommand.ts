import { BaseCommand } from './base/BaseCommand';
import { FeatureStructureGenerator, EntityConfig } from '../generators/FeatureStructureGenerator';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';
import { PreviewManager } from '../helpers/PreviewManager';
import { StringTransformer } from '../utils/StringTransformer';
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
        if (!resolveResult) {
            return; // El usuario canceló o hubo un error
        }

        const { workingDir, appName } = resolveResult;

        // 2. Determinar el modo de estructura efectivo
        const modeResult = await this.structureModeManager!.getEffectiveModeWithSource(workingDir);
        const mode = modeResult.mode;
        const modeSource = modeResult.source;

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

        // 4. Pedir datos de la entidad para CRUD real
        const entityConfig = await this.promptEntityConfig();

        try {
            if (entityConfig) {
                // CRUD completo con entidad real definida por el usuario
                const plan = this.featureGenerator.planFeatureGeneration(
                    workingDir,
                    featureName,
                    projectName,
                    true,
                    mode,
                    appName,
                    modeSource,
                    entityConfig
                );

                const confirmed = await this.previewManager.showPreviewAndConfirm(plan);
                if (!confirmed) {
                    return;
                }

                await this.featureGenerator.createFeatureWithCrud(workingDir, featureName, projectName, mode, entityConfig);
                
                const location = mode === 'featureFirst' 
                    ? `lib/features/${featureName}` 
                    : `lib/domain|data|ui/${featureName}`;

                const fieldsInfo = entityConfig.additionalFields && entityConfig.additionalFields.length > 0
                    ? entityConfig.additionalFields.map(f => `${f.name}: ${f.type}`).join(', ')
                    : 'sin campos adicionales';
                
                this.showSuccessWithDetails('✅ Feature con CRUD creada exitosamente', [
                    { icon: '📦', text: `Nombre: ${featureName}` },
                    { icon: '📁', text: `Ubicación: ${location}` },
                    { icon: '🧩', text: `Entidad: ${entityConfig.entityName}Entity (${entityConfig.identifierField}: ${entityConfig.identifierType})` },
                    { icon: '📝', text: `Campos: ${fieldsInfo}` },
                    { icon: '🎉', text: 'Incluye: Create, Read, Update, Delete' },
                    { icon: '🏗️', text: `Modo: ${mode === 'featureFirst' ? 'Feature-First' : 'Layer-First'}` }
                ]);
            } else {
                // El usuario no definió entidad → generar feature simple sin CRUD fake
                const plan = this.featureGenerator.planFeatureGeneration(
                    workingDir,
                    featureName,
                    projectName,
                    false,
                    mode,
                    appName,
                    modeSource
                );

                const confirmed = await this.previewManager.showPreviewAndConfirm(plan);
                if (!confirmed) {
                    return;
                }

                await this.featureGenerator.createFeature(workingDir, featureName, projectName, mode);
                
                const location = mode === 'featureFirst' 
                    ? `lib/features/${featureName}` 
                    : `lib/domain|data|ui/${featureName}`;
                
                this.showSuccessWithDetails('✅ Feature creada (sin CRUD — no se definió entidad)', [
                    { icon: '📦', text: `Nombre: ${featureName}` },
                    { icon: '📁', text: `Ubicación: ${location}` },
                    { icon: '💡', text: 'Para agregar CRUD, ejecute de nuevo y defina la entidad' },
                    { icon: '🏗️', text: `Modo: ${mode === 'featureFirst' ? 'Feature-First' : 'Layer-First'}` }
                ]);
            }
        } catch (error) {
            this.showError(`❌ Error al crear la feature: ${error}`);
        }
    }

    /**
     * Solicita al usuario los datos de la entidad para CRUD.
     * Si el usuario cancela (Escape) en el nombre de la entidad, retorna undefined.
     */
    private async promptEntityConfig(): Promise<EntityConfig | undefined> {
        // Nombre de la entidad (obligatorio para CRUD)
        const entityName = await vscode.window.showInputBox({
            prompt: '📦 Nombre singular de la entidad (ej: Product, User, Invoice)',
            placeHolder: 'Product',
            validateInput: (value) => {
                if (!value || !value.trim()) {
                    return 'Ingrese un nombre para la entidad';
                }
                if (!this.inputValidator.isValidEntityName(value.trim())) {
                    return 'El nombre debe comenzar con letra y contener solo letras, números o _';
                }
                return undefined;
            }
        });

        if (!entityName) {
            // El usuario canceló → no generar CRUD
            return undefined;
        }

        const entityClassName = StringTransformer.toPascalCase(StringTransformer.transformInput(entityName.trim()));

        // Campo identificador
        const identifierField = await vscode.window.showInputBox({
            prompt: '🔑 Nombre del campo identificador',
            placeHolder: 'id',
            value: 'id',
            validateInput: (value) => {
                if (!value || !value.trim()) {
                    return 'Ingrese un nombre para el campo identificador';
                }
                if (!this.inputValidator.isValidFieldName(value.trim())) {
                    return 'El nombre del campo debe ser un identificador Dart válido';
                }
                return undefined;
            }
        });

        if (!identifierField) {
            return undefined;
        }

        // Tipo del campo identificador
        const identifierType = await vscode.window.showQuickPick(
            ['String', 'int', 'double'],
            {
                placeHolder: 'Tipo del campo identificador',
                title: '🔑 Tipo del identificador'
            }
        );

        if (!identifierType) {
            return undefined;
        }

        // Campos adicionales (opcional)
        const fieldsInput = await vscode.window.showInputBox({
            prompt: '📝 Campos adicionales (formato: name:String, price:double) o dejar vacío',
            placeHolder: 'name:String, price:double, isActive:bool'
        });

        // fieldsInput puede ser undefined (canceló) o '' (vacío). Ambos son válidos.
        const additionalFields = fieldsInput
            ? this.inputValidator.parseFieldDefinitions(fieldsInput)
            : [];

        return {
            entityName: entityClassName,
            identifierField: identifierField.trim(),
            identifierType,
            additionalFields
        };
    }
}
