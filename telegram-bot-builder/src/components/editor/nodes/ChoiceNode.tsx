import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Split, Trash2 } from 'lucide-react';

const ChoiceNode = ({ id, data, selected }: NodeProps) => {
    const { deleteElements } = useReactFlow();

    return (
        <div className={`w-64 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center justify-between rounded-t-lg bg-zinc-50 px-3 py-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    <Split className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-semibold uppercase text-zinc-500">Choice</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteElements({ nodes: [{ id }] });
                    }}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    title="Delete Node"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="p-3 space-y-3">
                {/* Content Blocks Preview */}
                <div className="space-y-2">
                    {data.content_blocks && data.content_blocks.length > 0 ? (
                        data.content_blocks.map((block: any) => (
                            <div key={block.id} className="text-[10px] text-zinc-600 bg-zinc-50 rounded border border-zinc-100 p-1.5 truncate">
                                <span className="font-bold uppercase text-[9px] text-zinc-400 mr-1">{block.type}:</span>
                                {block.content || block.url || 'Empty'}
                            </div>
                        ))
                    ) : (
                        <div className="text-[10px] text-zinc-400 italic">No content blocks</div>
                    )}
                </div>

                {/* Keyboard Preview */}
                {data.keyboard && data.keyboard.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 border-t border-zinc-50 pt-2">
                        {data.keyboard.map((btn: any, idx: number) => (
                            <div key={idx} className="text-[9px] text-center bg-purple-50 text-purple-600 rounded py-1 px-1 border border-purple-100 truncate">
                                {btn.text}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-[10px] text-zinc-400 italic text-center py-2 bg-zinc-50 rounded border border-dashed border-zinc-200">
                        No choices defined
                    </div>
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
