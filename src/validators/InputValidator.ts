export class InputValidator {
    isValidFeatureName(name: string): boolean {
        // Permitir letras, números, underscores y guiones
        // Los guiones se convertirán automáticamente a underscores para seguir convenciones Dart
        const isValid = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name);
        return isValid;
    }

    isValidEntityName(name: string): boolean {
        // Nombre PascalCase o snake_case válido para una entidad Dart
        return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name);
    }

    isValidFieldName(name: string): boolean {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
    }

    /**
     * Parsea definiciones de campos en formato "name:Type, name2:Type2"
     * Retorna array vacío si el input está vacío o es inválido
     */
    parseFieldDefinitions(input: string): Array<{ name: string; type: string }> {
        if (!input || !input.trim()) {
            return [];
        }

        const fields: Array<{ name: string; type: string }> = [];
        const parts = input.split(',').map(p => p.trim()).filter(p => p.length > 0);

        for (const part of parts) {
            const colonIndex = part.indexOf(':');
            if (colonIndex <= 0) {
                continue;
            }

            const name = part.substring(0, colonIndex).trim();
            const type = part.substring(colonIndex + 1).trim();

            if (this.isValidFieldName(name) && type.length > 0) {
                fields.push({ name, type });
            }
        }

        return fields;
    }
}