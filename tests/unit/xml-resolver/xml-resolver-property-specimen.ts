import { use } from 'typescript-mix';
import { XmlResolverPropertyTrait } from '../../../src/xml-resolver/xml-resolver-property-trait';

export interface XmlResolverPropertySpecimen extends XmlResolverPropertyTrait {}

export class XmlResolverPropertySpecimen {
    @use(XmlResolverPropertyTrait) private this: unknown;
}
