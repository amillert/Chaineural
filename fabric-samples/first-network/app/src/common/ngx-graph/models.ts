export interface Node{
    id: string,
    label: string
}

export interface Link{
    id: string,
    source: string,
    target: string,
    label: string
}

export interface Organization{
    id: string,
    label: string,
    childNodeIds:string[]
}

export interface Graph{
    links: Link[],
    nodes: Node[],
    clusters:Organization[]
}