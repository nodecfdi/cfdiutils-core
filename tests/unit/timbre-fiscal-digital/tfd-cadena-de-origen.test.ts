import { TfdCadenaDeOrigen } from '../../../src/timbre-fiscal-digital/tfd-cadena-de-origen';
import { XmlResolver } from '../../../src/xml-resolver/xml-resolver';
import { useTestCase } from '../../test-case';
import { XmlNodeUtils } from '@nodecfdi/cfdiutils-common';
import { readFileSync } from 'fs';

describe('TfdCadenaDeOrigen', () => {
    const { newResolver, utilAsset } = useTestCase();

    test('construct minimal', () => {
        const tfdCO = new TfdCadenaDeOrigen();

        expect(tfdCO.getXmlResolver()).toBeInstanceOf(XmlResolver);
    });

    test('construct with xml resolver', () => {
        const resolver = newResolver();
        const tfdCO = new TfdCadenaDeOrigen(resolver);

        expect(tfdCO.getXmlResolver()).toBe(resolver);
    });

    test('obtain version 11 without version argument', async () => {
        const cfdi = XmlNodeUtils.nodeFromXmlString(readFileSync(utilAsset('cfdi33-valid.xml'), 'binary'));
        const tfd = cfdi.searchNode('cfdi:Complemento', 'tfd:TimbreFiscalDigital');
        if (!tfd) {
            fail('Cannot get the tfd:TimbreFiscalDigital node');
        }
        // fix al parecer no me regresa el namespace xmlns:xsi
        tfd.attributes().set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');

        const tfdXml = XmlNodeUtils.nodeToXmlString(tfd);

        const tfdCO = new TfdCadenaDeOrigen();
        const cadenaOrigen = await tfdCO.build(tfdXml);

        const buildTfdString = [
            tfd.attributes().get('Version'),
            tfd.attributes().get('UUID'),
            tfd.attributes().get('FechaTimbrado'),
            tfd.attributes().get('RfcProvCertif'),
            tfd.attributes().get('Leyenda'),
            tfd.attributes().get('SelloCFD'),
            tfd.attributes().get('NoCertificadoSAT'),
        ].join('|');
        const expected = `||${buildTfdString.replace('||', '|')}||`;

        expect(cadenaOrigen).toBe(expected);
    });

    test('xslt location', () => {
        expect(TfdCadenaDeOrigen.xsltLocation('1.0')).toContain('TFD_1_0.xslt');
        expect(TfdCadenaDeOrigen.xsltLocation('1.1')).toContain('TFD_1_1.xslt');
    });

    test('xslt location exception', () => {
        expect.hasAssertions();
        try {
            TfdCadenaDeOrigen.xsltLocation('');
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', 'Cannot get the xslt location for version ');
        }
    });
});
