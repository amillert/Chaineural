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
