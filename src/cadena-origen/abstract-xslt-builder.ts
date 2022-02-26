import { XsltBuilderInterface } from './xslt-builder-interface';

export abstract class AbstractXsltBuilder implements XsltBuilderInterface {
    public abstract build(xmlContent: string, xsltLocation: string): Promise<string>;

    protected assertBuildArgument(xmlContent: string, xsltLocation: string): string {
        if ('' === xmlContent) {
            throw new SyntaxError('The XML content to transform is empty');
        }
        if ('' === xsltLocation) {
            throw new SyntaxError('Xslt location was not set');
        }
        return '';
    }
}
