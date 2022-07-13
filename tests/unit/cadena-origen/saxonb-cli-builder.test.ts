import { accessSync, constants, readFileSync } from 'fs';
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom';

import { SaxonbCliBuilder } from '~/cadena-origen/saxonb-cli-builder';
import { XsltBuildException } from '~/cadena-origen/xslt-build-exception';
import { CfdiDefaultLocations } from '~/cadena-origen/cfdi-default-locations';
import { useTestCase } from '../../test-case';

describe('SaxonbCliBuilder', () => {
    const { testIf, downloadResourceIfNotExists, utilAsset } = useTestCase();
    let executable = '';

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

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
        const t = (): SaxonbCliBuilder => new SaxonbCliBuilder('');

        expect(t).toThrow(Error);
        expect(t).toThrow('The executable path for SaxonB cannot be empty');
    });

    test('with non existent executable', async () => {
        const builder = new SaxonbCliBuilder('/foo/bar');

        const t = async (): Promise<string> => builder.build('x', 'y');

        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
        await expect(t).rejects.toThrow('The executable path for SaxonB does not exists');
    });

    test('with directory executable path', async () => {
        const builder = new SaxonbCliBuilder(__dirname);

        const t = async (): Promise<string> => builder.build('x', 'y');

        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
        await expect(t).rejects.toThrow('The executable path for SaxonB is a directory');
    });

    test('with file executable path', async () => {
        const builder = new SaxonbCliBuilder(__filename);

        const t = async (): Promise<string> => builder.build('x', 'y');

        await expect(t).rejects.toBeInstanceOf(XsltBuildException);

        const isexecutable = (): boolean => {
            try {
                accessSync(__filename, constants.X_OK);

                return true;
            } catch (_) {
                return false;
            }
        };
        // this file could have executable permissions (because users!)... then change message
        if (isexecutable()) {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(t).rejects.toThrow('Transformation error');
        } else {
            // eslint-disable-next-line jest/no-conditional-expect
            await expect(t).rejects.toThrow('The executable path for SaxonB is not executable');
        }
    });

    testIf(isExecutable()).each([
        ['cfdi32-real.xml', 'cfdi32-real-cadenaorigen.txt', CfdiDefaultLocations.XSLT_32],
        ['cfdi33-real.xml', 'cfdi33-real-cadenaorigen.txt', CfdiDefaultLocations.XSLT_33]
    ])(
        'cfdi to cadena origen %s',
        async (xmlLocation: string, expectedTransformation: string, xsltLocation: string) => {
            const xslPath = await downloadResourceIfNotExists(xsltLocation);

            const xmlPath = utilAsset(xmlLocation);
            const expectedTransformationPath = utilAsset(expectedTransformation);

            const builder = new SaxonbCliBuilder(executable);
            const cadenaOrigen = await builder.build(readFileSync(xmlPath, 'binary'), xslPath);
            // eslint-disable-next-line jest/no-standalone-expect
            expect(cadenaOrigen).toBe(readFileSync(expectedTransformationPath, 'binary').trimEnd());
        },
        30000
    );

    testIf(isExecutable())('build with empty xml', async () => {
        const builder = new SaxonbCliBuilder(executable);

        const t = async (): Promise<string> => builder.build('', '');

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(Error);
        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toThrow('The XML content to transform is empty');
    });

    testIf(isExecutable())('build with invalid xml', async () => {
        const builder = new SaxonbCliBuilder(executable);

        const t = async (): Promise<string> => builder.build('not an xml', 'x');

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
    });

    testIf(isExecutable())('build with undefined xslt location', async () => {
        const builder = new SaxonbCliBuilder(executable);

        const t = async (): Promise<string> =>
            builder.build('<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>', '');

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(Error);
        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toThrow('Xslt location was not set');
    });

    testIf(isExecutable())('build with invalid xslt location', async () => {
        const builder = new SaxonbCliBuilder(executable);

        const t = async (): Promise<string> =>
            builder.build('<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>', '/foo/bar');

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
    });

    testIf(isExecutable())('build with non xslt content', async () => {
        const builder = new SaxonbCliBuilder(executable);
        const nonAnXsltFile = utilAsset('simple-xml.xml');

        const t = async (): Promise<string> =>
            builder.build('<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>', nonAnXsltFile);

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
    });

    testIf(isExecutable())('build with empty xslt', async () => {
        const builder = new SaxonbCliBuilder(executable || '');
        const emptyXsltFile = utilAsset('empty.xslt');

        const t = async (): Promise<string> =>
            builder.build('<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" version="3.2"/>', emptyXsltFile);

        // eslint-disable-next-line jest/no-standalone-expect
        await expect(t).rejects.toBeInstanceOf(XsltBuildException);
    });
});
