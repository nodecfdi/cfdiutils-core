import { existsSync, lstatSync, cpSync, mkdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { SatCertificateNumber } from '~/certificado/sat-certificate-number';
import { XmlResolver } from '~/xml-resolver/xml-resolver';

const useTestCase = (): {
    utilAsset(file: string): string;
    testIf(condition: boolean): jest.It;
    newResolver(): XmlResolver;
    downloadResourceIfNotExists(remote: string): Promise<string>;
    installCertificate(cerfile: string): string;
} => {
    const testIf = (condition: boolean): jest.It => (condition ? test : test.skip);

    const utilAsset = (file: string): string => {
        return join(__dirname, '_files', file);
    };

    const downloadResourceIfNotExists = (remote: string): Promise<string> => {
        return newResolver().resolve(remote);
    };

    const newResolver = (): XmlResolver => {
        return new XmlResolver(join(__dirname, '_build'));
    };

    const installCertificate = (cerFile: string): string => {
        const certificateNumber = basename(cerFile, '.cer').substring(0, 20);
        const satCertificateNumber = new SatCertificateNumber(certificateNumber);

        const cerRetriever = newResolver().newCerRetriever();

        const installationPath = cerRetriever.buildPath(satCertificateNumber.remoteUrl());
        if (existsSync(installationPath)) {
            return installationPath;
        }

        const installationDir = dirname(installationPath);
        if (!existsSync(installationDir)) {
            mkdirSync(installationDir, { recursive: true });
        }
        if (!lstatSync(installationDir).isDirectory()) {
            throw new Error(`Cannot create installation dir ${installationDir}`);
        }

        try {
            if (existsSync(installationPath)) {
                return installationPath;
            }
            cpSync(cerFile, installationPath);
        } catch (e) {
            throw new Error(`Cannot install ${cerFile} into ${installationPath} error: ${(e as Error).message}`);
        }

        return installationPath;
    };

    return {
        utilAsset,
        testIf,
        newResolver,
        downloadResourceIfNotExists,
        installCertificate
    };
};
export { useTestCase };
