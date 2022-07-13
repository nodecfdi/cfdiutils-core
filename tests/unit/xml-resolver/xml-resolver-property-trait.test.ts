import { XmlResolverPropertyInterface } from '~/xml-resolver/xml-resolver-property-interface';
import { XmlResolver } from '~/xml-resolver/xml-resolver';
import { XmlResolverPropertySpecimen } from './xml-resolver-property-specimen';

describe('XmlResolverPropertyTrait', () => {
    let specimen: XmlResolverPropertyInterface;

    beforeEach(() => {
        specimen = new XmlResolverPropertySpecimen();
    });

    test('initial state', () => {
        expect(specimen.hasXmlResolver()).toBeFalsy();
    });

    test('getter fails on initial state', () => {
        const t = (): XmlResolver => specimen.getXmlResolver();

        expect(t).toThrow(Error);
        expect(t).toThrow('There is not current xmlResolver');
    });

    test('setter to value and to null', () => {
        const xmlResolver = new XmlResolver();
        specimen.setXmlResolver(xmlResolver);
        expect(specimen.hasXmlResolver()).toBeTruthy();

        specimen.setXmlResolver(null);
        expect(specimen.hasXmlResolver()).toBeFalsy();
    });

    test('getter fails after setting resolver to null', () => {
        const xmlResolver = new XmlResolver();
        specimen.setXmlResolver(xmlResolver);
        expect(specimen.hasXmlResolver()).toBeTruthy();

        specimen.setXmlResolver(null);
        const t = (): XmlResolver => specimen.getXmlResolver();

        expect(t).toThrow(Error);
        expect(t).toThrow('There is not current xmlResolver');
    });
});
