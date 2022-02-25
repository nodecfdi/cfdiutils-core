const useTestCase = (): {
    testIf(condition: boolean): jest.It;
} => {
    const testIf = (condition: boolean): jest.It => (condition ? test : test.skip);

    return {
        testIf,
    };
};
export { useTestCase };
