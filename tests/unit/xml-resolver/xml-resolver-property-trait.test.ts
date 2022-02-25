import { XmlResolverPropertyInterface } from '../../../src/xml-resolver/xml-resolver-property-interface';
import { XmlResolverPropertySpecimen } from './xml-resolver-property-specimen';
import { XmlResolver } from '../../../src/xml-resolver/xml-resolver';

describe('XmlResolverPropertyTrait', () => {
    let specimen: XmlResolverPropertyInterface;

    beforeEach(() => {
        specimen = new XmlResolverPropertySpecimen();
    });

    test('initial state', () => {
        expect(specimen.hasXmlResolver()).toBeFalsy();
    });

    test('getter fails on initial state', () => {
        expect.hasAssertions();
        try {
            specimen.getXmlResolver();
        } catch (e) {
            expect(e).toBeInstanceOf(ReferenceError);
            expect(e).toHaveProperty('message', 'There is not current xmlResolver');
        }
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

        expect.hasAssertions();
        try {
            specimen.getXmlResolver();
        } catch (e) {
            expect(e).toBeInstanceOf(ReferenceError);
            expect(e).toHaveProperty('message', 'There is not current xmlResolver');
        }
    });
});
