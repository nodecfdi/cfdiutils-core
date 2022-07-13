import { Mixin } from 'ts-mixer';
import { TfdVersion } from './tfd-version';
import { XmlResolverPropertyInterface } from '../xml-resolver/xml-resolver-property-interface';
import { XsltBuilderPropertyInterface } from '../cadena-origen/xslt-builder-property-interface';
import { XmlResolverPropertyTrait } from '../xml-resolver/xml-resolver-property-trait';
import { XsltBuilderPropertyTrait } from '../cadena-origen/xslt-builder-property-trait';
import { XmlResolver } from '../xml-resolver/xml-resolver';
import { XsltBuilderInterface } from '../cadena-origen/xslt-builder-interface';
import { SaxonbCliBuilder } from '../cadena-origen/saxonb-cli-builder';

class TfdCadenaDeOrigen
    extends Mixin(XmlResolverPropertyTrait, XsltBuilderPropertyTrait)
    implements XmlResolverPropertyInterface, XsltBuilderPropertyInterface
{
    public static TFD_10 = 'http://www.sat.gob.mx/sitio_internet/timbrefiscaldigital/cadenaoriginal_TFD_1_0.xslt';

    public static TFD_11 = 'http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/cadenaoriginal_TFD_1_1.xslt';

    constructor(xmlResolver: XmlResolver | null = null, xsltBuilder: XsltBuilderInterface | null = null) {
        super();
        this.setXmlResolver(xmlResolver || new XmlResolver());
        this.setXsltBuilder(xsltBuilder || new SaxonbCliBuilder('/usr/bin/saxonb-xslt'));
    }

    public async build(tfdXmlString: string, version = ''): Promise<string> {
        // this will throw an exception if no resolver is set
        const resolver = this.getXmlResolver();

        // obtain version if it was not set
        if (version === '') {
            version = new TfdVersion().getFromXmlString(tfdXmlString);
        }

        // get remote location of the xslt
        const defaultXslt = TfdCadenaDeOrigen.xsltLocation(version);

        // get local xslt
        const localXsd = await resolver.resolve(defaultXslt);

        // return transformation
        return this.getXsltBuilder().build(tfdXmlString, localXsd);
    }

    public static xsltLocation(version: string): string {
        if ('1.1' === version) {
            return TfdCadenaDeOrigen.TFD_11;
        }
        if ('1.0' === version) {
            return TfdCadenaDeOrigen.TFD_10;
        }
        throw new Error(`Cannot get the xslt location for version ${version}`);
    }
}

export { TfdCadenaDeOrigen };
