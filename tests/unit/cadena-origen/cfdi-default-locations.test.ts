import { CfdiDefaultLocations } from '~/cadena-origen/cfdi-default-locations';

describe('CfdiDefaultLocations', () => {
    test.each([
        ['3.2', CfdiDefaultLocations.XSLT_32],
        ['3.3', CfdiDefaultLocations.XSLT_33],
        ['4.0', CfdiDefaultLocations.XSLT_40]
    ])('location by version %s', (version, location) => {
        expect(CfdiDefaultLocations.location(version)).toBe(location);
    });

    test('invalid version throw error', () => {
        const t = (): string => CfdiDefaultLocations.location('1.0');

        expect(t).toThrow(Error);
        expect(t).toThrow('Cannot get the default xslt location for version 1.0');
    });
});
