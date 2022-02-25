import { join } from 'path';
import { XmlResolver } from '../src/xml-resolver/xml-resolver';

const useTestCase = (): {
    utilAsset(file: string): string;
    testIf(condition: boolean): jest.It;
    newResolver(): XmlResolver;
} => {
    const testIf = (condition: boolean): jest.It => (condition ? test : test.skip);

    const utilAsset = (file: string): string => {
        return join(__dirname, 'assets', file);
    };

    const newResolver = (): XmlResolver => {
        return new XmlResolver();
    };

    return {
        utilAsset,
        testIf,
        newResolver,
    };
};
export { useTestCase };
