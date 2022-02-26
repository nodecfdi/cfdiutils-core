import { ContainerWithAttributeInterface } from './container-with-attribute-interface';

export class DomElementContainer implements ContainerWithAttributeInterface {
    private _element: Element;

    constructor(element: Element) {
        this._element = element;
    }

    public getAttributeValue(attribute: string): string {
        return this._element.getAttribute(attribute) || '';
    }
}
