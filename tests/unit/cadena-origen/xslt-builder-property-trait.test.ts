import { XsltBuilderPropertySpecimen } from './xslt-builder-property-specimen';
import { SaxonbCliBuilder } from '../../../src/cadena-origen/saxonb-cli-builder';

describe('XsltBuilderPropertyTrait', () => {
    test('xslt builder property without set', () => {
        const implementation = new XsltBuilderPropertySpecimen();
        expect(implementation.hasXsltBuilder()).toBeFalsy();

        expect.hasAssertions();
        try {
            implementation.getXsltBuilder();
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect(e).toHaveProperty('message', 'There is no current xsltBuilder');
        }
    });

    test('xslt builder property', () => {
        const builder = new SaxonbCliBuilder('/foo');
        const implementation = new XsltBuilderPropertySpecimen();

        implementation.setXsltBuilder(builder);
        expect(implementation.hasXsltBuilder()).toBeTruthy();
        expect(implementation.getXsltBuilder()).toBe(builder);

        implementation.setXsltBuilder(null);
        expect(implementation.hasXsltBuilder()).toBeFalsy();
    });
});
