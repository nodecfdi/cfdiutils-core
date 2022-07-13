import { install, XmlNodeUtils } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom';
import { cleanupSync, openSync } from 'temp';
import { readFileSync } from 'fs';
import { NodeCertificado } from '~/certificado/node-certificado';
import { useTestCase } from '../../test-case';

describe('NodeCertificado', () => {
    const { utilAsset } = useTestCase();
    const createNodeCertificado = (contents: string): NodeCertificado => {
        return new NodeCertificado(XmlNodeUtils.nodeFromXmlString(contents));
    };

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('extract with wrong version', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="1.9.80"/>'
        );

        const t = (): string => nodeCertificado.extract();

        expect(t).toThrow(Error);
        expect(t).toThrow('Unsupported or unknown version');
    });

    test('extract with empty certificate', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3"/>'
        );

        expect(nodeCertificado.extract()).toBe('');
    });

    test('extract with malformed base 64', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3" Certificado="ñ"/>'
        );

        const t = (): string => nodeCertificado.extract();

        expect(t).toThrow(Error);
        expect(t).toThrow('The certificado attribute is not a valid base64 encoded string');
    });

    test('extract', () => {
        const expectedExtract = 'foo';
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3" Certificado="Zm9v"/>'
        );

        expect(nodeCertificado.extract()).toBe(expectedExtract);
    });

    test('save with empty filename', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3" Certificado="Zm9v"/>'
        );

        const t = (): void => nodeCertificado.save('');

        expect(t).toThrow(Error);
        expect(t).toThrow('The filename to store the certificate is empty');
    });

    test('save with empty certificado', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3"/>'
        );

        const t = (): void => nodeCertificado.save(__dirname);

        expect(t).toThrow(Error);
        expect(t).toThrow('The certificado attribute is empty');
    });

    test('save with not writable filename', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3" Certificado="Zm9v"/>'
        );

        const t = (): void => nodeCertificado.save(__dirname);

        expect(t).toThrow(Error);
        expect(t).toThrow(`Unable to write the certificate contents into ${__dirname}`);
    });

    test('save', () => {
        const nodeCertificado = createNodeCertificado(
            '<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" Version="3.3" Certificado="Zm9v"/>'
        );

        const temporaryFile = openSync();
        nodeCertificado.save(temporaryFile.path);

        const finalFile = readFileSync(temporaryFile.path, 'binary');
        expect(finalFile).toBe('foo');
        cleanupSync();
    });

    test('obtain', () => {
        const cfdiSample = utilAsset('cfdi32-real.xml');
        const nodeCertificado = createNodeCertificado(readFileSync(cfdiSample, 'binary'));

        const certificate = nodeCertificado.obtain();
        expect(certificate.rfc()).toBe('CTO021007DZ8');
    });
});
