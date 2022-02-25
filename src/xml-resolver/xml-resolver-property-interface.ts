import { XmlResolver } from './xml-resolver';

export interface XmlResolverPropertyInterface {
    hasXmlResolver(): boolean;

    getXmlResolver(): XmlResolver;

    setXmlResolver(xmlResolver: XmlResolver | null): void;
}
