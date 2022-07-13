export interface XsltBuilderInterface {
    /**
     * Transform XML content to a string using XSLT
     *
     * @param xmlContent - Raw string of xml content expected on UTF-8
     * @param xsltLocation - Path of xslt location
     *
     * @throws Error If the xml content is empty
     * @throws Error If the xslt location is empty
     * @throws Error On procedural errors
     */
    build(xmlContent: string, xsltLocation: string): Promise<string>;
}
