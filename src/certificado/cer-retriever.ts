import { Certificate } from '@nodecfdi/credentials';
import { AbstractBaseRetriever, DownloaderInterface, RetrieverInterface } from '@nodecfdi/xml-resource-retriever';
import { unlink } from 'fs';

export class CerRetriever extends AbstractBaseRetriever implements RetrieverInterface {
    constructor(basePath: string, downloader: DownloaderInterface | null = null) {
        super(basePath, downloader);
    }

    protected checkIsValidDownloadedFile(source: string, localPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                Certificate.openFile(localPath);
                resolve();
            } catch (e) {
                unlink(localPath, () => {
                    reject(new Error(`The source ${source} is not a cer file`));
                });
            }
        });
    }

    public async retrieve(url: string): Promise<string> {
        this.clearHistory();
        const localFileName = await this.download(url);
        this.addToHistory(url, localFileName);
        return Promise.resolve(localFileName);
    }
}
