import { SatCertificateNumber } from '../../../src';
import { useTestCase } from '../../test-case';
import { CertificateDownloaderHelper } from './CertificateDownloaderHelper';
import { existsSync, unlinkSync } from 'fs';
import { Certificate } from '@nodecfdi/credentials';

describe('CerRetriever', () => {
    const { newResolver } = useTestCase();

    test('retrieve non existent', async () => {
        // this certificate does not exist in the internet repository it will fail to download
        const certificateId = '20001000000300022779';
        const cerNumber = new SatCertificateNumber(certificateId);
        const retriever = newResolver().newCerRetriever();
        const remoteUrl = cerNumber.remoteUrl();

        expect.hasAssertions();
        try {
            await retriever.retrieve(remoteUrl);
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
            expect((e as Error).message).toContain(remoteUrl);
        }
    });

    test('retrieve valid certificate', async () => {
        const certificateId = '00001000000406258094';
        const cerNumber = new SatCertificateNumber(certificateId);
        const retriever = newResolver().newCerRetriever();
        retriever.setDownloader(new CertificateDownloaderHelper());
        const remoteUrl = cerNumber.remoteUrl();
        const localPath = retriever.buildPath(remoteUrl);

        if (existsSync(localPath)) {
            unlinkSync(localPath);
        }
        expect(existsSync(localPath)).toBeFalsy();

        await retriever.retrieve(remoteUrl);
        expect(existsSync(localPath)).toBeTruthy();

        const certificate = Certificate.openFile(localPath);
        expect(certificate.serialNumber().bytes()).toBe(certificateId);
    }, 30000);
});
