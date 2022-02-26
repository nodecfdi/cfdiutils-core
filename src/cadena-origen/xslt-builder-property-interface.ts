import { XsltBuilderInterface } from './xslt-builder-interface';

export interface XsltBuilderPropertyInterface {
    hasXsltBuilder(): boolean;

    getXsltBuilder(): XsltBuilderInterface;

    setXsltBuilder(xsltBuilder: XsltBuilderInterface | null): void;
}
