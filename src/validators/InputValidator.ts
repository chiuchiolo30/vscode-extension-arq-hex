export class InputValidator {
    isValidFeatureName(name: string): boolean {
        // Permitir letras, números, underscores y guiones
        // Los guiones se convertirán automáticamente a underscores para seguir convenciones Dart
        const isValid = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name);
        return isValid;
    }
}