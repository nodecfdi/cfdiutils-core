export interface XsltBuilderInterface {
    /**
     * Transform XML content to a string using XSLT
     *
     * @param xmlContent
     * @param xsltLocation
     *
     * @throws {SyntaxError} If the xml content is empty
     * @throws {SyntaxError} If the xslt location is empty
     * @throws {Error} On procedural errors
     */
    build(xmlContent: string, xsltLocation: string): Promise<string>;
}
