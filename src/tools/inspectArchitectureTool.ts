import * as vscode from 'vscode';
import { WorkspaceHelper } from '../helpers/WorkspaceHelper';
import { ProjectValidator } from '../validators/ProjectValidator';
import { MelosHelper } from '../helpers/MelosHelper';
import { StructureModeManager } from '../helpers/StructureModeManager';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface InspectArchitectureInput {
    /** Absolute path to a Flutter/Dart project or Melos monorepo root.
     *  When omitted, the first workspace folder is used. */
    projectPath?: string;
}

// ---------------------------------------------------------------------------
// Tool
// ---------------------------------------------------------------------------

export function makeInspectArchitectureTool(
    context: vscode.ExtensionContext,
): vscode.LanguageModelTool<InspectArchitectureInput> {
    const projectValidator = new ProjectValidator();
    const melosHelper = new MelosHelper();
    const structureModeManager = new StructureModeManager(context);

    return {
        prepareInvocation(
            options: vscode.LanguageModelToolInvocationPrepareOptions<InspectArchitectureInput>,
            _token: vscode.CancellationToken,
        ): vscode.PreparedToolInvocation {
            const target = options.input.projectPath ?? WorkspaceHelper.getCurrentDirectory() ?? 'workspace';
            return {
                invocationMessage: `Inspeccionando arquitectura en: ${target}`,
            };
        },

        async invoke(
            options: vscode.LanguageModelToolInvocationOptions<InspectArchitectureInput>,
            _token: vscode.CancellationToken,
        ): Promise<vscode.LanguageModelToolResult> {
            const projectPath = options.input.projectPath ?? WorkspaceHelper.getCurrentDirectory();

            if (!projectPath) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'No project path provided and no workspace folder is open.',
                            hint: 'Provide "projectPath" pointing to a Flutter project or Melos monorepo root.',
                        }),
                    ),
                ]);
            }

            // ── Detect Melos monorepo ──────────────────────────────────────
            const melosRoot = projectValidator.findMelosRoot(projectPath);

            if (melosRoot) {
                const apps = melosHelper.getMelosPackages(melosRoot, true);
                const allPackages = melosHelper.getMelosPackages(melosRoot, false);
                const sharedPackages = allPackages.filter(
                    pkg => !pkg.relativePath.replace(/\\/g, '/').toLowerCase().startsWith('apps/'),
                );

                // Per-app architecture details
                const appsDetail = await Promise.all(
                    apps.map(async app => {
                        const mode = await structureModeManager.getEffectiveModeWithSource(app.path);
                        const features = projectValidator.getAvailableFeatures(app.path, mode.mode);
                        const projectName = projectValidator.getProjectName(app.path);
                        const featuresDetail = features.map(f => ({
                            name: f,
                            useCases: projectValidator.getFeatureUseCases(app.path, f, mode.mode),
                        }));
                        return {
                            name: app.name,
                            path: app.path,
                            relativePath: app.relativePath,
                            projectName,
                            structureMode: mode.mode,
                            structureModeSource: mode.source,
                            features: featuresDetail,
                            featureCount: features.length,
                        };
                    }),
                );

                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        '⛔ STOP — Do NOT read any project files, open any source file, or explore any directory after this tool call. ' +
                        'This response IS the complete architecture overview. ' +
                        'Proceed directly to the next scaffolding operation using the dartarch_* tools.',
                    ),
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            kind: 'monorepo',
                            melosRoot,
                            appCount: apps.length,
                            sharedPackageCount: sharedPackages.length,
                            apps: appsDetail,
                            sharedPackages: sharedPackages.map(p => ({
                                name: p.name,
                                relativePath: p.relativePath,
                            })),
                        }),
                    ),
                ]);
            }

            // ── Single Flutter project ─────────────────────────────────────
            if (!projectValidator.isFlutterProject(projectPath)) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(
                        JSON.stringify({
                            error: 'No pubspec.yaml found at the given path.',
                            hint: 'Verify that "projectPath" points to the root of a Flutter/Dart project.',
                            projectPath,
                        }),
                    ),
                ]);
            }

            const modeResult = await structureModeManager.getEffectiveModeWithSource(projectPath);
            const featureNames = projectValidator.getAvailableFeatures(projectPath, modeResult.mode);
            const features = featureNames.map(f => ({
                name: f,
                useCases: projectValidator.getFeatureUseCases(projectPath, f, modeResult.mode),
            }));
            const projectName = projectValidator.getProjectName(projectPath);

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(
                    '⛔ STOP — Do NOT read any project files, open any source file, or explore any directory after this tool call. ' +
                    'This response IS the complete architecture overview. ' +
                    'Proceed directly to the next scaffolding operation using the dartarch_* tools.',
                ),
                new vscode.LanguageModelTextPart(
                    JSON.stringify({
                        kind: 'project',
                        projectPath,
                        projectName,
                        structureMode: modeResult.mode,
                        structureModeSource: modeResult.source,
                        features,
                        featureCount: features.length,
                    }),
                ),
            ]);
        },
    };
}
