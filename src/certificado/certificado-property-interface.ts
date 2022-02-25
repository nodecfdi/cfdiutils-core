import { Certificate } from '@nodecfdi/credentials';

export interface CertificadoPropertyInterface {
    getCertificado(): Certificate;

    setCertificado(certificado: Certificate | null): void;
}
