import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


const transformInput  = (input: string) => input.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase();
const transformOutput = (output: string) => {
	const camelCase = output.replace(/(_[a-z\d])/g, (match) => match.toUpperCase().replace('_', ''));
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
const createProjectFolders = async (rootPath: string, projectName: string, crud: boolean = false) => {

	const data   = 'data';
	const domain = 'domain';
	const ui 	 = 'ui';
	const feature = rootPath.replace(/\\/g, '/').split('/').pop()!;
	
	// Creando la capa Data
	
	fs.mkdirSync(path.join(rootPath, `${data}/datasources/api`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${data}/datasources/local`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${data}/datasources/remote`), { recursive: true });
	

	fs.mkdirSync(path.join(rootPath, `${data}/dto`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${data}/repositories`), { recursive: true });

	const f1 = fs.openSync(`${path.join(rootPath, `${data}/datasources/index.dart`)}`,'w');
	fs.closeSync(f1);

	const f2 = fs.openSync(`${path.join(rootPath, `${data}/dto/index.dart`)}`,'w');
	fs.closeSync(f2);
	
	const f3 = fs.openSync(`${path.join(rootPath, `${data}/repositories/${feature}.repository_impl.dart`)}`,'w');
	fs.closeSync(f3);

	let fileContentData = `export 'package:${projectName}/features/${feature}/data/datasources/index.dart';\n`;
	fileContentData += `export 'package:${projectName}/features/${feature}/data/dto/index.dart';\n`;
	fileContentData += `export 'package:${projectName}/features/${feature}/data/repositories/${feature}.repository_impl.dart';`;

	fs.writeFileSync(`${path.join(rootPath, `${data}/index.dart`)}`, fileContentData);

	// Creando la capa Domain

	fs.mkdirSync(path.join(rootPath, `${domain}/entities`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${domain}/usecases`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${domain}/repositories`), { recursive: true });

	const f4 = fs.openSync(`${path.join(rootPath, `${domain}/entities/index.dart`)}`,'w');
	fs.closeSync(f4);

	const f5 = fs.openSync(`${path.join(rootPath, `${domain}/usecases/index.dart`)}`,'w');
	fs.closeSync(f5);

	const f6 = fs.openSync(`${path.join(rootPath, `${domain}/repositories/${feature}.repository.dart`)}`,'w');
	fs.closeSync(f6);

	if (crud) {
		const name = transformOutput(feature);

		const content = `
		abstract class ${name}Repository {

			Future<T> create<T>();
		
			Future<T> read<T>();
		
			Future<T> update<T>();
		
			Future<T> delete<T>();
		  
		}`;

		const content2 = `
		import 'package:${projectName}/features/${feature}/domain/index.dart';


		class ${name}RepositoryImpl extends ${name}Repository {

			@override
			Future<T> create<T>() async {
			\/\/ TODO: implement create
			throw UnimplementedError();
			}

			@override
			Future<T> read<T>() async {
			\/\/ TODO: implement read
			throw UnimplementedError();
			}

			@override
			Future<T> update<T>() async {
			\/\/ TODO: implement update
			throw UnimplementedError();
			}

			@override
			Future<T> delete<T>() async {
			\/\/ TODO: implement delete
			throw UnimplementedError();
			}
		  
		}`;

		const repository = `import 'package:${projectName}/features/${feature}/domain/repositories/${feature}.repository.dart';`;

		const create = `
		${repository}
		
		class Create${name}Usecase {
			const Create${name}Usecase(this.repository);
	  
			final ${name}Repository repository;
	  
			Future<T> call<T>() async => repository.create();
		}`;

		const read = `
		${repository}
		
		class Read${name}Usecase {
			const Read${name}Usecase(this.repository);
	  
			final ${name}Repository repository;
	  
			Future<T> call<T>() async => repository.read();
		}`;

		const update = `
		${repository}
		
		class Update${name}Usecase {
			const Update${name}Usecase(this.repository);
	  
			final ${name}Repository repository;
	  
			Future<T> call<T>() async => repository.update();
		}`;

		const deleted = `
		${repository}
		
		class Delete${name}Usecase {
			const Delete${name}Usecase(this.repository);
	  
			final ${name}Repository repository;
	  
			Future<T> call<T>() async => repository.delete();
		}`;


		fs.writeFile(`${path.join(rootPath, `${domain}/repositories/${feature}.repository.dart`)}`, content, (err) => {
			if (err) {
				console.error(err);
				return;
			}

			fs.writeFile(`${path.join(rootPath, `${data}/repositories/${feature}.repository_impl.dart`)}`, content2, (err) => {
				if (err) {
					console.error(err);
					return;
				}
				fs.writeFile(`${path.join(rootPath, `${domain}/usecases/create_${feature}.usecase.dart`)}`, create, (err) => {
					if (err) {
						console.error(err);
						return;
					}
					
				});
				fs.writeFile(`${path.join(rootPath, `${domain}/usecases/read_${feature}.usecase.dart`)}`, read, (err) => {
					if (err) {
						console.error(err);
						return;
					}
					
				});
				fs.writeFile(`${path.join(rootPath, `${domain}/usecases/update_${feature}.usecase.dart`)}`, update, (err) => {
					if (err) {
						console.error(err);
						return;
					}
					
				});
				fs.writeFile(`${path.join(rootPath, `${domain}/usecases/delete_${feature}.usecase.dart`)}`, deleted, (err) => {
					if (err) {
						console.error(err);
						return;
					}
					
				});

				let exportaciones = `export 'package:${projectName}/features/${feature}/domain/usecases/create_${feature}.usecase.dart';\n`;
				exportaciones += `export 'package:${projectName}/features/${feature}/domain/usecases/delete_${feature}.usecase.dart';\n`;
				exportaciones += `export 'package:${projectName}/features/${feature}/domain/usecases/read_${feature}.usecase.dart';\n`;
				exportaciones += `export 'package:${projectName}/features/${feature}/domain/usecases/update_${feature}.usecase.dart';`;

				

				fs.writeFile(`${path.join(rootPath, `${domain}/usecases/index.dart`)}`, exportaciones.trimStart(), (err) => {
					if (err) {
						console.error(err);
						return;
					}
					
				});
				
			});
			
		});
	}

	 

	let fileContentDomain = `export 'package:${projectName}/features/${feature}/domain/entities/index.dart';\n`;
	fileContentDomain += `export 'package:${projectName}/features/${feature}/domain/usecases/index.dart';\n`;
	fileContentDomain += `export 'package:${projectName}/features/${feature}/domain/repositories/${feature}.repository.dart';`;

	fs.writeFileSync(`${path.join(rootPath, `${domain}/index.dart`)}`,fileContentDomain);

	// Creando la capa ui

	fs.mkdirSync(path.join(rootPath, `${ui}/blocs`),   { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${ui}/screens`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${ui}/widgets`), { recursive: true });

	let f7 = fs.openSync(`${path.join(rootPath, `${ui}/blocs/index.dart`)}`,'w');
	fs.closeSync(f7);

	let f8 = fs.openSync(`${path.join(rootPath, `${ui}/screens/index.dart`)}`,'w');
	fs.closeSync(f8);

	let f9 = fs.openSync(`${path.join(rootPath, `${ui}/widgets/index.dart`)}`,'w');
	fs.closeSync(f9);

	let fileContentUi = `export 'package:${projectName}/features/${feature}/ui/blocs/index.dart';\n`;
	fileContentUi += `export 'package:${projectName}/features/${feature}/ui/screens/index.dart';\n`;
	fileContentUi += `export 'package:${projectName}/features/${feature}/ui/widgets/index.dart';`;

	fs.writeFileSync(`${path.join(rootPath, `${ui}/index.dart`)}`, fileContentUi);

	let fileContentFeature = `export 'package:${projectName}/features/${feature}/data/index.dart';\n`;
	fileContentFeature += `export 'package:${projectName}/features/${feature}/domain/index.dart';\n`;
	fileContentFeature += `export 'package:${projectName}/features/${feature}/ui/index.dart';`;

	// Agrenado el index de la feature
	fs.writeFileSync(`${path.join(rootPath, `index.dart`)}`, fileContentFeature);

  };

export function activate(context: vscode.ExtensionContext) {

  let disposable = vscode.commands.registerCommand('flutter-arq-hex.createFeature', () =>  {

    vscode.window.showInputBox({ prompt: 'Enter the feature name' }).then(async featureName => {

		var currentDir = vscode.workspace.rootPath;

		if (!currentDir) {
			if (!vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders!.length === 0) {
				vscode.window.showInformationMessage(`Error: No se pudo encontrar el directorio 1`);
				return;
			}
			currentDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
		}
		
		if (currentDir.length === 0) {
			vscode.window.showInformationMessage(`Error: No se pudo encontrar el directorio 2`);
				return;
		}

		if (featureName) {

			if (!/^[a-zA-Z0-9]+$/.test(featureName)) {
				vscode.window.showInformationMessage('Error: El nombre debe ser solo una palabra sin espacios');
				return;
			}
		
			// let currentDir = path.resolve(__dirname, '../');
			
			// Valido que se encuentre en el directorio raiz del proyecto.
			if(!fs.existsSync(path.join(currentDir, 'pubspec.yaml'))) {
				vscode.window.showInformationMessage('No se encontró el archivo pubspec.yaml. Debes ejecutar este script desde el directorio raíz de tu proyecto de Flutter.');
				return;
			}

			// Obtengo el nombre del proyecto
			const pubspecPath 		= path.join(currentDir, 'pubspec.yaml');
			const pubspecContents 	= fs.readFileSync(pubspecPath, 'utf8');
			const projectName 		= pubspecContents.match(/name: (.+)/)![1] ;
			const PROJECT_NAME 		= projectName.trim();

			// Si no existe el directorio [lib] lo creo
			if(!fs.existsSync(path.join(currentDir, 'lib'))) {
				fs.mkdirSync(path.join(currentDir, 'lib'), { recursive: true });
			}

			// Si no existe el directorio [features] lo creo
			if(!fs.existsSync(path.join(currentDir, 'lib/features'))) {
				fs.mkdirSync(path.join(currentDir, 'lib/features'), { recursive: true });
			}
			// Valido que la feature por crear no exista
			if(!fs.existsSync(path.join(currentDir, `lib/features/${transformInput(featureName)}`))) {
				
				await createProjectFolders(`${path.join(currentDir, `lib/features/${transformInput(featureName)}`)}`, PROJECT_NAME);

			} else {
				vscode.window.showInformationMessage(`Ya existe una feature con el nombre: ${transformInput(featureName)}`);
			}
		
      } else {
		vscode.window.showInformationMessage('Error: Debe ingresar un nombre');
		return;
	  }

    });
  });

  let disposable2 = vscode.commands.registerCommand('flutter-arq-hex.createFeatureWithCrud', () =>  {

    vscode.window.showInputBox({ prompt: 'Enter the feature name' }).then(async featureName => {

		let currentDir = vscode.workspace.rootPath;;

		if (!currentDir) {
			if (!vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders!.length === 0) {
				vscode.window.showInformationMessage(`Error: No se pudo encontrar el directorio`);
				return;
			}
			currentDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
		}

		if (currentDir.length === 0) {
			vscode.window.showInformationMessage(`Error: No se pudo encontrar el directorio 2`);
				return;
		}
      
		if (featureName) {

			if (!/^[a-zA-Z0-9]+$/.test(featureName)) {
				vscode.window.showInformationMessage('Error: El nombre debe ser solo una palabra sin espacios');
				return;
			}
		
			// let currentDir = path.resolve(__dirname, '../');

			// Valido que se encuentre en el directorio raiz del proyecto.
			if(!fs.existsSync(path.join(currentDir, 'pubspec.yaml'))) {
				vscode.window.showInformationMessage('No se encontró el archivo pubspec.yaml. Debes ejecutar este script desde el directorio raíz de tu proyecto de Flutter.');
				return;
			}

			// Obtengo el nombre del proyecto
			const pubspecPath 		= path.join(currentDir, 'pubspec.yaml');
			const pubspecContents 	= fs.readFileSync(pubspecPath, 'utf8');
			const projectName 		= pubspecContents.match(/name: (.+)/)![1] ;
			const PROJECT_NAME 		= projectName.trim();

			// Si no existe el directorio [lib] lo creo
			if(!fs.existsSync(path.join(currentDir, 'lib'))) {
				fs.mkdirSync(path.join(currentDir, 'lib'), { recursive: true });
			}

			// Si no existe el directorio [features] lo creo
			if(!fs.existsSync(path.join(currentDir, 'lib/features'))) {
				fs.mkdirSync(path.join(currentDir, 'lib/features'), { recursive: true });
			}
			// Valido que la feature por crear no exista
			if(!fs.existsSync(path.join(currentDir, `lib/features/${transformInput(featureName)}`))) {
				
				await createProjectFolders(`${path.join(currentDir, `lib/features/${transformInput(featureName)}`)}`, PROJECT_NAME, true);

			} else {
				vscode.window.showInformationMessage(`Ya existe una feature con el nombre: ${transformInput(featureName)}`);
			}
		
      } else {
		vscode.window.showInformationMessage('Error: Debe ingresar un nombre');
		return;
	  }

    });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
export function deactivate() {}
