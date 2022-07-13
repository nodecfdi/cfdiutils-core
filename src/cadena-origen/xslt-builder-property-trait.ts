import { XsltBuilderPropertyInterface } from './xslt-builder-property-interface';
import { XsltBuilderInterface } from './xslt-builder-interface';

export abstract class XsltBuilderPropertyTrait implements XsltBuilderPropertyInterface {
    private _xsltBuilder: XsltBuilderInterface | null = null;

    public getXsltBuilder(): XsltBuilderInterface {
        if (!this._xsltBuilder) {
            throw new Error('There is no current xsltBuilder');
        }

        return this._xsltBuilder;
    }

    public hasXsltBuilder(): boolean {
        return !!this._xsltBuilder;
    }

    public setXsltBuilder(xsltBuilder: XsltBuilderInterface | null): void {
        this._xsltBuilder = xsltBuilder;
    }
}
