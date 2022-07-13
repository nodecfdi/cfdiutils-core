import { CNodeInterface } from '@nodecfdi/cfdiutils-common';
import { writeFileSync } from 'fs';
import { Certificate } from '@nodecfdi/credentials';

export class NodeCertificado {
    private _comprobante: CNodeInterface;

    constructor(comprobante: CNodeInterface) {
        this._comprobante = comprobante;
    }

    /**
     * Extract the certificate from Comprobante.certificado
     * If the node does not exist return an empty string
     * The returned string is no longer base64 encoded
     *
     * @throws Error If the certificado attribute is not a valid base64 encoded string
     */
    public extract(): string {
        const version = this.getVersion();
        let attr = '';
        if ('3.2' === version) {
            attr = 'certificado';
        } else if ('3.3' === version) {
            attr = 'Certificado';
        } else if ('4.0' === version) {
            attr = 'Certificado';
        } else {
            throw new Error('Unsupported or unknown version');
        }
        const certificateBase64 = this._comprobante.searchAttribute(attr);
        if ('' === certificateBase64) {
            return '';
        }

        let certificateBin = '';
        try {
            certificateBin = Buffer.from(certificateBase64, 'base64').toString('binary');
        } catch (e) {
            // ignore
        }
        if ('' === certificateBin) {
            throw new Error('The certificado attribute is not a valid base64 encoded string');
        }

        return certificateBin;
    }

    public getVersion(): string {
        if ('3.2' === this._comprobante.searchAttribute('version')) {
            return '3.2';
        }
        if ('3.3' === this._comprobante.searchAttribute('Version')) {
            return '3.3';
        }
        if ('4.0' === this._comprobante.searchAttribute('Version')) {
            return '4.0';
        }

        return '';
    }

    /**
     * Extract and save the certificate into a specified location
     *
     * @see extract
     *
     * @param filename -
     *
     * @throws Error If the filename to store the certificate is empty
     * @throws Error If the certificado attribute is empty
     * @throws Error If cannot write the contents of the certificate
     */
    public save(filename: string): void {
        if ('' === filename) {
            throw new Error('The filename to store the certificate is empty');
        }
        const certificado = this.extract();
        if ('' === certificado) {
            throw new Error('The certificado attribute is empty');
        }
        try {
            writeFileSync(filename, certificado);
        } catch (e) {
            throw new Error(`Unable to write the certificate contents into ${filename}`);
        }
    }

    public obtain(): Certificate {
        const certificado = this.extract();
        if ('' === certificado) {
            throw new Error('The certificado attribute is empty');
        }

        return new Certificate(certificado);
    }
}
