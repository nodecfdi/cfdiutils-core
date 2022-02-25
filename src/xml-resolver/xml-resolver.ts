import {
    DownloaderInterface,
    NodeDownloader,
    RetrieverInterface,
    XsdRetriever,
    XsltRetriever,
} from '@nodecfdi/xml-resource-retriever';
import { join } from 'path';
import { existsSync } from 'fs';
import { CerRetriever } from '../certificado/cer-retriever';

/**
 * XmlResolver - Class to download xml resources from internet to local paths
 */
export class XmlResolver {
    private _localPath = '';
    private _downloader!: DownloaderInterface;
    public static TYPE_XSD = 'XSD';
    public static TYPE_XSLT = 'XSLT';
    public static TYPE_CER = 'CER';

    constructor(localPath: string | null = null, downloader: DownloaderInterface | null = null) {
        this.setLocalPath(localPath);
        this.setDownloader(downloader);
    }

    public static defaultLocalPath(): string {
        // drop 2 dirs: src/xml-resolver
        return join(__dirname, '..', '..', 'build', 'resources');
    }

    /**
     * Set the localPath to the specified value.
     * If localPath is null then the value of defaultLocalPath is used.
     *
     * @param localPath values: '' -> no resolve, null -> default path, anything else is the path
     */
    public setLocalPath(localPath: string | null = null): void {
        if (localPath === null) {
            localPath = XmlResolver.defaultLocalPath();
        }
        this._localPath = localPath;
    }

    /**
     * Return the configured localPath.
     * An empty string means that it is not configured and method resolve will return the same url as received
     */
    public getLocalPath(): string {
        return this._localPath;
    }

    /**
     * Return when a local path has been set
     */
    public hasLocalPath(): boolean {
        return '' !== this._localPath;
    }

    /**
     * Set the downloader object.
     * If send a null value the object return by defaultDownloader will be set.
     *
     * @param downloader
     */
    public setDownloader(downloader: DownloaderInterface | null = null): void {
        if (!downloader) {
            downloader = XmlResolver.defaultDownloader();
        }
        this._downloader = downloader;
    }

    public static defaultDownloader(): DownloaderInterface {
        return new NodeDownloader();
    }

    public getDownloader(): DownloaderInterface {
        return this._downloader;
    }

    public async resolve(resource: string, type = ''): Promise<string> {
        if (!this.hasLocalPath()) {
            return Promise.resolve(resource);
        }
        if ('' == type) {
            type = this.obtainTypeFromUrl(resource);
        } else {
            type = type.toUpperCase();
        }
        const retriever = this.newRetriever(type);
        if (!retriever) {
            return Promise.reject(new Error(`Unable to handle the resource (Type: ${type}) ${resource}`));
        }
        const local = retriever.buildPath(resource);
        if (!existsSync(local)) {
            await retriever.retrieve(resource);
        }
        return local;
    }

    public obtainTypeFromUrl(url: string): string {
        if (this.isResourceExtension(url, 'xsd')) {
            return XmlResolver.TYPE_XSD;
        }
        if (this.isResourceExtension(url, 'xslt')) {
            return XmlResolver.TYPE_XSLT;
        }
        if (this.isResourceExtension(url, 'cer')) {
            return XmlResolver.TYPE_CER;
        }
        return '';
    }

    protected isResourceExtension(resource: string, extension: string): boolean {
        extension = `.${extension}`;
        if (extension.length > resource.length) {
            return false;
        }
        return resource.toLowerCase().endsWith(extension);
    }

    /**
     * Create a new Retriever depending on the type parameter, only allow TYPE_XSLT and TYPE_XSD
     *
     * @param type
     */
    public newRetriever(type: string): RetrieverInterface | undefined {
        if (!this.hasLocalPath()) {
            throw new ReferenceError('Cannot create a retriever if no local path was found');
        }
        if (XmlResolver.TYPE_XSLT === type) {
            return this.newXsltRetriever();
        }
        if (XmlResolver.TYPE_XSD === type) {
            return this.newXsdRetriever();
        }
        if (XmlResolver.TYPE_CER === type) {
            return this.newCerRetriever();
        }
        return undefined;
    }

    public newXsltRetriever(): XsltRetriever {
        return new XsltRetriever(this.getLocalPath(), this.getDownloader());
    }

    public newXsdRetriever(): XsdRetriever {
        return new XsdRetriever(this.getLocalPath(), this.getDownloader());
    }

    public newCerRetriever(): CerRetriever {
        return new CerRetriever(this.getLocalPath(), this.getDownloader());
    }

    public resolveCadenaOrigenLocation(version: string): void {
        // TODO
    }
}
