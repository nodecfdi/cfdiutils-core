import { SatCertificateNumber } from '~/certificado/sat-certificate-number';

describe('SatCertificateNumber', () => {
    test.each([['00000000000000000000'], ['98765432109876543210']])(
        'is valid certificate number with correct values %s',
        (value: string) => {
            expect(SatCertificateNumber.isValidCertificateNumber(value)).toBeTruthy();

            const number = new SatCertificateNumber(value);
            expect(number.number()).toBe(value);
            expect(number.remoteUrl().endsWith(`${value}.cer`)).toBeTruthy();
        }
    );

    test.each([
        ['empty', ''],
        ['with-non-digits', 'A0000000000000000000'],
        ['length 19', '0000000000000000000'],
        ['length 21', '000000000000000000000']
    ])('is valid certificate number with incorrect values %s', (_name: string, value: string) => {
        expect(SatCertificateNumber.isValidCertificateNumber(value)).toBeFalsy();

        const t = (): SatCertificateNumber => new SatCertificateNumber(value);

        expect(t).toThrow(Error);
        expect(t).toThrow('The certificate number is not correct');
    });
});
