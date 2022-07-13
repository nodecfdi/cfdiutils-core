import { DownloaderInterface, NodeDownloader } from '@nodecfdi/xml-resource-retriever';

/**
 * This class is a wrapper around NodeDownloader to retry the download if it fails (for any reason).
 *
 * The reason behind this is that the web server at https://rdc.sat.gob.mx/
 * has issues, and sometimes it does not respond with the certificate file.
 *
 * @see https://www.phpcfdi.com/sat/problemas-conocidos/descarga-certificados/
 */
export class CertificateDownloaderHelper implements DownloaderInterface {
    private _realDownloader: NodeDownloader;

    private readonly _maxAttempts: number;

    constructor() {
        this._realDownloader = new NodeDownloader();
        this._maxAttempts = 8;
    }

    public async downloadTo(source: string, destination: string): Promise<void> {
        let attempt = 0;
        let error: Error | null = null;
        let success = false;
        do {
            try {
                await this._realDownloader.downloadTo(source, destination);
                success = true;
            } catch (e) {
                if ((e as Error).message !== `Unable to download ${source} to ${destination}`) {
                    error = e as Error;
                }
                if (attempt === this._maxAttempts) {
                    error = e as Error;
                }
                attempt++;
            }
        } while (!success && error == null && attempt < this._maxAttempts);
        if (success) {
            return;
        }

        throw error;
    }
}
