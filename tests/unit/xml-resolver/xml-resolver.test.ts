import { XmlResolver } from '../../../src';
import { NodeDownloader } from '@nodecfdi/xml-resource-retriever';
import { existsSync } from 'fs';

describe('XmlResolver', () => {
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
        const resolver = new XmlResolver();
        expect(resolver.hasLocalPath()).toBeTruthy();

        const endpoint = 'http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt';
        const localResource = await resolver.resolve(endpoint);

        expect(localResource).not.toBe('');
        expect(existsSync(localResource)).toBeTruthy();
    });

    test('resolve throws exception when unknown resource is set', async () => {
        const resolver = new XmlResolver();

        expect.hasAssertions();
        try {
            await resolver.resolve('http://example.org/example.xml');
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty(
                'message',
                `Unable to handle the resource (Type: ) http://example.org/example.xml`
            );
        }
    });

    test.each([
        ['xsd', 'http://example.com/resource.xsd', XmlResolver.TYPE_XSD],
        ['xlst', 'http://example.com/resource.xslt', XmlResolver.TYPE_XSLT],
        ['cer', 'http://example.com/resource.cer', XmlResolver.TYPE_CER],
        ['unknown', 'http://example.com/resource.xml', ''],
        ['empty', '', ''],
        ['end with xml but no extension', 'http://example.com/xml', ''],
    ])('obtain type from url %s', (name: string, url: string, expectedType: string) => {
        const resolver = new XmlResolver();
        expect(resolver.obtainTypeFromUrl(url)).toBe(expectedType);
    });
});
