import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseCommand } from './base/BaseCommand';
import { StackDetector } from '../helpers/StackDetector';
import { buildInstructionsContent } from '../generators/InstructionsBuilder';

/**
 * Generates a `.github/copilot-instructions.md` file that documents the
 * project's architecture and conventions so that AI assistants (Copilot,
 * Codex, Claude, etc.) can generate code that fits the existing structure.
 *
 * Target location: `.github/copilot-instructions.md`
 * Rationale: This is the official location for workspace-wide Copilot
 * instructions and is also read by other tools that follow the same
 * convention (e.g. Cursor's .cursorrules equivalent).
 *
 * If the file already exists, the user is asked whether to overwrite it.
 */
export class GenerateInstructionsCommand extends BaseCommand {

    getId(): string {
        return 'flutter-arq-hex.generateInstructions';
    }

    async execute(): Promise<void> {
        const workingDir = await this.resolveWorkingDirectory('generar instrucciones');
        if (!workingDir) {
            return;
        }

        // ---------- Gather project data ----------

        const projectName = this.projectValidator.getProjectName(workingDir) ?? 'flutter_project';

        const modeResult = this.structureModeManager
            ? await this.structureModeManager.getEffectiveModeWithSource(workingDir)
            : { mode: 'featureFirst' as const, source: 'default' as const };

        const mode = modeResult.mode;

        const detector = new StackDetector();
        const stack = detector.detect(workingDir);

        const features = this.projectValidator.getAvailableFeatures(workingDir, mode);

        // ---------- Resolve target path ----------

        const githubDir = path.join(workingDir, '.github');
        const targetPath = path.join(githubDir, 'copilot-instructions.md');

        // ---------- Handle existing file ----------

        if (fs.existsSync(targetPath)) {
            const choice = await vscode.window.showQuickPick(
                [
                    { label: '$(replace) Replace', description: 'Overwrite the existing file with updated instructions', value: 'replace' },
                    { label: '$(x) Cancel', description: 'Keep the existing file unchanged', value: 'cancel' },
                ],
                { placeHolder: '.github/copilot-instructions.md already exists. What do you want to do?' }
            );

            if (!choice || choice.value === 'cancel') {
                return;
            }
        }

        // ---------- Generate content ----------

        const content = buildInstructionsContent(projectName, mode, stack, features);

        // ---------- Write file ----------

        try {
            if (!fs.existsSync(githubDir)) {
                fs.mkdirSync(githubDir, { recursive: true });
            }
            fs.writeFileSync(targetPath, content, 'utf8');
        } catch (err) {
            this.showError(`âŒ Could not write instructions file: ${err}`);
            return;
        }

        // Open the file so the user can review it immediately
        const doc = await vscode.workspace.openTextDocument(targetPath);
        await vscode.window.showTextDocument(doc);

        this.showSuccess(`âœ… Instructions file generated at .github/copilot-instructions.md`);
    }
}
