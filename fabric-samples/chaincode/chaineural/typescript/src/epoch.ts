export class Epoch {
    public docType?: string;
    public epochName: string;
    public miniBatchesAmount: number;
    public valid: boolean;
    public validatedByOrg:string[];
    public loss: number;
}
