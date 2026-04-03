import * as vscode from 'vscode';
import { BaseCommand } from './base/BaseCommand';
import { DetectedStack, StackDetector, STACK_CATEGORY_LABELS } from '../helpers/StackDetector';
import { MelosPackage } from '../helpers/MelosHelper';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';

type ArchitectureTarget =
    | { kind: 'project'; workingDir: string }
    | { kind: 'monorepo'; rootPath: string; apps: MelosPackage[]; packages: MelosPackage[] };

/**
 * Shows a concise, formatted overview of the current project's architecture
 * directly in the Output Channel.
 */
export class ShowArchitectureInfoCommand extends BaseCommand {
    private readonly outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        super();
        this.outputChannel = outputChannel;
    }

    getId(): string {
        return 'flutter-arq-hex.showArchitectureInfo';
    }

    async execute(): Promise<void> {
        const target = await this.resolveArchitectureTarget();
        if (!target) {
            return;
        }

        if (target.kind === 'monorepo') {
            this.renderMonorepoArchitecture(target.rootPath, target.apps, target.packages);
            return;
        }

        await this.renderProjectArchitecture(target.workingDir);
    }

    private async resolveArchitectureTarget(): Promise<ArchitectureTarget | null> {
        const workspaceDir = WorkspaceHelper.getCurrentDirectory();
        const activeFileDir = WorkspaceHelper.getActiveFileDirectory();
        const lookupDir = activeFileDir ?? workspaceDir;

        if (!lookupDir) {
            this.showError('Error: No se pudo encontrar el directorio del proyecto');
            return null;
        }

        const melosRoot = this.projectValidator.findMelosRoot(lookupDir);
        if (!melosRoot) {
            const workingDir = await this.resolveWorkingDirectory('ver información de arquitectura');
            return workingDir ? { kind: 'project', workingDir } : null;
        }

        const activeAppPath = activeFileDir
            ? this.projectValidator.findContainingApp(activeFileDir, melosRoot)
            : null;

        if (activeAppPath) {
            return { kind: 'project', workingDir: activeAppPath };
        }

        const apps = this.melosHelper.getMelosPackages(melosRoot, true);
        const packages = this.melosHelper.getMelosPackages(melosRoot, false);
        const sharedPackagesCount = packages.filter(pkg => !pkg.relativePath.replace(/\\/g, '/').toLowerCase().startsWith('apps/')).length;

        const items: Array<vscode.QuickPickItem & { value: string }> = [
            {
                label: '$(organization) Mostrar vista global del monorepo',
                description: 'Listar apps y packages detectados',
                detail: `${apps.length} app(s) • ${sharedPackagesCount} package(s) compartido(s)`,
                value: '__monorepo_overview__',
            },
            ...apps.map(app => ({
                label: `$(device-mobile) ${app.name}`,
                description: `📂 ${app.relativePath}`,
                detail: 'Analizar stack y features de esta app',
                value: app.path,
            })),
        ];

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Selecciona una app o muestra la vista global del monorepo',
            matchOnDescription: true,
            matchOnDetail: true,
            title: '🏗️ Show Architecture Info',
        });

        if (!selection) {
            return null;
        }

        if (selection.value === '__monorepo_overview__') {
            return {
                kind: 'monorepo',
                rootPath: melosRoot,
                apps,
                packages,
            };
        }

        return {
            kind: 'project',
            workingDir: selection.value,
        };
    }

    private async renderProjectArchitecture(workingDir: string): Promise<void> {
        const projectName = this.projectValidator.getProjectName(workingDir);

        const modeResult = this.structureModeManager
            ? await this.structureModeManager.getEffectiveModeWithSource(workingDir)
            : { mode: 'featureFirst' as const, source: 'default' as const };

        const mode = modeResult.mode;
        const modeSource = modeResult.source;
        const modeLabel = mode === 'featureFirst' ? 'Feature-First' : 'Layer-First';
        const modeSourceLabels: Record<string, string> = {
            /* eslint-disable @typescript-eslint/naming-convention */
            'auto-detect': 'auto-detected',
            'override': 'manually set',
            'default': 'default',
            /* eslint-enable @typescript-eslint/naming-convention */
        };
        const modeSourceLabel = modeSourceLabels[modeSource] ?? modeSource;

        const features = this.projectValidator.getAvailableFeatures(workingDir, mode);
        const detector = new StackDetector();
        const stack = detector.detect(workingDir);
        const line = '─'.repeat(72);

        this.outputChannel.clear();
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('  🏗️  Architecture Info  —  Dart Clean Architecture');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('');

        if (projectName) {
            this.outputChannel.appendLine(`  📦 Project    : ${projectName}`);
        }
        this.outputChannel.appendLine(`  📁 Path       : ${workingDir}`);
        this.outputChannel.appendLine(`  🗂️  Structure  : ${modeLabel}  (${modeSourceLabel})`);
        this.outputChannel.appendLine('');

        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('  📦 Detected Stack');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('');

        if (!stack) {
            this.outputChannel.appendLine('  ⚠️  pubspec.yaml not found — cannot detect stack.');
        } else if (detector.isEmpty(stack)) {
            this.outputChannel.appendLine('  (No well-known packages detected in pubspec.yaml)');
        } else {
            for (const [key, label] of Object.entries(STACK_CATEGORY_LABELS) as [keyof typeof STACK_CATEGORY_LABELS, string][]) {
                if (stack[key].length > 0) {
                    const padding = ' '.repeat(Math.max(0, 24 - label.length));
                    this.outputChannel.appendLine(`  • ${label}${padding}: ${stack[key].join(', ')}`);
                }
            }
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('  🧩 Features');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('');

        if (features.length === 0) {
            this.outputChannel.appendLine('  (No features found yet)');
        } else {
            features.forEach(feature => this.outputChannel.appendLine(`  • ${feature}`));
            this.outputChannel.appendLine('');
            this.outputChannel.appendLine(`  Total: ${features.length} feature${features.length !== 1 ? 's' : ''}`);
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('');
        this.outputChannel.show(true);
    }

    private renderMonorepoArchitecture(rootPath: string, apps: MelosPackage[], packages: MelosPackage[]): void {
        const line = '─'.repeat(72);
        const sharedPackages = packages.filter(pkg => !pkg.relativePath.replace(/\\/g, '/').toLowerCase().startsWith('apps/'));
        const aggregatedStack = this.aggregateStack(apps);
        const detector = new StackDetector();

        this.outputChannel.clear();
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('  🏗️  Architecture Info  —  Melos Monorepo Overview');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(`  📁 Root       : ${rootPath}`);
        this.outputChannel.appendLine(`  📱 Apps       : ${apps.length}`);
        this.outputChannel.appendLine(`  📦 Packages   : ${sharedPackages.length}`);
        this.outputChannel.appendLine('');

        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('  📦 Aggregated Stack (apps/*)');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('');

        if (apps.length === 0) {
            this.outputChannel.appendLine('  (No apps detected under apps/)');
        } else if (detector.isEmpty(aggregatedStack)) {
            this.outputChannel.appendLine('  (No well-known packages detected across the apps in this monorepo)');
        } else {
            for (const [key, label] of Object.entries(STACK_CATEGORY_LABELS) as [keyof typeof STACK_CATEGORY_LABELS, string][]) {
                if (aggregatedStack[key].length > 0) {
                    const padding = ' '.repeat(Math.max(0, 24 - label.length));
                    this.outputChannel.appendLine(`  • ${label}${padding}: ${aggregatedStack[key].join(', ')}`);
                }
            }
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('  📱 Apps Detected');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('');

        if (apps.length === 0) {
            this.outputChannel.appendLine('  (No apps found yet)');
        } else {
            apps.forEach(app => this.outputChannel.appendLine(`  • ${app.name}  —  ${app.relativePath}`));
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('  📦 Shared Packages');
        this.outputChannel.appendLine(`  ${line.slice(0, 60)}`);
        this.outputChannel.appendLine('');

        if (sharedPackages.length === 0) {
            this.outputChannel.appendLine('  (No shared packages found under packages/)');
        } else {
            sharedPackages.forEach(pkg => this.outputChannel.appendLine(`  • ${pkg.name}  —  ${pkg.relativePath}`));
        }

        this.outputChannel.appendLine('');
        this.outputChannel.appendLine(line);
        this.outputChannel.appendLine('');
        this.outputChannel.show(true);
    }

    private aggregateStack(apps: MelosPackage[]): DetectedStack {
        const merged = {
            stateManagement: new Set<string>(),
            dependencyInjection: new Set<string>(),
            routing: new Set<string>(),
            serialization: new Set<string>(),
            networking: new Set<string>(),
            localStorage: new Set<string>(),
            forms: new Set<string>(),
            testing: new Set<string>(),
        };

        const detector = new StackDetector();
        for (const app of apps) {
            const stack = detector.detect(app.path);
            if (!stack) {
                continue;
            }

            for (const key of Object.keys(merged) as Array<keyof DetectedStack>) {
                stack[key].forEach(packageName => merged[key].add(packageName));
            }
        }

        return {
            stateManagement: [...merged.stateManagement].sort(),
            dependencyInjection: [...merged.dependencyInjection].sort(),
            routing: [...merged.routing].sort(),
            serialization: [...merged.serialization].sort(),
            networking: [...merged.networking].sort(),
            localStorage: [...merged.localStorage].sort(),
            forms: [...merged.forms].sort(),
            testing: [...merged.testing].sort(),
        };
    }
}
