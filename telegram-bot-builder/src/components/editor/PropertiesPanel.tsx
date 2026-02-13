import React, { useEffect, useState } from 'react';

type PropertiesPanelProps = {
    selectedNode: any | null; // React Flow Node
    onPropertyChange: (nodeId: string, newData: any) => void;
};

export default function PropertiesPanel({ selectedNode, onPropertyChange }: PropertiesPanelProps) {
    const [label, setLabel] = useState('');
    const [text, setText] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || '');
            setText(selectedNode.data.text || '');
        }
    }, [selectedNode]);

    const updateNodeData = (key: string, value: any) => {
        if (selectedNode) {
            onPropertyChange(selectedNode.id, { [key]: value });
        }
    };

    if (!selectedNode) {
        return (
            <aside className="w-64 border-l border-zinc-200 bg-zinc-100 p-4 text-sm">
                <div className="text-zinc-500">Select a node to edit properties.</div>
            </aside>
        );
    }

    return (
        <aside className="w-64 border-l border-zinc-200 bg-zinc-100 p-4 text-sm">
            <h3 className="mb-4 font-semibold text-zinc-900">Properties</h3>

            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500">Label</label>
                <input
                    type="text"
                    className="mt-1 w-full rounded border border-gray-300 p-2"
                    value={label}
                    onChange={(evt) => {
                        setLabel(evt.target.value);
                        updateNodeData('label', evt.target.value);
                    }}
                />
            </div>

            <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500">Text Content</label>
                <textarea
                    className="mt-1 w-full rounded border border-gray-300 p-2"
                    rows={4}
                    value={text}
                    onChange={(evt) => {
                        setText(evt.target.value);
                        updateNodeData('text', evt.target.value);
                    }}
                />
            </div>

            <div className="text-xs text-gray-400">
                Node: {selectedNode.type} <br />
                ID: {selectedNode.id}
            </div>
        </aside>
    );
}
