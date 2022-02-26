import { CNode, XmlNodeUtils } from '@nodecfdi/cfdiutils-common';
import { TfdVersion } from '../../../src/timbre-fiscal-digital/tfd-version';

describe('TfdVersion', () => {
    test.each([
        ['1.1', '1.1', 'Version', '1.1'],
        ['1.0', '1.0', 'version', '1.0'],
        ['1.1 bad case', '', 'version', '1.1'],
        ['1.0 bad case', '', 'Version', '1.0'],
        ['1.1 non set', '', 'Version', null],
        ['1.0 non set', '', 'version', null],
        ['1.1 empty', '', 'Version', ''],
        ['1.0 empty', '', 'version', ''],
        ['1.1 wrong number', '', 'Version', '2.1'],
        ['1.0 wrong number', '', 'version', '2.0'],
    ])('tfd version', (name: string, expected: string, attribute: string, value: string | null) => {
        const node = new CNode('tfd', { [attribute]: value });
        const tfdVersion = new TfdVersion();

        expect(tfdVersion.getFromNode(node)).toBe(expected);
        expect(tfdVersion.getFromXmlString(XmlNodeUtils.nodeToXmlString(node)));
    });
});
