import { use } from 'typescript-mix';
import { CertificadoPropertyTrait } from '../../../src';

export interface CertificadoPropertySpecimen extends CertificadoPropertyTrait {}

export class CertificadoPropertySpecimen {
    @use(CertificadoPropertyTrait) private this: unknown;
}
