import { XsltBuilderInterface } from './xslt-builder-interface';

export abstract class AbstractXsltBuilder implements XsltBuilderInterface {
    public abstract build(xmlContent: string, xsltLocation: string): Promise<string>;

    protected assertBuildArgument(xmlContent: string, xsltLocation: string): string {
        if ('' === xmlContent) {
            throw new Error('The XML content to transform is empty');
        }
        if ('' === xsltLocation) {
            throw new Error('Xslt location was not set');
        }

        return '';
    }
}
