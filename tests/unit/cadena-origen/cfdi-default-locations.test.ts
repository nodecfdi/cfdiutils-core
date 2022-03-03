import { CfdiDefaultLocations } from '../../../src';

describe('CfdiDefaultLocations', () => {
    test.each([
        ['3.2', CfdiDefaultLocations.XSLT_32],
        ['3.3', CfdiDefaultLocations.XSLT_33],
        ['4.0', CfdiDefaultLocations.XSLT_40],
    ])('location by version %s', (version, location) => {
        expect(CfdiDefaultLocations.location(version)).toBe(location);
    });
});
