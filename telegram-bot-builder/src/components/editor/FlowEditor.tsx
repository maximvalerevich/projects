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

let id = 0;
const getId = () => `dndnode_${id++}`;

interface FlowEditorProps {
    botId: string;
    initialNodes?: Node[];
    initialEdges?: Edge[];
}

export default function FlowEditor({ botId, initialNodes = [], initialEdges = [] }: FlowEditorProps) {
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
                data: { label: `${type} node` },
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
        // Update selected node reference to reflect changes immediately in panel if needed
        setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev));
    }, [setNodes]);

    const onSave = async () => {
        if (reactFlowInstance) {
            setSaving(true);
            const flow = reactFlowInstance.toObject();

            const { error } = await supabase
                .from('flows')
                .upsert({
                    bot_id: botId,
                    nodes: flow.nodes,
                    edges: flow.edges,
                    updated_at: new Date().toISOString(),
                    is_published: true // Auto-publish for MVP
                }, { onConflict: 'bot_id' });

            if (error) {
                alert('Error saving flow: ' + error.message);
            } else {
                alert('Flow saved successfully!');
            }
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-white">
            {/* Header / Toolbar */}
            <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
                <h1 className="text-lg font-semibold text-zinc-900">Bot Flow Editor</h1>
                <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Flow
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
