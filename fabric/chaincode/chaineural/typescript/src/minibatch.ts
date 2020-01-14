export class Minibatch {
    public docType?: string;
    public minibatchNumber: number;
    public epochName: string;
    public workerName: string;
    public byOrg: string;
    public finished: boolean;
}

export class MinibatchPrivateInfo {
    public docType?: string;
    public minibatchNumber: number;
    public epochName: string;
    public learningTime?: string;
    public loss?: number;
}