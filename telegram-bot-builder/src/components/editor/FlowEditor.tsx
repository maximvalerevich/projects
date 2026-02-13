'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    Connection,
    Edge,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';
import PropertiesPanel from './PropertiesPanel';
import { v4 as uuidv4 } from 'uuid';

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start Node' },
        position: { x: 250, y: 5 },
    },
];

const FlowEditor = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: uuidv4(),
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onSave = useCallback(async () => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            console.log('Saving flow:', flow);
            alert('Check console for flow object. In a real app, this would save to Supabase.');
        }
    }, [reactFlowInstance]);

    return (
        <div className="flex h-screen w-full flex-row">
            <ReactFlowProvider>
                <Sidebar />
                <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={onSave}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 shadow-md"
                        >
                            Save Flow
                        </button>
                    </div>
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
                        onPaneClick={onPaneClick}
                        fitView
                    >
                        <Controls />
                        <Background />
                        <MiniMap />
                    </ReactFlow>
                </div>
                <PropertiesPanel selectedNode={selectedNode} setNodes={setNodes as any} />
            </ReactFlowProvider>
        </div>
    );
};

export default FlowEditor;
