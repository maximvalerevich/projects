export type Bot = {
    id: string
    user_id: string
    name: string
    token: string
    created_at: string
}

export type Flow = {
    id: string
    bot_id: string
    nodes: any[] // React Flow nodes
    edges: any[] // React Flow edges
    updated_at: string
    is_published: boolean
}

export type NodeData = {
    label: string
    text?: string // For message nodes
    options?: string[] // For choice nodes
}
