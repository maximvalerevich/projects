import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Split } from 'lucide-react';

const ChoiceNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`w-64 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center gap-2 rounded-t-md bg-zinc-50 px-3 py-2 border-b border-zinc-100">
                <Split className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-semibold uppercase text-zinc-500">Choice</span>
            </div>

            <div className="p-3">
                <div className="text-sm text-zinc-700 mb-2">
                    {data.label || 'Select an option...'}
                </div>
                {data.options && data.options.length > 0 ? (
                    <div className="space-y-1">
                        {data.options.map((opt: string, idx: number) => (
                            <div key={idx} className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 border border-zinc-200">
                                {opt}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-zinc-400 italic">No options defined</div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-purple-500"
            />
            {/* 
          Ideally, a choice node would have multiple source handles, one for each option.
          For this MVP, we keep a single output (or default output).
          The user would typically implement custom logic to route based on answer.
          Or we can render handles dynamically based on options. 
          Let's stick to single output for simplicity in MVP flow.
      */}
            <Handle
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-purple-500"
            />
        </div>
    );
};

export default memo(ChoiceNode);
