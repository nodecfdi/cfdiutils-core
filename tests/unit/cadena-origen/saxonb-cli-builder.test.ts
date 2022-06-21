import { SaxonbCliBuilder, XsltBuildException, CfdiDefaultLocations } from '../../../src';
import { accessSync, constants, readFileSync } from 'fs';
import { useTestCase } from '../../test-case';

describe('SaxonbCliBuilder', () => {
    const { testIf, downloadResourceIfNotExists, utilAsset } = useTestCase();
    let executable = '';

    const isExecutable = (): boolean => {
        executable = process.env.SAXON_PATH ?? '/usr/bin/saxonb-xslt';
        try {
            accessSync(executable, constants.X_OK);
            return true;
        } catch (e) {
            return false;
        }
    };

    test('constructor with empty executable', () => {
        expect.hasAssertions();
        try {
            new SaxonbCliBuilder('');
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
            expect(e).toHaveProperty('message', 'The executable path for SaxonB cannot be empty');
        }
    });

    test('with non existent executable', async () => {
        const builder = new SaxonbCliBuilder('/foo/bar');

        expect.hasAssertions();
        try {
            await builder.build('x', 'y');
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
            expect(e).toHaveProperty('message', 'The executable path for SaxonB does not exists');
        }
    });

    test('with directory executable path', async () => {
        const builder = new SaxonbCliBuilder(__dirname);

        expect.hasAssertions();
        try {
            await builder.build('x', 'y');
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
            expect(e).toHaveProperty('message', 'The executable path for SaxonB is a directory');
        }
    });

    test('with file executable path', async () => {
        const builder = new SaxonbCliBuilder(__filename);

        expect.hasAssertions();
        try {
            await builder.build('x', 'y');
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);

            // this file could have executable permissions (because users!)... then change message
            try {
                accessSync(__filename, constants.X_OK);
                expect((e as XsltBuildException).message.startsWith('Transformation error')).toBeTruthy();
            } catch (_) {
                expect(e).toHaveProperty('message', 'The executable path for SaxonB is not executable');
            }
        }
    });

    testIf(isExecutable()).each([
        ['cfdi32-real.xml', 'cfdi32-real-cadenaorigen.txt', CfdiDefaultLocations.XSLT_32],
        ['cfdi33-real.xml', 'cfdi33-real-cadenaorigen.txt', CfdiDefaultLocations.XSLT_33],
    ])(
        'cfdi to cadena origen %s',
        async (xmlLocation: string, expectedTransformation: string, xsltLocation: string) => {
            const xslPath = await downloadResourceIfNotExists(xsltLocation);

            const xmlPath = utilAsset(xmlLocation);
            const expectedTransformationPath = utilAsset(expectedTransformation);

            const builder = new SaxonbCliBuilder(executable || '');
            const cadenaOrigen = await builder.build(readFileSync(xmlPath, 'binary'), xslPath);
            expect(cadenaOrigen).toBe(readFileSync(expectedTransformationPath, 'binary').trimEnd());
        },
        30000
    );

    testIf(isExecutable())('build with empty xml', async () => {
        const builder = new SaxonbCliBuilder(executable || '');

        expect.hasAssertions();
        try {
            await builder.build('', '');
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
            expect(e).toHaveProperty('message', 'The XML content to transform is empty');
        }
    });

    testIf(isExecutable())('build with invalid xml', async () => {
        const builder = new SaxonbCliBuilder(executable || '');

        expect.hasAssertions();
        try {
            await builder.build('not an xml', 'x');
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
        }
    });

    testIf(isExecutable())('build with undefined xslt location', async () => {
        const builder = new SaxonbCliBuilder(executable || '');

        expect.hasAssertions();
        try {
            await builder.build('<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>', '');
        } catch (e) {
            expect(e).toBeInstanceOf(SyntaxError);
            expect(e).toHaveProperty('message', 'Xslt location was not set');
        }
    });

    testIf(isExecutable())('build with invalid xslt location', async () => {
        const builder = new SaxonbCliBuilder(executable || '');

        expect.hasAssertions();
        try {
            await builder.build(
                '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>',
                '/foo/bar'
            );
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
        }
    });

    testIf(isExecutable())('build with non xslt content', async () => {
        const builder = new SaxonbCliBuilder(executable || '');
        const nonAnXsltFile = utilAsset('simple-xml.xml');

        expect.hasAssertions();
        try {
            await builder.build(
                '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>',
                nonAnXsltFile
            );
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
        }
    });

    testIf(isExecutable())('build with empty xslt', async () => {
        const builder = new SaxonbCliBuilder(executable || '');
        const emptyXsltFile = utilAsset('empty.xslt');

        expect.hasAssertions();
        try {
            await builder.build(
                '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>',
                emptyXsltFile
            );
        } catch (e) {
            expect(e).toBeInstanceOf(XsltBuildException);
        }
    });
});
