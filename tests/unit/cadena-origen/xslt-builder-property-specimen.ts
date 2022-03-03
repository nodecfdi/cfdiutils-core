import { XsltBuilderPropertyInterface, XsltBuilderPropertyTrait } from '../../../src';
import { use } from 'typescript-mix';

export interface XsltBuilderPropertySpecimen extends XsltBuilderPropertyTrait {}

export class XsltBuilderPropertySpecimen implements XsltBuilderPropertyInterface {
    @use(XsltBuilderPropertyTrait) private this: unknown;
}
