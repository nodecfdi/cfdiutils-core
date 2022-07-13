import { XsltBuilderInterface } from '~/cadena-origen/xslt-builder-interface';
import { SaxonbCliBuilder } from '~/cadena-origen/saxonb-cli-builder';
import { XsltBuilderPropertySpecimen } from './xslt-builder-property-specimen';

describe('XsltBuilderPropertyTrait', () => {
    test('xslt builder property without set', async () => {
        const implementation = new XsltBuilderPropertySpecimen();
        expect(implementation.hasXsltBuilder()).toBeFalsy();

        const t = async (): Promise<XsltBuilderInterface> => implementation.getXsltBuilder();

        await expect(t).rejects.toBeInstanceOf(Error);
        await expect(t).rejects.toThrow('There is no current xsltBuilder');
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
