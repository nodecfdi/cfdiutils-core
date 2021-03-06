import { Certificate } from '@nodecfdi/credentials';
import { CertificadoPropertySpecimen } from './certificado-property-specimen';
import { useTestCase } from '../../test-case';

describe('CertificadoPropertyTrait', () => {
    const { utilAsset } = useTestCase();

    test('certificado property', () => {
        const implementation = new CertificadoPropertySpecimen();
        expect(implementation.hasCertificado()).toBeFalsy();

        const certificado = Certificate.openFile(utilAsset('certs/EKU9003173C9.cer'));
        implementation.setCertificado(certificado);
        expect(implementation.hasCertificado()).toBeTruthy();
        expect(implementation.getCertificado()).toBe(certificado);

        implementation.setCertificado();
        expect(implementation.hasCertificado()).toBeFalsy();

        const t = (): Certificate => implementation.getCertificado();

        expect(t).toThrow(Error);
        expect(t).toThrow('current certificado');
    });
});
