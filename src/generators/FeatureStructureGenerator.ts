import * as fs from 'fs';
import * as path from 'path';
import { StringTransformer } from '../utils/StringTransformer';
import { FileSystemHelper } from '../helpers/FileSystemHelper';
import { TemplateGenerator } from './TemplateGenerator';
import { StructureMode } from '../helpers/StructureModeManager';
import { GenerationPlan } from '../helpers/PreviewManager';

export interface BasePaths {
    featureRoot?: string;  // Solo para Feature-First
    domainBase: string;
    dataBase: string;
    uiBase: string;
}

export class FeatureStructureGenerator {
    private fileSystemHelper = new FileSystemHelper();
    private templateGenerator = new TemplateGenerator();

    async createFeature(rootPath: string, featureName: string, projectName: string, mode: StructureMode = 'featureFirst'): Promise<void> {
        const transformedFeatureName = StringTransformer.transformInput(featureName);
        
        // Verificar si ya existe la feature (según el modo)
        this.checkFeatureExists(rootPath, transformedFeatureName, mode);

        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib'));
        
        // Crear estructura base según el modo
        this.ensureBaseFolders(rootPath, mode);

        await this.createFeatureStructure(rootPath, transformedFeatureName, projectName, false, mode);
    }

    async createFeatureWithCrud(rootPath: string, featureName: string, projectName: string, mode: StructureMode = 'featureFirst'): Promise<void> {
        const transformedFeatureName = StringTransformer.transformInput(featureName);
        
        // Verificar si ya existe la feature (según el modo)
        this.checkFeatureExists(rootPath, transformedFeatureName, mode);

        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib'));
        
        // Crear estructura base según el modo
        this.ensureBaseFolders(rootPath, mode);

        await this.createFeatureStructure(rootPath, transformedFeatureName, projectName, true, mode);
    }

    /**
     * Verifica si ya existe una feature con el mismo nombre
     * @throws Error si la feature ya existe
     */
    private checkFeatureExists(rootPath: string, featureName: string, mode: StructureMode): void {
        const paths = this.getBasePaths(path.join(rootPath, 'lib'), featureName, mode);
        
        if (mode === 'featureFirst') {
            if (fs.existsSync(paths.featureRoot!)) {
                throw new Error(`Ya existe una feature con el nombre: ${featureName}`);
            }
        } else {
            // Layer-First: verificar si existe en cualquiera de las capas
            if (fs.existsSync(paths.domainBase) || fs.existsSync(paths.dataBase) || fs.existsSync(paths.uiBase)) {
                throw new Error(`Ya existe una feature con el nombre: ${featureName}`);
            }
        }
    }

    /**
     * Asegura que existan las carpetas base según el modo
     */
    private ensureBaseFolders(rootPath: string, mode: StructureMode): void {
        if (mode === 'featureFirst') {
            this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/features'));
        } else {
            this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/domain'));
            this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/data'));
            this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/ui'));
        }
    }

    /**
     * Obtiene las rutas base para las capas según el modo de estructura
     */
    private getBasePaths(libPath: string, featureName: string, mode: StructureMode): BasePaths {
        if (mode === 'featureFirst') {
            const featureRoot = path.join(libPath, 'features', featureName);
            return {
                featureRoot,
                domainBase: path.join(featureRoot, 'domain'),
                dataBase: path.join(featureRoot, 'data'),
                uiBase: path.join(featureRoot, 'ui')
            };
        } else {
            // Layer-First
            return {
                domainBase: path.join(libPath, 'domain', featureName),
                dataBase: path.join(libPath, 'data', featureName),
                uiBase: path.join(libPath, 'ui', featureName)
            };
        }
    }

    private async createFeatureStructure(rootPath: string, featureName: string, projectName: string, withCrud: boolean, mode: StructureMode): Promise<void> {
        const libPath = path.join(rootPath, 'lib');
        const basePaths = this.getBasePaths(libPath, featureName, mode);

        // Crear estructura de directorios
        this.createDirectoryStructure(basePaths);

        // Crear archivos index vacíos
        this.createIndexFiles(basePaths, featureName, projectName);

        // Si es con CRUD, generar archivos adicionales
        if (withCrud) {
            await this.createCrudFiles(basePaths, featureName, projectName);
        }

        // Crear index principal de la feature (solo en Feature-First)
        if (mode === 'featureFirst') {
            this.createMainFeatureIndex(basePaths.featureRoot!, featureName, projectName);
        }
    }

    private createDirectoryStructure(basePaths: BasePaths): void {
        const directories = [
            path.join(basePaths.dataBase, 'datasources/api'),
            path.join(basePaths.dataBase, 'datasources/local'),
            path.join(basePaths.dataBase, 'datasources/remote'),
            path.join(basePaths.dataBase, 'models'),
            path.join(basePaths.dataBase, 'repositories'),
            path.join(basePaths.domainBase, 'entities'),
            path.join(basePaths.domainBase, 'usecases'),
            path.join(basePaths.domainBase, 'repositories'),
            path.join(basePaths.uiBase, 'blocs'),
            path.join(basePaths.uiBase, 'screens'),
            path.join(basePaths.uiBase, 'widgets')
        ];

        directories.forEach(dir => {
            this.fileSystemHelper.ensureDirectoryExists(dir);
        });
    }

    private createIndexFiles(basePaths: BasePaths, featureName: string, projectName: string): void {
        const indexFiles = [
            path.join(basePaths.dataBase, 'datasources/index.dart'),
            path.join(basePaths.dataBase, 'models/index.dart'),
            path.join(basePaths.domainBase, 'entities/index.dart'),
            path.join(basePaths.domainBase, 'usecases/index.dart'),
            path.join(basePaths.uiBase, 'blocs/index.dart'),
            path.join(basePaths.uiBase, 'screens/index.dart'),
            path.join(basePaths.uiBase, 'widgets/index.dart')
        ];

        indexFiles.forEach(file => {
            fs.writeFileSync(file, '');
        });

        // Crear archivos de repositorio vacíos
        fs.writeFileSync(
            path.join(basePaths.dataBase, `repositories/${featureName}.repository_impl.dart`),
            ''
        );
        fs.writeFileSync(
            path.join(basePaths.domainBase, `repositories/${featureName}.repository.dart`),
            ''
        );

        // Crear archivos index principales de cada capa
        this.createLayerIndexFiles(basePaths, featureName, projectName);
    }

    private createLayerIndexFiles(basePaths: BasePaths, featureName: string, projectName: string): void {
        const dataIndex = this.templateGenerator.generateDataIndexContent(featureName, projectName);
        const domainIndex = this.templateGenerator.generateDomainIndexContent(featureName, projectName);
        const uiIndex = this.templateGenerator.generateUiIndexContent(featureName, projectName);

        fs.writeFileSync(path.join(basePaths.dataBase, 'index.dart'), dataIndex);
        fs.writeFileSync(path.join(basePaths.domainBase, 'index.dart'), domainIndex);
        fs.writeFileSync(path.join(basePaths.uiBase, 'index.dart'), uiIndex);
    }

    private async createCrudFiles(basePaths: BasePaths, featureName: string, projectName: string): Promise<void> {
        const className = StringTransformer.transformOutput(featureName);

        // Crear repository abstracto
        const repositoryContent = this.templateGenerator.generateRepositoryContent(className);
        fs.writeFileSync(
            path.join(basePaths.domainBase, `repositories/${featureName}.repository.dart`),
            repositoryContent
        );

        // Crear implementación del repository
        const repositoryImplContent = this.templateGenerator.generateRepositoryImplContent(className, featureName, projectName);
        fs.writeFileSync(
            path.join(basePaths.dataBase, `repositories/${featureName}.repository_impl.dart`),
            repositoryImplContent
        );

        // Crear casos de uso CRUD
        await this.createCrudUseCases(basePaths, featureName, projectName, className);
    }

    private async createCrudUseCases(basePaths: BasePaths, featureName: string, projectName: string, className: string): Promise<void> {
        const useCases = ['create', 'read', 'update', 'delete'];
        const useCaseFiles: string[] = [];

        for (const useCase of useCases) {
            const useCaseContent = this.templateGenerator.generateUseCaseContent(useCase, className, featureName, projectName);
            const fileName = `${useCase}_${featureName}.usecase.dart`;
            
            fs.writeFileSync(
                path.join(basePaths.domainBase, `usecases/${fileName}`),
                useCaseContent
            );
            
            useCaseFiles.push(fileName);
        }

        // Crear index de casos de uso
        const useCaseIndexContent = this.templateGenerator.generateUseCaseIndexContent(featureName, projectName, useCaseFiles);
        fs.writeFileSync(
            path.join(basePaths.domainBase, 'usecases/index.dart'),
            useCaseIndexContent
        );
    }

    private createMainFeatureIndex(featurePath: string, featureName: string, projectName: string): void {
        const mainIndexContent = this.templateGenerator.generateMainFeatureIndexContent(featureName, projectName);
        fs.writeFileSync(path.join(featurePath, 'index.dart'), mainIndexContent);
    }

    /**
     * Planifica la generación de una feature sin crear archivos/carpetas
     * @returns GenerationPlan con todos los paths que se crearían
     */
    public planFeatureGeneration(
        rootPath: string,
        featureName: string,
        projectName: string,
        withCrud: boolean,
        mode: StructureMode,
        appName?: string,
        modeSource?: 'auto-detect' | 'override' | 'default'
    ): GenerationPlan {
        const transformedFeatureName = StringTransformer.transformInput(featureName);
        const libPath = path.join(rootPath, 'lib');
        const basePaths = this.getBasePaths(libPath, transformedFeatureName, mode);

        const plan: GenerationPlan = {
            appName,
            appRootPath: rootPath,
            structureMode: mode,
            modeSource,
            commandName: withCrud ? 'Create Feature with CRUD' : 'Create Feature',
            featureName: transformedFeatureName,
            foldersToCreate: [],
            filesToCreate: []
        };

        // Carpetas base según modo
        if (mode === 'featureFirst') {
            plan.foldersToCreate.push(path.join(rootPath, 'lib/features'));
        } else {
            plan.foldersToCreate.push(
                path.join(rootPath, 'lib/domain'),
                path.join(rootPath, 'lib/data'),
                path.join(rootPath, 'lib/ui')
            );
        }

        // Estructura de directorios
        const directories = [
            path.join(basePaths.dataBase, 'datasources/api'),
            path.join(basePaths.dataBase, 'datasources/local'),
            path.join(basePaths.dataBase, 'datasources/remote'),
            path.join(basePaths.dataBase, 'models'),
            path.join(basePaths.dataBase, 'repositories'),
            path.join(basePaths.domainBase, 'entities'),
            path.join(basePaths.domainBase, 'usecases'),
            path.join(basePaths.domainBase, 'repositories'),
            path.join(basePaths.uiBase, 'blocs'),
            path.join(basePaths.uiBase, 'screens'),
            path.join(basePaths.uiBase, 'widgets')
        ];

        plan.foldersToCreate.push(...directories);

        // Archivos index
        const indexFiles = [
            path.join(basePaths.dataBase, 'datasources/index.dart'),
            path.join(basePaths.dataBase, 'models/index.dart'),
            path.join(basePaths.domainBase, 'entities/index.dart'),
            path.join(basePaths.domainBase, 'usecases/index.dart'),
            path.join(basePaths.uiBase, 'blocs/index.dart'),
            path.join(basePaths.uiBase, 'screens/index.dart'),
            path.join(basePaths.uiBase, 'widgets/index.dart'),
            path.join(basePaths.dataBase, `repositories/${transformedFeatureName}.repository_impl.dart`),
            path.join(basePaths.domainBase, `repositories/${transformedFeatureName}.repository.dart`),
            path.join(basePaths.dataBase, 'index.dart'),
            path.join(basePaths.domainBase, 'index.dart'),
            path.join(basePaths.uiBase, 'index.dart')
        ];

        plan.filesToCreate.push(...indexFiles.map(p => ({ path: p })));

        // Index principal (solo Feature-First)
        if (mode === 'featureFirst') {
            plan.filesToCreate.push({ path: path.join(basePaths.featureRoot!, 'index.dart') });
        }

        // Archivos CRUD si aplica
        if (withCrud) {
            const useCases = ['create', 'read', 'update', 'delete'];
            useCases.forEach(useCase => {
                const fileName = `${useCase}_${transformedFeatureName}.usecase.dart`;
                plan.filesToCreate.push({ path: path.join(basePaths.domainBase, `usecases/${fileName}`) });
            });
        }

        return plan;
    }
}