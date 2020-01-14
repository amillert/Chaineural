export interface PeerOrg{
    id: number,
    name: string,
    endpoint: string,
    org:string
}

export interface ChaincodeInfo{
    name: string,
    version: string
}

export interface BlockInfo{
    hash: string,
    number: number
}

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

export class AkkaCommunicationNode {
    public docType?: string;
    public name: string;
    public endpoint: string;
    public org: string;
}