import React from 'react';

export default function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-64 border-r border-zinc-200 bg-zinc-100 p-4 text-sm">
            <h3 className="mb-4 font-semibold text-zinc-900">Nodes</h3>
            <div className="space-y-2">
                <div
                    className="cursor-grab rounded border border-blue-500 bg-blue-50 p-2 hover:bg-blue-100"
                    onDragStart={(event) => onDragStart(event, 'message')}
                    draggable
                >
                    Message Node
                </div>
                <div
                    className="cursor-grab rounded border border-green-500 bg-green-50 p-2 hover:bg-green-100"
                    onDragStart={(event) => onDragStart(event, 'input')}
                    draggable
                >
                    User Input
                </div>
                <div
                    className="cursor-grab rounded border border-purple-500 bg-purple-50 p-2 hover:bg-purple-100"
                    onDragStart={(event) => onDragStart(event, 'choice')}
                    draggable
                >
                    Choice / Buttons
                </div>
                <div
                    className="cursor-grab rounded border border-orange-500 bg-orange-50 p-2 hover:bg-orange-100"
                    onDragStart={(event) => onDragStart(event, 'condition')}
                    draggable
                >
                    Condition
                </div>
            </div>
            <div className="mt-8 text-xs text-gray-400">
                Drag nodes to the canvas to build your bot logic.
            </div>
        </aside>
    );
}
