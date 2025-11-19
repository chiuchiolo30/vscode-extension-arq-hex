export class StringTransformer {
  // Para file paths (snake_case)
  static transformInput(input: string): string {
    // Primero reemplazar guiones por underscores
    let result = input.replace(/-/g, "_");
    // Luego convertir camelCase/PascalCase a snake_case
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.toLowerCase();
  }

  // Para clases (PascalCase)
  static transformOutput(output: string): string {
    // Manejar tanto guiones como underscores
    const camelCase = output.replace(/[-_]([a-z\d])/g, (match, letter) =>
      letter.toUpperCase()
    );
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  // Para métodos en repositorios (camelCase)
  static toCamelCase(input: string): string {
    if (!input) {
      return input;
    }
    // primero aseguramos que los guiones/bajos se conviertan
    const normalized = input.replace(/[-_\s]+(.)?/g, (_, c) =>
      c ? c.toUpperCase() : ""
    );
    return normalized.charAt(0).toLowerCase() + normalized.slice(1);
  }

  // (opcional) Para nombres de UseCase / clases a partir de cualquier string
  static toPascalCase(input: string): string {
    const camel = StringTransformer.toCamelCase(input);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
}
