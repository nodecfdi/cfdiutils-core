import { NodeDownloader, DownloaderInterface, RetrieverInterface } from '@nodecfdi/xml-resource-retriever';
import { install } from '@nodecfdi/cfdiutils-common';
import { XMLSerializer, DOMImplementation, DOMParser } from '@xmldom/xmldom';
import { existsSync } from 'fs';
import { SatCertificateNumber } from '~/certificado/sat-certificate-number';
import { XmlResolver } from '~/xml-resolver/xml-resolver';
import { useTestCase } from '../../test-case';

describe('XmlResolver', () => {
    const { newResolver, utilAsset, installCertificate } = useTestCase();

    beforeAll(() => {
        install(new DOMParser(), new XMLSerializer(), new DOMImplementation());
    });

    test('constructor', () => {
        const resolver = new XmlResolver();

        expect(resolver.getLocalPath()).toBe(XmlResolver.defaultLocalPath());
        expect(resolver.hasLocalPath()).toBeTruthy();
        expect(resolver.getDownloader()).toBeInstanceOf(NodeDownloader);
    });

    test('set local path', () => {
        const defaultLocalPath = XmlResolver.defaultLocalPath();
        const customPath = '/temporary/resources/';

        // constructed
        const resolver = new XmlResolver();
        expect(resolver.getLocalPath()).toBe(defaultLocalPath);
        expect(resolver.hasLocalPath()).toBeTruthy();

        // change to empty '' (disable)
        resolver.setLocalPath('');
        expect(resolver.getLocalPath()).toBe('');
        expect(resolver.hasLocalPath()).toBeFalsy();

        // change to custom value
        resolver.setLocalPath(customPath);
        expect(resolver.getLocalPath()).toBe(customPath);
        expect(resolver.hasLocalPath()).toBeTruthy();

        // change to default value
        resolver.setLocalPath(null);
        expect(resolver.getLocalPath()).toBe(defaultLocalPath);
        expect(resolver.hasLocalPath()).toBeTruthy();
    });

    test('retrieve without local path', async () => {
        const resolver = new XmlResolver('');
        expect(resolver.hasLocalPath()).toBeFalsy();

        const resource = 'http://example.com/schemas/example.xslt';
        const response = await resolver.resolve(resource);
        expect(response).toBe(resource);
    });

    /*
     * This test will download xslt for cfdi 3.3 from
     * http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt
     * and all its relatives and put it in the default path of XmlResolver (project root + build + resources)
     */
    test('retrieve with default local path', async () => {
        const resolver = newResolver();
        expect(resolver.hasLocalPath()).toBeTruthy();

        const endpoint = 'http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt';
        const localResource = await resolver.resolve(endpoint);

        expect(localResource).not.toBe('');
        expect(existsSync(localResource)).toBeTruthy();
    });

    test('resolve throws exception when unknown resource is set', async () => {
        const resolver = new XmlResolver();

        const t = async (): Promise<string> => resolver.resolve('http://example.org/example.xml');

        await expect(t).rejects.toThrow(Error);
        await expect(t).rejects.toThrow(`Unable to handle the resource (Type: ) http://example.org/example.xml`);
    });

    test('get retrieve throws exception when localpath is empty', async () => {
        const resolver = new XmlResolver('');

        const t = (): RetrieverInterface | undefined => resolver.newRetriever(XmlResolver.TYPE_CER);

        expect(t).toThrow(Error);
        expect(t).toThrow('Cannot create a retriever if no local path was found');
    });

    test.each([
        ['xsd', 'http://example.com/resource.xsd', XmlResolver.TYPE_XSD],
        ['xlst', 'http://example.com/resource.xslt', XmlResolver.TYPE_XSLT],
        ['cer', 'http://example.com/resource.cer', XmlResolver.TYPE_CER],
        ['unknown', 'http://example.com/resource.xml', ''],
        ['empty', '', ''],
        ['end with xml but no extension', 'http://example.com/xml', '']
    ])('obtain type from url %s', (_name: string, url: string, expectedType: string) => {
        const resolver = new XmlResolver();
        expect(resolver.obtainTypeFromUrl(url)).toBe(expectedType);
    });

    test('resolve cer file with existent file', async () => {
        const localPath = installCertificate(utilAsset('certs/20001000000300022779.cer'));

        const certificateId = '20001000000300022779';
        const cerNumber = new SatCertificateNumber(certificateId);
        const resolver = newResolver();
        const remoteUrl = cerNumber.remoteUrl();

        const nullDownloader = new (class implements DownloaderInterface {
            public downloadTo(source: string, destination: string): Promise<void> {
                throw new Error(`${source} will not be downloaded to ${destination}`);
            }
        })();

        resolver.setDownloader(nullDownloader);

        const resolvedPath = await resolver.resolve(remoteUrl, XmlResolver.TYPE_CER);

        expect(resolvedPath).toBe(localPath);
    });
});
