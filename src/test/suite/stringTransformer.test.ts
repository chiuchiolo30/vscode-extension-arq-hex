import * as assert from 'assert';
import { StringTransformer } from '../../utils/StringTransformer';

suite('StringTransformer Test Suite', () => {
    
    suite('transformInput (to snake_case)', () => {
        test('Should convert hyphen to underscore', () => {
            assert.strictEqual(StringTransformer.transformInput('tres-prueba'), 'tres_prueba');
        });

        test('Should convert PascalCase to snake_case', () => {
            assert.strictEqual(StringTransformer.transformInput('TresPrueba'), 'tres_prueba');
        });

        test('Should convert camelCase to snake_case', () => {
            assert.strictEqual(StringTransformer.transformInput('tresPrueba'), 'tres_prueba');
        });

        test('Should handle mixed hyphens and case', () => {
            assert.strictEqual(StringTransformer.transformInput('tres-PruebaDos'), 'tres_prueba_dos');
        });

        test('Should keep already snake_case', () => {
            assert.strictEqual(StringTransformer.transformInput('tres_prueba'), 'tres_prueba');
        });
    });

    suite('transformOutput (to PascalCase)', () => {
        test('Should convert snake_case to PascalCase', () => {
            assert.strictEqual(StringTransformer.transformOutput('tres_prueba'), 'TresPrueba');
        });

        test('Should convert hyphen to PascalCase', () => {
            assert.strictEqual(StringTransformer.transformOutput('tres-prueba'), 'TresPrueba');
        });

        test('Should handle single word', () => {
            assert.strictEqual(StringTransformer.transformOutput('tres'), 'Tres');
        });

        test('Should keep PascalCase', () => {
            assert.strictEqual(StringTransformer.transformOutput('TresPrueba'), 'TresPrueba');
        });
    });

    suite('toCamelCase', () => {
        test('Should convert snake_case to camelCase', () => {
            assert.strictEqual(StringTransformer.toCamelCase('tres_prueba'), 'tresPrueba');
        });

        test('Should convert hyphen to camelCase', () => {
            assert.strictEqual(StringTransformer.toCamelCase('tres-prueba'), 'tresPrueba');
        });

        test('Should handle PascalCase', () => {
            assert.strictEqual(StringTransformer.toCamelCase('TresPrueba'), 'tresPrueba');
        });
    });

    suite('toPascalCase', () => {
        test('Should convert snake_case to PascalCase', () => {
            assert.strictEqual(StringTransformer.toPascalCase('tres_prueba'), 'TresPrueba');
        });

        test('Should convert hyphen to PascalCase', () => {
            assert.strictEqual(StringTransformer.toPascalCase('tres-prueba'), 'TresPrueba');
        });

        test('Should convert camelCase to PascalCase', () => {
            assert.strictEqual(StringTransformer.toPascalCase('tresPrueba'), 'TresPrueba');
        });
    });
});
