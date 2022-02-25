export class CfdiDefaultLocations {
    public static XSLT_32 = 'http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_2/cadenaoriginal_3_2.xslt';
    public static XSLT_33 = 'http://www.sat.gob.mx/sitio_internet/cfd/3/cadenaoriginal_3_3/cadenaoriginal_3_3.xslt';
    public static XSLT_40 = 'http://www.sat.gob.mx/sitio_internet/cfd/4/cadenaoriginal_4_0/cadenaoriginal_4_0.xslt';

    public static location(version: string): string {
        if ('4.0' === version) {
            return CfdiDefaultLocations.XSLT_40;
        }
        if ('3.3' === version) {
            return CfdiDefaultLocations.XSLT_33;
        }
        if ('3.2' === version) {
            return CfdiDefaultLocations.XSLT_32;
        }
        throw new SyntaxError(`Cannot get the default xslt location for version ${version}`);
    }
}
