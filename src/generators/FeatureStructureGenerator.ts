import * as fs from 'fs';
import * as path from 'path';
import { StringTransformer } from '../utils/StringTransformer';
import { FileSystemHelper } from '../helpers/FileSystemHelper';
import { TemplateGenerator } from './TemplateGenerator';

export class FeatureStructureGenerator {
    private fileSystemHelper = new FileSystemHelper();
    private templateGenerator = new TemplateGenerator();

    async createFeature(rootPath: string, featureName: string, projectName: string): Promise<void> {
        const transformedFeatureName = StringTransformer.transformInput(featureName);
        const featurePath = path.join(rootPath, `lib/features/${transformedFeatureName}`);

        if (fs.existsSync(featurePath)) {
            throw new Error(`Ya existe una feature con el nombre: ${transformedFeatureName}`);
        }

        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib'));
        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/features'));

        await this.createFeatureStructure(featurePath, transformedFeatureName, projectName, false);
    }

    async createFeatureWithCrud(rootPath: string, featureName: string, projectName: string): Promise<void> {
        const transformedFeatureName = StringTransformer.transformInput(featureName);
        const featurePath = path.join(rootPath, `lib/features/${transformedFeatureName}`);

        if (fs.existsSync(featurePath)) {
            throw new Error(`Ya existe una feature con el nombre: ${transformedFeatureName}`);
        }

        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib'));
        this.fileSystemHelper.ensureDirectoryExists(path.join(rootPath, 'lib/features'));

        await this.createFeatureStructure(featurePath, transformedFeatureName, projectName, true);
    }

    private async createFeatureStructure(featurePath: string, featureName: string, projectName: string, withCrud: boolean): Promise<void> {
        // Crear estructura de directorios
        this.createDirectoryStructure(featurePath);

        // Crear archivos index vacíos
        this.createIndexFiles(featurePath, featureName, projectName);

        // Si es con CRUD, generar archivos adicionales
        if (withCrud) {
            await this.createCrudFiles(featurePath, featureName, projectName);
        }

        // Crear index principal de la feature
        this.createMainFeatureIndex(featurePath, featureName, projectName);
    }

    private createDirectoryStructure(featurePath: string): void {
        const directories = [
            'data/datasources/api',
            'data/datasources/local',
            'data/datasources/remote',
            'data/models',
            'data/repositories',
            'domain/entities',
            'domain/usecases',
            'domain/repositories',
            'ui/blocs',
            'ui/screens',
            'ui/widgets'
        ];

        directories.forEach(dir => {
            this.fileSystemHelper.ensureDirectoryExists(path.join(featurePath, dir));
        });
    }

    private createIndexFiles(featurePath: string, featureName: string, projectName: string): void {
        const indexFiles = [
            'data/datasources/index.dart',
            'data/models/index.dart',
            'domain/entities/index.dart',
            'domain/usecases/index.dart',
            'ui/blocs/index.dart',
            'ui/screens/index.dart',
            'ui/widgets/index.dart'
        ];

        indexFiles.forEach(file => {
            fs.writeFileSync(path.join(featurePath, file), '');
        });

        // Crear archivos de repositorio vacíos
        fs.writeFileSync(
            path.join(featurePath, `data/repositories/${featureName}.repository_impl.dart`),
            ''
        );
        fs.writeFileSync(
            path.join(featurePath, `domain/repositories/${featureName}.repository.dart`),
            ''
        );

        // Crear archivos index principales de cada capa
        this.createLayerIndexFiles(featurePath, featureName, projectName);
    }

    private createLayerIndexFiles(featurePath: string, featureName: string, projectName: string): void {
        const dataIndex = this.templateGenerator.generateDataIndexContent(featureName, projectName);
        const domainIndex = this.templateGenerator.generateDomainIndexContent(featureName, projectName);
        const uiIndex = this.templateGenerator.generateUiIndexContent(featureName, projectName);

        fs.writeFileSync(path.join(featurePath, 'data/index.dart'), dataIndex);
        fs.writeFileSync(path.join(featurePath, 'domain/index.dart'), domainIndex);
        fs.writeFileSync(path.join(featurePath, 'ui/index.dart'), uiIndex);
    }

    private async createCrudFiles(featurePath: string, featureName: string, projectName: string): Promise<void> {
        const className = StringTransformer.transformOutput(featureName);

        // Crear repository abstracto
        const repositoryContent = this.templateGenerator.generateRepositoryContent(className);
        fs.writeFileSync(
            path.join(featurePath, `domain/repositories/${featureName}.repository.dart`),
            repositoryContent
        );

        // Crear implementación del repository
        const repositoryImplContent = this.templateGenerator.generateRepositoryImplContent(className, featureName, projectName);
        fs.writeFileSync(
            path.join(featurePath, `data/repositories/${featureName}.repository_impl.dart`),
            repositoryImplContent
        );

        // Crear casos de uso CRUD
        await this.createCrudUseCases(featurePath, featureName, projectName, className);
    }

    private async createCrudUseCases(featurePath: string, featureName: string, projectName: string, className: string): Promise<void> {
        const useCases = ['create', 'read', 'update', 'delete'];
        const useCaseFiles: string[] = [];

        for (const useCase of useCases) {
            const useCaseContent = this.templateGenerator.generateUseCaseContent(useCase, className, featureName, projectName);
            const fileName = `${useCase}_${featureName}.usecase.dart`;
            
            fs.writeFileSync(
                path.join(featurePath, `domain/usecases/${fileName}`),
                useCaseContent
            );
            
            useCaseFiles.push(fileName);
        }

        // Crear index de casos de uso
        const useCaseIndexContent = this.templateGenerator.generateUseCaseIndexContent(featureName, projectName, useCaseFiles);
        fs.writeFileSync(
            path.join(featurePath, 'domain/usecases/index.dart'),
            useCaseIndexContent
        );
    }

    private createMainFeatureIndex(featurePath: string, featureName: string, projectName: string): void {
        const mainIndexContent = this.templateGenerator.generateMainFeatureIndexContent(featureName, projectName);
        fs.writeFileSync(path.join(featurePath, 'index.dart'), mainIndexContent);
    }
}