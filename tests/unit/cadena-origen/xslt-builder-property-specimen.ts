import { Mixin } from 'ts-mixer';
import { XsltBuilderPropertyTrait } from '~/cadena-origen/xslt-builder-property-trait';
import { XsltBuilderPropertyInterface } from '~/cadena-origen/xslt-builder-property-interface';

export class XsltBuilderPropertySpecimen
    extends Mixin(XsltBuilderPropertyTrait)
    implements XsltBuilderPropertyInterface {}
