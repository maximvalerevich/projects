import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MessageSquare } from 'lucide-react';

const MessageNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`w-64 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center gap-2 rounded-t-md bg-zinc-50 px-3 py-2 border-b border-zinc-100">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold uppercase text-zinc-500">Message</span>
            </div>

            <div className="p-3">
                <div className="text-sm text-zinc-700">
                    {data.label || 'Enter message...'}
                </div>
                {data.text && (
                    <div className="mt-2 text-xs text-zinc-500 line-clamp-2">
                        {data.text}
                    </div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-blue-500"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-blue-500"
            />
        </div>
    );
};

export default memo(MessageNode);
