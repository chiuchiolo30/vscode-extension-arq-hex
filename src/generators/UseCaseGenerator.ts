import * as fs from 'fs';
import * as path from 'path';
import { StringTransformer } from '../utils/StringTransformer';
import { TemplateGenerator } from './TemplateGenerator';
import { StructureMode } from '../helpers/StructureModeManager';
import { GenerationPlan } from '../helpers/PreviewManager';

export class UseCaseGenerator {
  private templateGenerator = new TemplateGenerator();

  async createUseCase(
    projectPath: string,
    featureName: string,
    useCaseName: string,
    projectName: string,
    mode: StructureMode = 'featureFirst'
  ): Promise<void> {
    // paths en snake_case
    const transformedFeatureName = StringTransformer.transformInput(featureName);
    const transformedUseCaseName = StringTransformer.transformInput(useCaseName);

    const useCaseFilePath = this.getUseCasePath(projectPath, transformedFeatureName, transformedUseCaseName, mode);

    if (fs.existsSync(useCaseFilePath)) {
      throw new Error(`El caso de uso '${transformedUseCaseName}' ya existe`);
    }

    // actualizar repository (firma)
    await this.updateRepository(projectPath, transformedFeatureName, useCaseName, mode);

    // actualizar repository impl (método)
    await this.updateRepositoryImpl(
      projectPath,
      transformedFeatureName,
      useCaseName,
      projectName,
      mode
    );

    // crear archivo del use case
    // Pasamos el nombre tal cual; el TemplateGenerator se encarga:
    // - Clase: PascalCase + sufijo UseCase
    // - Método: camelCase
    const useCaseContent = this.templateGenerator.generateUseCaseContent(
      useCaseName,
      StringTransformer.transformOutput(featureName), // p.ej. "Uno"
      transformedFeatureName,                          // p.ej. "uno"
      projectName
    );

    fs.writeFileSync(useCaseFilePath, useCaseContent);
  }

  /**
   * Obtiene la ruta del archivo de use case según el modo de estructura
   */
  private getUseCasePath(projectPath: string, featureName: string, useCaseName: string, mode: StructureMode): string {
    if (mode === 'featureFirst') {
      return path.join(
        projectPath,
        `lib/features/${featureName}/domain/usecases/${useCaseName}.usecase.dart`
      );
    } else {
      return path.join(
        projectPath,
        `lib/domain/${featureName}/usecases/${useCaseName}.usecase.dart`
      );
    }
  }

  /**
   * Obtiene la ruta del repository según el modo de estructura
   */
  private getRepositoryPath(projectPath: string, featureName: string, mode: StructureMode): string {
    if (mode === 'featureFirst') {
      return path.join(
        projectPath,
        `lib/features/${featureName}/domain/repositories/${featureName}.repository.dart`
      );
    } else {
      return path.join(
        projectPath,
        `lib/domain/${featureName}/repositories/${featureName}.repository.dart`
      );
    }
  }

  /**
   * Obtiene la ruta del repository implementation según el modo de estructura
   */
  private getRepositoryImplPath(projectPath: string, featureName: string, mode: StructureMode): string {
    if (mode === 'featureFirst') {
      return path.join(
        projectPath,
        `lib/features/${featureName}/data/repositories/${featureName}.repository_impl.dart`
      );
    } else {
      return path.join(
        projectPath,
        `lib/data/${featureName}/repositories/${featureName}.repository_impl.dart`
      );
    }
  }

  private async updateRepository(
    projectPath: string,
    featureName: string,
    useCaseName: string,
    mode: StructureMode
  ): Promise<void> {
    const repositoryPath = this.getRepositoryPath(projectPath, featureName, mode);

    // método siempre en camelCase
    const methodName = StringTransformer.toCamelCase(useCaseName);
    const className = StringTransformer.transformOutput(featureName);

    try {
      const data = fs.readFileSync(repositoryPath, 'utf8');

      if (!data.trim()) {
        // Archivo vacío → crear interface completa con un método
        const content = this.templateGenerator.generateRepositoryWithMethod(
          className,
          methodName
        );
        fs.writeFileSync(repositoryPath, content);
      } else {
        // Si ya existe, no lo duplicamos
        if (new RegExp(`\\b${methodName}<T>\\(\\);`).test(data)) {
          return;
        }

        const newData = data.replace(
          /}\s*$/,
          `  \n  Future<T> ${methodName}<T>();\n}`
        );
        fs.writeFileSync(repositoryPath, newData);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // No existe → crear nuevo
        const content = this.templateGenerator.generateRepositoryWithMethod(
          className,
          methodName
        );
        fs.writeFileSync(repositoryPath, content);
      } else {
        throw error;
      }
    }
  }

  private async updateRepositoryImpl(
    projectPath: string,
    featureName: string,
    useCaseName: string,
    projectName: string,
    mode: StructureMode
  ): Promise<void> {
    const repositoryImplPath = this.getRepositoryImplPath(projectPath, featureName, mode);

    const className = StringTransformer.transformOutput(featureName);
    const methodName = StringTransformer.toCamelCase(useCaseName);

    try {
      const data = fs.readFileSync(repositoryImplPath, 'utf8');

      if (!data.trim()) {
        // Archivo vacío → crear implementación con un método
        const content = this.templateGenerator.generateRepositoryImplWithMethod(
          className,
          featureName,
          projectName,
          methodName
        );
        fs.writeFileSync(repositoryImplPath, content);
      } else {
        // Evitar duplicados
        if (new RegExp(`\\b${methodName}<T>\\(\\)`).test(data)) {
          return;
        }

        const methodImplementation = `
\t@override
\tFuture<T> ${methodName}<T>() async {
\t\t// TODO: implement ${methodName}
\t\tthrow UnimplementedError();
\t}`;
        const newData = data.replace(/}\s*$/, `${methodImplementation}\n}`);
        fs.writeFileSync(repositoryImplPath, newData);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const content = this.templateGenerator.generateRepositoryImplWithMethod(
          className,
          featureName,
          projectName,
          methodName
        );
        fs.writeFileSync(repositoryImplPath, content);
      } else {
        throw error;
      }
    }
  }

  /**
   * Planifica la generación de un use case sin crear archivos
   * @returns GenerationPlan con todos los paths que se crearían o modificarían
   */
  public planUseCaseGeneration(
    projectPath: string,
    featureName: string,
    useCaseName: string,
    projectName: string,
    mode: StructureMode,
    appName?: string,
    modeSource?: 'auto-detect' | 'override' | 'default'
  ): GenerationPlan {
    const transformedFeatureName = StringTransformer.transformInput(featureName);
    const transformedUseCaseName = StringTransformer.transformInput(useCaseName);

    const plan: GenerationPlan = {
      appName,
      appRootPath: projectPath,
      structureMode: mode,
      modeSource,
      commandName: 'Create Use Case',
      featureName: transformedFeatureName,
      useCaseName: transformedUseCaseName,
      foldersToCreate: [],
      filesToCreate: []
    };

    // Archivo del use case
    const useCaseFilePath = this.getUseCasePath(projectPath, transformedFeatureName, transformedUseCaseName, mode);
    plan.filesToCreate.push({ path: useCaseFilePath });

    // Repository (se modificará o creará)
    const repositoryPath = this.getRepositoryPath(projectPath, transformedFeatureName, mode);
    if (!fs.existsSync(repositoryPath)) {
      plan.filesToCreate.push({ path: repositoryPath });
    }

    // Repository Implementation (se modificará o creará)
    const repositoryImplPath = this.getRepositoryImplPath(projectPath, transformedFeatureName, mode);
    if (!fs.existsSync(repositoryImplPath)) {
      plan.filesToCreate.push({ path: repositoryImplPath });
    }

    return plan;
  }
}
