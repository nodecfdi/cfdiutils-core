import { ContainerWithAttributeInterface } from './container-with-attribute-interface';
import { CNodeInterface } from '@nodecfdi/cfdiutils-common';

export class NodeContainer implements ContainerWithAttributeInterface {
    private _node: CNodeInterface;

    constructor(node: CNodeInterface) {
        this._node = node;
    }

    public getAttributeValue(attribute: string): string {
        return this._node.get(attribute);
    }
}
