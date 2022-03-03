import { use } from 'typescript-mix';
import { XmlResolverPropertyTrait } from '../../../src';

export interface XmlResolverPropertySpecimen extends XmlResolverPropertyTrait {}

export class XmlResolverPropertySpecimen {
    @use(XmlResolverPropertyTrait) private this: unknown;
}
