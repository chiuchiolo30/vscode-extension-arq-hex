import * as vscode from 'vscode';
import { detectStackTool } from './detectStackTool';
import { makeInspectArchitectureTool } from './inspectArchitectureTool';
import { makeCreateFeatureTool } from './createFeatureTool';
import { makeCreateFeatureCrudTool } from './createFeatureCrudTool';
import { makeCreateUseCaseTool } from './createUseCaseTool';
import { makeGenerateInstructionsTool } from './generateInstructionsTool';

/**
 * Registers all Dart Clean Architecture LM Tools.
 * Call this once from `activate()` in extension.ts.
 */
export function registerAllTools(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.lm.registerTool('dartarch_detect_stack', detectStackTool),
        vscode.lm.registerTool('dartarch_inspect_architecture', makeInspectArchitectureTool(context)),
        vscode.lm.registerTool('dartarch_create_feature', makeCreateFeatureTool(context)),
        vscode.lm.registerTool('dartarch_create_feature_crud', makeCreateFeatureCrudTool(context)),
        vscode.lm.registerTool('dartarch_create_usecase', makeCreateUseCaseTool(context)),
        vscode.lm.registerTool('dartarch_generate_instructions', makeGenerateInstructionsTool(context)),
    );
}
