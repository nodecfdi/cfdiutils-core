import { XmlNodeUtils, install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom';
import { readFileSync } from 'fs';
import { TfdCadenaDeOrigen } from '~/timbre-fiscal-digital/tfd-cadena-de-origen';
import { XmlResolver } from '~/xml-resolver/xml-resolver';
import { useTestCase } from '../../test-case';

describe('TfdCadenaDeOrigen', () => {
    const { newResolver, utilAsset } = useTestCase();

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('construct minimal', () => {
        const tfdCO = new TfdCadenaDeOrigen();

        expect(tfdCO.getXmlResolver()).toBeInstanceOf(XmlResolver);
    });

    test('construct with xml resolver', () => {
        const resolver = newResolver();
        const tfdCO = new TfdCadenaDeOrigen(resolver);

        expect(tfdCO.getXmlResolver()).toBe(resolver);
    });

    test('obtain version 11', async () => {
        const cfdi = XmlNodeUtils.nodeFromXmlString(readFileSync(utilAsset('cfdi33-valid.xml'), 'binary'));
        const tfd = cfdi.searchNode('cfdi:Complemento', 'tfd:TimbreFiscalDigital');
        if (!tfd) {
            throw new Error('Cannot get the tfd:TimbreFiscalDigital node');
        }
        // fix al parecer no me regresa el namespace xmlns:xsi
        tfd.attributes().set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');

        const tfdXml = XmlNodeUtils.nodeToXmlString(tfd);

        const tfdCO = new TfdCadenaDeOrigen(newResolver());
        let cadenaOrigen = await tfdCO.build(tfdXml);

        const buildTfdString = [
            tfd.attributes().get('Version'),
            tfd.attributes().get('UUID'),
            tfd.attributes().get('FechaTimbrado'),
            tfd.attributes().get('RfcProvCertif'),
            tfd.attributes().get('Leyenda'),
            tfd.attributes().get('SelloCFD'),
            tfd.attributes().get('NoCertificadoSAT')
        ].join('|');
        const expected = `||${buildTfdString.replace('||', '|')}||`;

        expect(cadenaOrigen).toBe(expected);

        cadenaOrigen = await tfdCO.build(tfdXml, '1.1');
        expect(cadenaOrigen).toBe(expected);
    });

    test('xslt location', () => {
        expect(TfdCadenaDeOrigen.xsltLocation('1.0')).toContain('TFD_1_0.xslt');
        expect(TfdCadenaDeOrigen.xsltLocation('1.1')).toContain('TFD_1_1.xslt');
    });

    test('xslt location exception', () => {
        const t = (): string => TfdCadenaDeOrigen.xsltLocation('');

        expect(t).toThrow(Error);
        expect(t).toThrow('Cannot get the xslt location for version ');
    });
});
