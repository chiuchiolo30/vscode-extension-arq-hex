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
	

	fs.mkdirSync(path.join(rootPath, `${data}/models`), { recursive: true });
	fs.mkdirSync(path.join(rootPath, `${data}/repositories`), { recursive: true });

	const f1 = fs.openSync(`${path.join(rootPath, `${data}/datasources/index.dart`)}`,'w');
	fs.closeSync(f1);

	const f2 = fs.openSync(`${path.join(rootPath, `${data}/models/index.dart`)}`,'w');
	fs.closeSync(f2);
	
	const f3 = fs.openSync(`${path.join(rootPath, `${data}/repositories/${feature}.repository_impl.dart`)}`,'w');
	fs.closeSync(f3);

	let fileContentData = `export 'package:${projectName}/features/${feature}/data/datasources/index.dart';\n`;
	fileContentData += `export 'package:${projectName}/features/${feature}/data/models/index.dart';\n`;
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

    vscode.window.showInputBox({ prompt: 'Ingrese el nombre de la feature por crear' }).then(async featureName => {

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

			if (!/^[a-zA-Z0-9_-]+$/.test(featureName)) {
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

    vscode.window.showInputBox({ prompt: 'Ingrese el nombre de la feature por crear' }).then(async featureName => {

                let currentDir = vscode.workspace.rootPath;

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

			if (!/^[a-zA-Z0-9_-]+$/.test(featureName)) {
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

  let disposable3 = vscode.commands.registerCommand('flutter-arq-hex.createUseCase', () =>  {

    vscode.window.showInputBox({ prompt: 'Ingrese el nombre de la feature que contendra el caso de uso' }).then(async featureName => {

		var currentDir = vscode.workspace.rootPath;

		if (!currentDir) {
			if (!vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders!.length === 0) {
				vscode.window.showInformationMessage(`You must start a Flutter project`);
				return;
			}
			currentDir = vscode.workspace.workspaceFolders![0].uri.fsPath;
		}

		if (currentDir.length === 0) {
			vscode.window.showInformationMessage(`Debes iniciar un proyecto de Flutter`);
			return;
		}
		
		// Valido que se encuentre en el directorio raiz del proyecto.
		if(!fs.existsSync(path.join(currentDir, 'pubspec.yaml'))) {
			vscode.window.showInformationMessage('No se encontró el archivo pubspec.yaml. Debe ejecutar la extension desde el directorio raíz de su proyecto Flutter.');
			return;
		}
		if(!fs.existsSync(path.join(currentDir, 'pubspec.yaml'))) {
			vscode.window.showInformationMessage('No se encontró el archivo pubspec.yaml. Debe ejecutar la extension desde el directorio raíz de su proyecto Flutter.');
			return;
		}
		if(!fs.existsSync(path.join(currentDir, 'lib'))) {
			vscode.window.showInformationMessage('No se encontró el directorio \'lib \'.');
			return;
		}
		if(!fs.existsSync(path.join(currentDir, 'lib/features'))) {
			vscode.window.showInformationMessage('No se encontró el directorio \'features\'.');
			return;
		}

		if(featureName) {
			if(!fs.existsSync(path.join(currentDir, `lib/features/${transformInput(featureName)}`))) {
				vscode.window.showInformationMessage(`No se encontró ninguna feature: ${featureName}`);
				return;
			}
			if (!/^[a-zA-Z0-9_-]+$/.test(featureName)) {
				vscode.window.showInformationMessage('Error: Ingrese un nombre válido.');
				return;
			}

			vscode.window.showInputBox({ prompt: 'Enter the use case name'}).then(async useCase => {
				
				if(useCase) {
					if (!/^[a-zA-Z0-9_-]+$/.test(useCase)) {
						vscode.window.showInformationMessage('Error: Ingrese un nombre válido.');
						return;
					}
				}

				if(fs.existsSync(path.join(currentDir!, `lib/features/${transformInput(featureName)}/domain/usecases/${transformInput(useCase!)}.usecase.dart`))) {
					vscode.window.showInformationMessage(`El caso de uso \'${transformInput(useCase!)}\' ya existe`);
					return;
				}

				// Obtengo el nombre del proyecto
				const pubspecPath 		= path.join(currentDir!, 'pubspec.yaml');
				const pubspecContents 	= fs.readFileSync(pubspecPath, 'utf8');
				const projectName 		= pubspecContents.match(/name: (.+)/)![1] ;
				const PROJECT_NAME 		= projectName.trim();

				// Valido que exista el repositorio (firma)
				fs.readFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/domain/repositories/${transformInput(featureName)}.repository.dart`), 'utf8', (err, data) => {
					if (err) {
						if (err.code === 'ENOENT') {
						// El archivo no existe, escribir en el archivo directamente
							let content  = `\n\nabstract class ${transformOutput(featureName)}Repository {\n\n`;
								content += `\tFuture<T> ${useCase?.toLowerCase()}<T>();\n\n}`;
							
							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/domain/repositories/${transformInput(featureName)}.repository.dart`), content, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}								
							});
						} else {
							vscode.window.showInformationMessage(`No se pudo crear el repositorio firma: ${err}`);
							return;
						}
					} else {
						// El archivo existe, verificar si el contenido es nulo o una cadena vacía
						if (!data.trim()) {

							let content  = `\n\nabstract class ${transformOutput(featureName)}Repository {\n\n`;
								content += `\tFuture<T> ${useCase?.toLowerCase()}<T>();\n\n}`;
								
							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/domain/repositories/${transformInput(featureName)}.repository.dart`), content, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}
							});
						} else {
							// El archivo tiene contenido, hacer algo aquí
							const newData = data.replace(/}\s*$/, `  Future<T> ${useCase?.toLowerCase()}<T>();\n}`);
							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/domain/repositories/${transformInput(featureName)}.repository.dart`), newData, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}
							});
						}
					}
				});

				// Valido que exista el repositorio (implementación)
				fs.readFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/data/repositories/${transformInput(featureName)}.repository_impl.dart`), 'utf8', (err, data) => {
					if (err) {
						if (err.code === 'ENOENT') {
						// El archivo no existe, escribir en el archivo directamente
							let content2  = `import 'package:${PROJECT_NAME}/features/${transformInput(featureName)}/domain/index.dart';\n\n`;
							content2 += `class ${transformOutput(featureName)}RepositoryImpl extends ${transformOutput(featureName)}Repository {\n\n`;
							content2 += `\t@override\n`;
							content2 += `\tFuture<T> ${useCase?.toLowerCase()}<T>() async {\n\n`;
							content2 += `\t\t\/\/ TODO: implement ${useCase?.toLowerCase()}\n`;
							content2 += `\t\tthrow UnimplementedError();\n\n\t}\n\n}`;
								
							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/data/repositories/${transformInput(featureName)}.repository_impl.dart`), content2, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}								
							});
						} else {
							vscode.window.showInformationMessage(`No se pudo crear el repositorio implementación: ${err}`);
							return;
						}
					} else {
						// El archivo existe, verificar si el contenido es nulo o una cadena vacía
						if (!data.trim()) {
							let content2  = `import 'package:${PROJECT_NAME}/features/${transformInput(featureName)}/domain/index.dart';\n\n`;
								content2 += `class ${transformOutput(featureName)}RepositoryImpl extends ${transformOutput(featureName)}Repository {\n\n`;
								content2 += `\t@override\n`;
								content2 += `\tFuture<T> ${useCase?.toLowerCase()}<T>() async {\n\n`;
								content2 += `\t\t\/\/ TODO: implement ${useCase?.toLowerCase()}\n`;
								content2 += `\t\tthrow UnimplementedError();\n\n\t}\n\n}`;

							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/data/repositories/${transformInput(featureName)}.repository_impl.dart`), content2, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}
							});
						} else {
							// El archivo tiene contenido, hacer algo aquí
							const newData = data.replace(/}\s*$/, `\n\t@override\n\tFuture<T> ${useCase?.toLowerCase()}<T>() async {\n\t\t\/\/ TODO: implement ${useCase?.toLowerCase()}\n\t\tthrow UnimplementedError();\n\t}\n}`);
							fs.writeFile(path.join(currentDir!,`lib/features/${transformInput(featureName)}/data/repositories/${transformInput(featureName)}.repository_impl.dart`), newData, 'utf8', err => {
								if (err) {
									console.error(err);
									return;
								}
							});
						}
					}
				});
				
				// Creo el caso de uso
				const repository = `import 'package:${PROJECT_NAME}/features/${transformInput(featureName)}/domain/repositories/${transformInput(featureName)}.repository.dart';`;

				let usecase  = `${repository}\n\n`;
				    usecase += `class ${transformOutput(useCase!)}Usecase {\n`;
				    usecase += `\tconst ${transformOutput(useCase!)}Usecase(this.repository);\n\n`;
				    usecase += `\tfinal ${transformOutput(featureName)}Repository repository;\n\n`;
				    usecase += `\tFuture<T> call<T>() async => repository.${useCase?.toLowerCase()}();\n\n}`;

				fs.writeFile(`${path.join(currentDir!, `lib/features/${transformInput(featureName)}/domain/usecases/${transformInput(useCase!)}.usecase.dart`)}`, usecase, (err) => {
					if (err) {
						console.error(err);
						return;
					}

					vscode.window.showInformationMessage(`Se creo correctamente el caso de uso: ${useCase}`);
					
				});
			});
		}

    });
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() {}
