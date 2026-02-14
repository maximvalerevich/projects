'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanel';
import MessageNode from './nodes/MessageNode';
import InputNode from './nodes/InputNode';
import ChoiceNode from './nodes/ChoiceNode';
import { Loader2, Save } from 'lucide-react';

const nodeTypes = {
    message: MessageNode,
    input: InputNode,
    choice: ChoiceNode,
};

const getId = () => uuidv4();

interface FlowEditorProps {
    botId: string;
    botName: string;
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

export default function FlowEditor({ botId, botName, initialNodes = [], initialEdges = [] }: FlowEditorProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
                y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
            });
            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: {
                    label: `${type} node`,
                    content_blocks: [{ id: uuidv4(), type: 'text', content: 'Hello!' }],
                    keyboard: []
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPropertyChange = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
        setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev));
    }, [setNodes]);

    const onSave = async () => {
        if (reactFlowInstance) {
            setSaving(true);
            const flow = reactFlowInstance.toObject();

            try {
                // Relational Sync
                // 1. Delete existing for this bot
                await supabase.from('commands').delete().eq('bot_id', botId);
                await supabase.from('edges').delete().eq('bot_id', botId);

                // 2. Insert Commands (Nodes)
                const commandsToInsert = flow.nodes.map((node: Node) => ({
                    id: node.id,
                    bot_id: botId,
                    name: node.data.label || 'Unnamed Node',
                    type: node.type || 'regular',
                    content_blocks: node.data.content_blocks || [],
                    keyboard: node.data.keyboard || [],
                    coordinates: node.position
                }));

                if (commandsToInsert.length > 0) {
                    const { error: nodeError } = await supabase.from('commands').insert(commandsToInsert);
                    if (nodeError) throw nodeError;
                }

                // 3. Insert Edges
                const edgesToInsert = flow.edges.map((edge: Edge) => ({
                    bot_id: botId,
                    source_node_id: edge.source,
                    target_node_id: edge.target,
                    source_handle: edge.sourceHandle
                }));

                if (edgesToInsert.length > 0) {
                    const { error: edgeError } = await supabase.from('edges').insert(edgesToInsert);
                    if (edgeError) throw edgeError;
                }

                alert('Design saved successfully!');
            } catch (err: any) {
                console.error(err);
                alert('Error saving flow: ' + err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            {/* Header / Toolbar */}
            <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 py-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-foreground">Constructor</h1>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Draft</span>
                </div>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </button>
            </header>

            {/* Main Editor Area */}
            <div className="flex flex-1 overflow-hidden">
                <ReactFlowProvider>
                    <Sidebar />
                    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onNodeClick={onNodeClick}
                            nodeTypes={nodeTypes}
                            fitView
                        >
                            <Controls />
                            <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#E4E4E7" />
                        </ReactFlow>
                    </div>
                    <PropertiesPanel selectedNode={selectedNode} onPropertyChange={onPropertyChange} />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
