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
     */
    getMelosPackages(melosRootPath: string): MelosPackage[] {
        const packages: MelosPackage[] = [];
        
        try {
            const melosYamlPath = path.join(melosRootPath, 'melos.yaml');
            if (!fs.existsSync(melosYamlPath)) {
                return packages;
            }

            // Leer melos.yaml para obtener los paths de los paquetes
            const melosContent = fs.readFileSync(melosYamlPath, 'utf8');
            const packagePaths = this.extractPackagePaths(melosContent, melosRootPath);

            // Para cada path, buscar paquetes
            packagePaths.forEach(packagePath => {
                const foundPackages = this.findPackagesInPath(melosRootPath, packagePath);
                packages.push(...foundPackages);
            });

            // Filtrar solo los paquetes que están en la carpeta 'apps'
            const appsOnly = packages.filter(pkg => {
                const normalizedPath = pkg.relativePath.replace(/\\/g, '/').toLowerCase();
                const isInApps = normalizedPath.startsWith('apps/');
                // console.log(`[DEBUG MelosHelper] Package: ${pkg.name}, Path: ${normalizedPath}, IsApp: ${isInApps}`);
                return isInApps;
            });

            // console.log(`[DEBUG MelosHelper] Total packages found: ${packages.length}, Apps only: ${appsOnly.length}`);

            return appsOnly.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Error al obtener paquetes de Melos:', error);
            return packages;
        }
    }

    /**
     * Extrae los paths de paquetes desde melos.yaml
     */
    private extractPackagePaths(melosContent: string, melosRootPath: string): string[] {
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
