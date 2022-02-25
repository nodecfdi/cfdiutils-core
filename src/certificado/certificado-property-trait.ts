import { CertificadoPropertyInterface } from './certificado-property-interface';
import { Certificate } from '@nodecfdi/credentials';

export abstract class CertificadoPropertyTrait implements CertificadoPropertyInterface {
    private _certificado: Certificate | null = null;

    public hasCertificado(): boolean {
        return this._certificado instanceof Certificate;
    }

    public getCertificado(): Certificate {
        if (!(this._certificado instanceof Certificate)) {
            throw new ReferenceError('There is no current certificado');
        }
        return this._certificado;
    }

    public setCertificado(certificado: Certificate | null = null): void {
        this._certificado = certificado;
    }
}
