import * as assert from 'assert';
import { ProjectValidator } from '../../validators/ProjectValidator';

suite('ProjectValidator - Melos Test Suite', () => {
    let projectValidator: ProjectValidator;

    setup(() => {
        projectValidator = new ProjectValidator();
    });

    test('Should create ProjectValidator instance', () => {
        assert.ok(projectValidator);
    });

    test('Should return null when no melos.yaml found', () => {
        const melosRoot = projectValidator.findMelosRoot('/non/existent/path');
        assert.strictEqual(melosRoot, null);
    });

    test('Should detect non-melos projects correctly', () => {
        const isMelos = projectValidator.isMelosProject('/non/existent/path');
        assert.strictEqual(isMelos, false);
    });

    test('Should validate that path is not inside melos package when no melos.yaml', () => {
        const isInside = projectValidator.isInsideMelosPackage('/some/random/path');
        assert.strictEqual(isInside, false);
    });

    // TODO: Agregar tests de integración con proyectos mock
    // test('Should find melos root from nested package', () => {
    //     // Crear estructura mock y probar
    // });
});
