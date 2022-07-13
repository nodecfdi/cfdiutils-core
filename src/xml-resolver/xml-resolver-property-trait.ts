import { XmlResolverPropertyInterface } from './xml-resolver-property-interface';
import { XmlResolver } from './xml-resolver';

export abstract class XmlResolverPropertyTrait implements XmlResolverPropertyInterface {
    private _xmlResolver: XmlResolver | null = null;

    public getXmlResolver(): XmlResolver {
        if (!(this._xmlResolver instanceof XmlResolver)) {
            throw new Error('There is not current xmlResolver');
        }

        return this._xmlResolver;
    }

    public hasXmlResolver(): boolean {
        return this._xmlResolver instanceof XmlResolver;
    }

    public setXmlResolver(xmlResolver: XmlResolver | null = null): void {
        this._xmlResolver = xmlResolver;
    }
}
