import { StringTransformer } from "../utils/StringTransformer";

export class TemplateGenerator {
  generateDataIndexContent(featureName: string, projectName: string): string {
    return `export 'package:${projectName}/features/${featureName}/data/datasources/index.dart';
export 'package:${projectName}/features/${featureName}/data/models/index.dart';
export 'package:${projectName}/features/${featureName}/data/repositories/${featureName}.repository_impl.dart';`;
  }

  generateDomainIndexContent(featureName: string, projectName: string): string {
    return `export 'package:${projectName}/features/${featureName}/domain/entities/index.dart';
export 'package:${projectName}/features/${featureName}/domain/usecases/index.dart';
export 'package:${projectName}/features/${featureName}/domain/repositories/${featureName}.repository.dart';`;
  }

  generateUiIndexContent(featureName: string, projectName: string): string {
    return `export 'package:${projectName}/features/${featureName}/ui/blocs/index.dart';
export 'package:${projectName}/features/${featureName}/ui/screens/index.dart';
export 'package:${projectName}/features/${featureName}/ui/widgets/index.dart';`;
  }

  generateMainFeatureIndexContent(
    featureName: string,
    projectName: string
  ): string {
    return `export 'package:${projectName}/features/${featureName}/data/index.dart';
export 'package:${projectName}/features/${featureName}/domain/index.dart';
export 'package:${projectName}/features/${featureName}/ui/index.dart';`;
  }

  generateRepositoryContent(className: string): string {
    return `
abstract class ${className}Repository {

	Future<T> create<T>();

	Future<T> read<T>();

	Future<T> update<T>();

	Future<T> delete<T>();
  
}`.trim();
  }

  generateRepositoryImplContent(
    className: string,
    featureName: string,
    projectName: string
  ): string {
    return `
import 'package:${projectName}/features/${featureName}/domain/index.dart';


class ${className}RepositoryImpl extends ${className}Repository {

	@override
	Future<T> create<T>() async {
	// TODO: implement create
	throw UnimplementedError();
	}

	@override
	Future<T> read<T>() async {
	// TODO: implement read
	throw UnimplementedError();
	}

	@override
	Future<T> update<T>() async {
	// TODO: implement update
	throw UnimplementedError();
	}

	@override
	Future<T> delete<T>() async {
	// TODO: implement delete
	throw UnimplementedError();
	}
  
}`.trim();
  }

  generateUseCaseContent(
    method: string,
    className: string,
    featureName: string,
    projectName: string
  ): string {
    const methodCamelCase = StringTransformer.toCamelCase(method); // ✅ método
    const classUseCaseName = `${StringTransformer.toPascalCase(method)}UseCase`; // ✅ clase

    return `
import 'package:${projectName}/features/${featureName}/domain/repositories/${featureName}.repository.dart';

class ${classUseCaseName} {
  const ${classUseCaseName}(this.repository);

  final ${className}Repository repository;

  Future<T> call<T>() async => repository.${methodCamelCase}();
}`.trim();
  }

  //     generateUseCaseContent(method: string, className: string, featureName: string, projectName: string): string {
  //         const methodCapitalized = method.charAt(0).toUpperCase() + method.slice(1);

  //         return `
  // import 'package:${projectName}/features/${featureName}/domain/repositories/${featureName}.repository.dart';

  // class ${methodCapitalized}${className}Usecase {
  // 	const ${methodCapitalized}${className}Usecase(this.repository);

  // 	final ${className}Repository repository;

  // 	Future<T> call<T>() async => repository.${method}();
  // }`.trim();
  //     }

  generateUseCaseIndexContent(
    featureName: string,
    projectName: string,
    useCaseFiles: string[]
  ): string {
    return useCaseFiles
      .map(
        (file) =>
          `export 'package:${projectName}/features/${featureName}/domain/usecases/${file}';`
      )
      .join("\n");
  }

  generateRepositoryWithMethod(className: string, method: string): string {
    return `
abstract class ${className}Repository {

	Future<T> ${method}<T>();

}`.trim();
  }

  generateRepositoryImplWithMethod(
    className: string,
    featureName: string,
    projectName: string,
    method: string
  ): string {
    return `
import 'package:${projectName}/features/${featureName}/domain/index.dart';

class ${className}RepositoryImpl extends ${className}Repository {

	@override
	Future<T> ${method}<T>() async {

		// TODO: implement ${method}
		throw UnimplementedError();

	}

}`.trim();
  }
}
