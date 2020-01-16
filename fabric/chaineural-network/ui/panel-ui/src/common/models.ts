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


export class Epoch {
    public docType?: string;
    public epochName: string;
    public valid: boolean;
    public loss: number;
}

export interface ContractEvent {
    peer: string;
    org: string;
    event_name: string;
    tx_id: string;
    payload: string;
    block_num: string;
    status: string;
    byOrg?:string;
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