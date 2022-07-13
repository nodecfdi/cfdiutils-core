import { join } from 'path';
import { XmlResolver } from '~/xml-resolver/xml-resolver';

const useTestCase = (): {
    utilAsset(file: string): string;
    testIf(condition: boolean): jest.It;
    newResolver(): XmlResolver;
    downloadResourceIfNotExists(remote: string): Promise<string>;
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

    return {
        utilAsset,
        testIf,
        newResolver,
        downloadResourceIfNotExists
    };
};
export { useTestCase };
