'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { GitBranch, Trash2, ArrowRight } from 'lucide-react';

const ConditionNode = ({ id, data, selected }: NodeProps) => {
    const { deleteElements } = useReactFlow();

    return (
        <div className={`w-72 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
            <div className="flex items-center justify-between rounded-t-lg bg-zinc-50 px-3 py-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold uppercase text-zinc-500">Condition</span>
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

            <div className="p-4 space-y-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Verification</div>

                {data.condition ? (
                    <div className="rounded-md border border-amber-100 bg-amber-50 p-2.5 space-y-1">
                        <div className="text-xs font-medium text-amber-900 truncate">
                            If <span className="text-amber-600">{"{"}{data.condition.variable}{"}"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-amber-700">
                            <span className="font-bold uppercase">{data.condition.operator}</span>
                            <span className="truncate">"{data.condition.value}"</span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-md border border-dashed border-zinc-200 p-3 text-center">
                        <p className="text-[10px] text-zinc-400 italic text-pretty">Define logical rule in settings...</p>
                    </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-medium text-zinc-400">
                        <span className="flex items-center gap-1"><ArrowRight className="h-2.5 w-2.5 text-green-500" /> TRUE</span>
                        <span className="flex items-center gap-1 text-right">FALSE <ArrowRight className="h-2.5 w-2.5 text-red-500" /></span>
                    </div>
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !bg-zinc-400 hover:!bg-amber-500"
            />

            {/* Success Handle */}
            <Handle
                type="source"
                id="true"
                position={Position.Right}
                style={{ top: '65%', background: '#22c55e' }}
                className="!h-3 !w-3 border-none hover:scale-125 transition-transform"
            />

            {/* Failure Handle */}
            <Handle
                type="source"
                id="false"
                position={Position.Right}
                style={{ top: '85%', background: '#ef4444' }}
                className="!h-3 !w-3 border-none hover:scale-125 transition-transform"
            />
        </div>
    );
};

export default memo(ConditionNode);
