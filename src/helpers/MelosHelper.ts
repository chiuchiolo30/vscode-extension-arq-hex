import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface MelosPackage {
    name: string;
    path: string;
    relativePath: string;
    isFlutterPackage: boolean;
}

export class MelosHelper {
    /**
     * Obtiene todos los paquetes de un monorepo Melos
     * Solo retorna apps (ignora packages compartidos)
     * Soporta Melos < 7.x (melos.yaml) y >= 7.x (pubspec.yaml con workspace)
     */
    getMelosPackages(melosRootPath: string): MelosPackage[] {
        const packages: MelosPackage[] = [];
        
        try {
            const pubspecPath = path.join(melosRootPath, 'pubspec.yaml');
            
            // Verificar versión de Melos
            const melosVersion = this.getMelosVersion(pubspecPath);
            console.log('[DEBUG MelosHelper] Melos version:', melosVersion);

            if (melosVersion !== null && melosVersion >= 7) {
                // Melos >= 7.x: Leer workspace de pubspec.yaml
                console.log('[DEBUG MelosHelper] Using Melos >= 7.x config (pubspec.yaml workspace)');
                if (fs.existsSync(pubspecPath)) {
                    const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
                    return this.getPackagesFromPubspecWorkspace(pubspecContent, melosRootPath);
                }
            } else {
                // Melos < 7.x: Leer packages de melos.yaml
                console.log('[DEBUG MelosHelper] Using Melos < 7.x config (melos.yaml)');
                const melosYamlPath = path.join(melosRootPath, 'melos.yaml');
                if (fs.existsSync(melosYamlPath)) {
                    const melosContent = fs.readFileSync(melosYamlPath, 'utf8');
                    return this.getPackagesFromMelosYaml(melosContent, melosRootPath);
                }
            }

            console.log('[DEBUG MelosHelper] No Melos config found');
            return packages;
        } catch (error) {
            console.error('Error al obtener paquetes de Melos:', error);
            return packages;
        }
    }

    /**
     * Obtiene paquetes desde melos.yaml (Melos < 7.x)
     */
    private getPackagesFromMelosYaml(melosContent: string, melosRootPath: string): MelosPackage[] {
        const packages: MelosPackage[] = [];
        const packagePaths = this.extractPackagePathsFromMelosYaml(melosContent, melosRootPath);

        // Para cada path, buscar paquetes
        packagePaths.forEach(packagePath => {
            const foundPackages = this.findPackagesInPath(melosRootPath, packagePath);
            packages.push(...foundPackages);
        });

        return this.filterAppsOnly(packages);
    }

    /**
     * Obtiene paquetes desde pubspec.yaml workspace (Melos >= 7.x)
     * En Melos 7.x, las apps pueden no estar en workspace, pero siempre están en apps/
     */
    private getPackagesFromPubspecWorkspace(pubspecContent: string, melosRootPath: string): MelosPackage[] {
        const packages: MelosPackage[] = [];
        const workspacePaths = this.extractWorkspacePathsFromPubspec(pubspecContent);

        console.log('[DEBUG MelosHelper] Processing', workspacePaths.length, 'workspace paths');

        // Procesar paths del workspace
        workspacePaths.forEach(packagePath => {
            const fullPath = path.join(melosRootPath, packagePath);
            console.log('[DEBUG MelosHelper] Checking workspace path:', fullPath);
            
            if (fs.existsSync(fullPath)) {
                const pkg = this.createPackageInfo(melosRootPath, fullPath, packagePath);
                if (pkg) {
                    console.log('[DEBUG MelosHelper] Created package:', pkg.name, 'at', pkg.relativePath);
                    packages.push(pkg);
                }
            }
        });

        // IMPORTANTE: También escanear la carpeta apps/ aunque no esté en workspace
        // Las apps pueden no estar listadas en workspace pero estar en apps/
        const appsDir = path.join(melosRootPath, 'apps');
        if (fs.existsSync(appsDir)) {
            console.log('[DEBUG MelosHelper] Scanning apps/ directory...');
            const appsFound = this.findPackagesInPath(melosRootPath, 'apps/*');
            console.log('[DEBUG MelosHelper] Found', appsFound.length, 'apps in apps/ directory');
            
            // Agregar apps que no estén ya en packages
            appsFound.forEach(app => {
                if (!packages.find(p => p.path === app.path)) {
                    console.log('[DEBUG MelosHelper] Adding app from apps/:', app.name);
                    packages.push(app);
                }
            });
        }

        console.log('[DEBUG MelosHelper] Total packages before filtering:', packages.length);
        return this.filterAppsOnly(packages);
    }

    /**
     * Obtiene la versión de Melos del pubspec.yaml
     * @returns número de versión mayor (ej: 7) o null si no se encuentra
     */
    private getMelosVersion(pubspecPath: string): number | null {
        if (!fs.existsSync(pubspecPath)) {
            return null;
        }

        try {
            const pubspecContent = fs.readFileSync(pubspecPath, 'utf8');
            // Buscar melos: ^7.3.0 o melos: 7.3.0 en dev_dependencies
            const match = pubspecContent.match(/dev_dependencies:[\s\S]*?\n\s+melos:\s*['"]?\^?(\d+)/m);
            if (match && match[1]) {
                return parseInt(match[1], 10);
            }
        } catch (error) {
            console.log('[DEBUG MelosHelper] Error reading Melos version:', error);
        }

        return null;
    }

    /**
     * Filtra solo los paquetes que están en la carpeta 'apps/'
     * Las apps SIEMPRE están en apps/, sin importar si están o no en workspace
     */
    private filterAppsOnly(packages: MelosPackage[]): MelosPackage[] {
        const appsOnly = packages.filter(pkg => {
            const normalizedPath = pkg.relativePath.replace(/\\/g, '/').toLowerCase();
            return normalizedPath.startsWith('apps/');
        });

        console.log(`[DEBUG MelosHelper] Total packages: ${packages.length}, Apps in 'apps/' folder: ${appsOnly.length}`);
        return appsOnly.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Extrae los paths del workspace desde pubspec.yaml (Melos 7.x)
     */
    private extractWorkspacePathsFromPubspec(pubspecContent: string): string[] {
        const paths: string[] = [];
        
        console.log('[DEBUG MelosHelper] Parsing workspace from pubspec...');
        
        // Buscar todas las líneas que empiecen con "  -" después de "workspace:"
        // Usar una búsqueda más simple línea por línea
        const lines = pubspecContent.split('\n');
        let inWorkspace = false;
        
        for (const line of lines) {
            // Detectar inicio de workspace
            if (/^workspace:\s*$/.test(line)) {
                inWorkspace = true;
                console.log('[DEBUG MelosHelper] Found workspace: section');
                continue;
            }
            
            // Si estamos en workspace y encontramos una línea con -
            if (inWorkspace) {
                // Si encontramos otra sección (sin indentación), salir
                if (/^[a-z_]+:/.test(line)) {
                    console.log('[DEBUG MelosHelper] End of workspace section');
                    break;
                }
                
                // Buscar líneas con "  - path"
                const pathMatch = line.match(/^\s+-\s+(.+?)\s*$/);
                if (pathMatch && pathMatch[1]) {
                    const cleanPath = pathMatch[1].trim();
                    paths.push(cleanPath);
                    console.log('[DEBUG MelosHelper] Found workspace path:', cleanPath);
                }
            }
        }

        console.log('[DEBUG MelosHelper] Total workspace paths extracted:', paths.length);
        console.log('[DEBUG MelosHelper] Paths:', paths);
        return paths;
    }

    /**
     * Extrae los paths de paquetes desde melos.yaml (Melos < 7.x)
     */
    private extractPackagePathsFromMelosYaml(melosContent: string, melosRootPath: string): string[] {
        const paths: string[] = [];
        
        // Buscar la sección packages en el YAML
        const packagesMatch = melosContent.match(/packages:\s*\n((?:\s+-\s+.+\n?)*)/);
        
        if (packagesMatch && packagesMatch[1]) {
            const packageLines = packagesMatch[1].trim().split('\n');
            packageLines.forEach(line => {
                const pathMatch = line.trim().match(/^-\s+['"]?(.+?)['"]?\s*$/);
                if (pathMatch && pathMatch[1]) {
                    paths.push(pathMatch[1]);
                }
            });
        }

        // Si no se encontraron paths, usar defaults comunes
        if (paths.length === 0) {
            paths.push('packages/*', 'apps/*');
        }

        return paths;
    }

    /**
     * Crea información de un paquete desde su ruta
     */
    private createPackageInfo(melosRootPath: string, packageFullPath: string, relativePath: string): MelosPackage | null {
        const pubspecPath = path.join(packageFullPath, 'pubspec.yaml');
        
        if (!fs.existsSync(pubspecPath)) {
            return null;
        }

        const packageName = this.getPackageNameFromPubspec(pubspecPath);
        const isFlutter = this.isFlutterPackage(pubspecPath);
        
        if (!packageName) {
            return null;
        }

        return {
            name: packageName,
            path: packageFullPath,
            relativePath: relativePath,
            isFlutterPackage: isFlutter
        };
    }

    /**
     * Busca paquetes en un path específico (soporta wildcards)
     */
    private findPackagesInPath(melosRootPath: string, packagePath: string): MelosPackage[] {
        const packages: MelosPackage[] = [];

        // Si el path contiene *, buscar en ese directorio
        if (packagePath.includes('*')) {
            const basePath = packagePath.replace(/\/?\*+$/, '');
            const fullBasePath = path.join(melosRootPath, basePath);

            if (fs.existsSync(fullBasePath)) {
                const items = fs.readdirSync(fullBasePath, { withFileTypes: true });
                
                items.forEach(item => {
                    if (item.isDirectory()) {
                        const packageFullPath = path.join(fullBasePath, item.name);
                        const pubspecPath = path.join(packageFullPath, 'pubspec.yaml');
                        
                        if (fs.existsSync(pubspecPath)) {
                            const packageName = this.getPackageNameFromPubspec(pubspecPath);
                            const isFlutter = this.isFlutterPackage(pubspecPath);
                            
                            if (packageName) {
                                packages.push({
                                    name: packageName,
                                    path: packageFullPath,
                                    relativePath: path.relative(melosRootPath, packageFullPath),
                                    isFlutterPackage: isFlutter
                                });
                            }
                        }
                    }
                });
            }
        } else {
            // Path específico sin wildcard
            const fullPath = path.join(melosRootPath, packagePath);
            const pubspecPath = path.join(fullPath, 'pubspec.yaml');
            
            if (fs.existsSync(pubspecPath)) {
                const packageName = this.getPackageNameFromPubspec(pubspecPath);
                const isFlutter = this.isFlutterPackage(pubspecPath);
                
                if (packageName) {
                    packages.push({
                        name: packageName,
                        path: fullPath,
                        relativePath: path.relative(melosRootPath, fullPath),
                        isFlutterPackage: isFlutter
                    });
                }
            }
        }

        return packages;
    }

    /**
     * Obtiene el nombre del paquete desde pubspec.yaml
     */
    private getPackageNameFromPubspec(pubspecPath: string): string | null {
        try {
            const content = fs.readFileSync(pubspecPath, 'utf8');
            const match = content.match(/name:\s+(.+)/);
            return match ? match[1].trim() : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verifica si un paquete es de tipo Flutter
     */
    private isFlutterPackage(pubspecPath: string): boolean {
        try {
            const content = fs.readFileSync(pubspecPath, 'utf8');
            // Buscar dependencias de flutter
            return content.includes('sdk: flutter') || content.includes('flutter:');
        } catch (error) {
            return false;
        }
    }

    /**
     * Muestra un QuickPick para seleccionar un paquete
     */
    async showPackageSelector(packages: MelosPackage[], placeholder?: string): Promise<MelosPackage | undefined> {
        if (packages.length === 0) {
            vscode.window.showErrorMessage('❌ No se encontraron paquetes en el monorepo Melos\n💡 Verifica que melos.yaml tenga paquetes configurados');
            return undefined;
        }

        // Filtrar solo paquetes Flutter si se desea
        const flutterPackages = packages.filter(pkg => pkg.isFlutterPackage);
        
        if (flutterPackages.length === 0) {
            vscode.window.showWarningMessage('⚠️ No se encontraron apps Flutter en el monorepo\n💡 Asegúrate de tener al menos una app en apps/');
            return undefined;
        }

        const items = flutterPackages.map(pkg => ({
            label: `$(device-mobile) ${pkg.name}`,
            description: `📂 ${pkg.relativePath}`,
            detail: '$(flutter) Flutter App',
            package: pkg
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: placeholder || '🎯 Selecciona la app donde ' + (placeholder || 'trabajar'),
            matchOnDescription: true,
            matchOnDetail: true,
            title: '📦 Monorepo Melos - Selección de App'
        });

        return selected?.package;
    }

    /**
     * Valida que el path seleccionado sea válido para crear features
     */
    validatePackageForFeatures(packagePath: string): boolean {
        const libPath = path.join(packagePath, 'lib');
        return fs.existsSync(libPath);
    }
}
