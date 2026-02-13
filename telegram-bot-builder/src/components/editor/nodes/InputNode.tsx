import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Keyboard } from 'lucide-react';

const InputNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`w-64 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center gap-2 rounded-t-md bg-zinc-50 px-3 py-2 border-b border-zinc-100">
                <Keyboard className="h-4 w-4 text-green-500" />
                <span className="text-xs font-semibold uppercase text-zinc-500">User Input</span>
            </div>

            <div className="p-3">
                <div className="text-sm text-zinc-700">
                    {data.label || 'Wait for user input...'}
                </div>
                <div className="mt-2 text-xs italic text-zinc-400">
                    Stores response in variable...
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-green-500"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-green-500"
            />
        </div>
    );
};

export default memo(InputNode);
