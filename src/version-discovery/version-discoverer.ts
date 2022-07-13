import { CNodeInterface, Xml } from '@nodecfdi/cfdiutils-common';
import { ContainerWithAttributeInterface } from './container-with-attribute-interface';
import { DomElementContainer } from './dom-element-container';
import { NodeContainer } from './node-container';

export abstract class VersionDiscoverer {
    /**
     * This method should be implemented and return Record of key/value elements
     * where the key is the version number
     * and the value is the attribute to query
     */
    public abstract rules(): Record<string, string>;

    public discover(container: ContainerWithAttributeInterface): string {
        for (const [versionNumber, attribute] of Object.entries(this.rules())) {
            const currentValue = container.getAttributeValue(attribute);
            if (versionNumber === currentValue) {
                return versionNumber;
            }
        }

        return '';
    }

    public getFromDOMElement(element: Element): string {
        return this.discover(new DomElementContainer(element));
    }

    public getFromDOMDocument(document: Document): string {
        return this.getFromDOMElement(Xml.documentElement(document));
    }

    public getFromNode(node: CNodeInterface): string {
        return this.discover(new NodeContainer(node));
    }

    public getFromXmlString(contents: string): string {
        return this.getFromDOMDocument(Xml.newDocumentContent(contents));
    }
}
