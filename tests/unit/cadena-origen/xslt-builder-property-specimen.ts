import { XsltBuilderPropertyInterface } from '../../../src/cadena-origen/xslt-builder-property-interface';
import { use } from 'typescript-mix';
import { XsltBuilderPropertyTrait } from '../../../src/cadena-origen/xslt-builder-property-trait';

export interface XsltBuilderPropertySpecimen extends XsltBuilderPropertyTrait {}

export class XsltBuilderPropertySpecimen implements XsltBuilderPropertyInterface {
    @use(XsltBuilderPropertyTrait) private this: unknown;
}
