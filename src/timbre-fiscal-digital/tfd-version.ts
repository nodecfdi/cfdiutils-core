import { VersionDiscoverer } from '../version-discovery/version-discoverer';

export class TfdVersion extends VersionDiscoverer {
    protected static createDiscoverer(): VersionDiscoverer {
        return new TfdVersion();
    }

    public rules(): Record<string, string> {
        return {
            '1.1': 'Version',
            '1.0': 'version'
        };
    }
}
