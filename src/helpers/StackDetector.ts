import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DetectedStack {
    stateManagement: string[];
    dependencyInjection: string[];
    routing: string[];
    serialization: string[];
    networking: string[];
    localStorage: string[];
    forms: string[];
    testing: string[];
}

// Keys that map to human-readable labels used in display / instructions
export const STACK_CATEGORY_LABELS: Record<keyof DetectedStack, string> = {
    stateManagement:    'State Management',
    dependencyInjection: 'Dependency Injection',
    routing:            'Routing',
    serialization:      'Serialization / Models',
    networking:         'Networking',
    localStorage:       'Local Storage',
    forms:              'Forms',
    testing:            'Testing',
};

// ---------------------------------------------------------------------------
// Candidate packages per category
// ---------------------------------------------------------------------------

const STACK_DEFINITIONS: Record<keyof DetectedStack, string[]> = {
    stateManagement:    ['bloc', 'flutter_bloc', 'riverpod', 'flutter_riverpod', 'provider', 'mobx', 'flutter_mobx', 'get'],
    dependencyInjection: ['get_it', 'injectable'],
    routing:            ['go_router', 'auto_route', 'beamer'],
    serialization:      ['freezed', 'freezed_annotation', 'json_serializable', 'json_annotation', 'built_value', 'built_collection'],
    networking:         ['dio', 'http', 'retrofit', 'chopper'],
    localStorage:       ['hive', 'hive_flutter', 'drift', 'sqflite', 'isar', 'shared_preferences'],
    forms:              ['formz', 'reactive_forms'],
    testing:            ['mocktail', 'mockito', 'bloc_test'],
};

// ---------------------------------------------------------------------------
// StackDetector
// ---------------------------------------------------------------------------

/**
 * Detects the technology stack of a Flutter/Dart project by reading its
 * pubspec.yaml file. Fully deterministic — no AI, no AST parsing.
 */
export class StackDetector {

    /**
     * Analyses the project at `projectPath` and returns its detected stack.
     *
     * Returns `null` when:
     *   • the path doesn't contain a pubspec.yaml, or
     *   • the file can't be read.
     */
    detect(projectPath: string): DetectedStack | null {
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');

        if (!fs.existsSync(pubspecPath)) {
            return null;
        }

        let content: string;
        try {
            content = fs.readFileSync(pubspecPath, 'utf8');
        } catch {
            return null;
        }

        const packages = this.extractAllPackageNames(content);

        const result: DetectedStack = {
            stateManagement:    [],
            dependencyInjection: [],
            routing:            [],
            serialization:      [],
            networking:         [],
            localStorage:       [],
            forms:              [],
            testing:            [],
        };

        for (const [category, candidates] of Object.entries(STACK_DEFINITIONS) as [keyof DetectedStack, string[]][]) {
            result[category] = candidates.filter(pkg => packages.has(pkg));
        }

        return result;
    }

    /**
     * Returns `true` when all categories in the stack are empty.
     */
    isEmpty(stack: DetectedStack): boolean {
        return Object.values(stack).every(arr => arr.length === 0);
    }

    /**
     * Returns each non-empty category as a formatted readable line.
     * e.g. ["State Management: flutter_bloc, bloc", "Routing: go_router"]
     */
    format(stack: DetectedStack): string[] {
        const lines: string[] = [];
        for (const [key, label] of Object.entries(STACK_CATEGORY_LABELS) as [keyof DetectedStack, string][]) {
            if (stack[key].length > 0) {
                lines.push(`${label}: ${stack[key].join(', ')}`);
            }
        }
        return lines;
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Extracts all package names declared anywhere inside pubspec.yaml.
     *
     * Strategy: match lines of the form "  package_name:" that appear under
     * any dependencies block (dependencies, dev_dependencies,
     * dependency_overrides). Uses a simple regex that is intentionally
     * conservative to avoid false positives with YAML keys that are not
     * package names (they typically don't start with a letter and contain no
     * uppercase letters in their names).
     */
    private extractAllPackageNames(content: string): Set<string> {
        const packages = new Set<string>();

        // Match lines where a package name appears as a YAML map key at 2–4
        // spaces of indentation. Package names are lowercase with underscores.
        // The colon is required (key:) and may be followed by a space or nothing.
        const packageLineRe = /^[ \t]{2,4}([a-z][a-z0-9_]*)[ \t]*:/gm;

        let match: RegExpExecArray | null;
        while ((match = packageLineRe.exec(content)) !== null) {
            packages.add(match[1]);
        }

        return packages;
    }
}
