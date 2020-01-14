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