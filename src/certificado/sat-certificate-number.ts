export class SatCertificateNumber {
    private readonly _id: string;

    constructor(id: string) {
        if (!SatCertificateNumber.isValidCertificateNumber(id)) {
            throw new Error('The certificate number is not correct');
        }
        this._id = id;
    }

    public number(): string {
        return this._id;
    }

    public remoteUrl(): string {
        return [
            'https://rdc.sat.gob.mx/rccf',
            `/${this._id.substring(0, 6)}`,
            `/${this._id.substring(6, 12)}`,
            `/${this._id.substring(12, 14)}`,
            `/${this._id.substring(14, 16)}`,
            `/${this._id.substring(16, 18)}`,
            `/${this._id}`,
            '.cer'
        ].join('');
    }

    public static isValidCertificateNumber(id: string): boolean {
        return /^\d{20}$/.test(id);
    }
}
