import { CNodeInterface } from '@nodecfdi/cfdiutils-common';
import { ContainerWithAttributeInterface } from './container-with-attribute-interface';

export class NodeContainer implements ContainerWithAttributeInterface {
    private _node: CNodeInterface;

    constructor(node: CNodeInterface) {
        this._node = node;
    }

    public getAttributeValue(attribute: string): string {
        return this._node.get(attribute);
    }
}
