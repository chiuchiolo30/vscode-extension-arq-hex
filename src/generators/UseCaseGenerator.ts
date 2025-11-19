import * as fs from 'fs';
import * as path from 'path';
import { StringTransformer } from '../utils/StringTransformer';
import { TemplateGenerator } from './TemplateGenerator';

export class UseCaseGenerator {
  private templateGenerator = new TemplateGenerator();

  async createUseCase(
    projectPath: string,
    featureName: string,
    useCaseName: string,
    projectName: string
  ): Promise<void> {
    // paths en snake_case
    const transformedFeatureName = StringTransformer.transformInput(featureName);
    const transformedUseCaseName = StringTransformer.transformInput(useCaseName);

    const useCaseFilePath = path.join(
      projectPath,
      `lib/features/${transformedFeatureName}/domain/usecases/${transformedUseCaseName}.usecase.dart`
    );

    if (fs.existsSync(useCaseFilePath)) {
      throw new Error(`El caso de uso '${transformedUseCaseName}' ya existe`);
    }

    // actualizar repository (firma)
    await this.updateRepository(projectPath, transformedFeatureName, useCaseName);

    // actualizar repository impl (método)
    await this.updateRepositoryImpl(
      projectPath,
      transformedFeatureName,
      useCaseName,
      projectName
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

  private async updateRepository(
    projectPath: string,
    featureName: string,
    useCaseName: string
  ): Promise<void> {
    const repositoryPath = path.join(
      projectPath,
      `lib/features/${featureName}/domain/repositories/${featureName}.repository.dart`
    );

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
        if (new RegExp(`\\b${methodName}<T>\\(\\);`).test(data)) return;

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
    projectName: string
  ): Promise<void> {
    const repositoryImplPath = path.join(
      projectPath,
      `lib/features/${featureName}/data/repositories/${featureName}.repository_impl.dart`
    );

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
        if (new RegExp(`\\b${methodName}<T>\\(\\)`).test(data)) return;

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
}
