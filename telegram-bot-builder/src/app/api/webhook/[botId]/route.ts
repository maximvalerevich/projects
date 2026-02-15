import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TelegramClient } from '@/lib/telegram';
import { interpolate, evaluateCondition } from '@/lib/engine';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    const { botId } = await params;
    const body = await req.json();
    const supabase = await createClient();

    try {
        // 1. Get Bot info
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('token')
            .eq('id', botId)
            .single();

        if (botError || !bot?.token) {
            return NextResponse.json({ error: 'Bot not found or missing token' }, { status: 404 });
        }

        const tg = new TelegramClient(bot.token);

        // 2. Identify Update Type and User
        const message = body.message;
        const callbackQuery = body.callback_query;

        let tgUserId = '';
        let inputText = '';
        let callbackData = '';

        if (message) {
            tgUserId = message.from.id.toString();
            inputText = message.text || '';
        } else if (callbackQuery) {
            tgUserId = callbackQuery.from.id.toString();
            callbackData = callbackQuery.data || '';
        } else {
            return NextResponse.json({ ok: true });
        }

        // 3. Fetch User Variables and State
        const [varsRes, stateRes] = await Promise.all([
            supabase.from('user_variables').select('value, variables(name), variable_id').eq('tg_user_id', tgUserId).eq('bot_id', botId),
            supabase.from('user_states').select('*').eq('tg_user_id', tgUserId).eq('bot_id', botId).single()
        ]);

        const variables: Record<string, any> = {};
        varsRes.data?.forEach((uv: any) => {
            if (uv.variables?.name) {
                variables[uv.variables.name] = uv.value;
            }
        });

        let currentState = stateRes.data;

        // 4. Handle Navigation
        let targetNodeId = '';

        if (inputText === '/start') {
            const { data: startNode } = await supabase
                .from('commands')
                .select('id')
                .eq('bot_id', botId)
                .eq('name', 'start')
                .single();
            targetNodeId = startNode?.id || '';
        } else if (callbackData.startsWith('node_')) {
            targetNodeId = callbackData.replace('node_', '');
        } else if (callbackData.startsWith('pay_')) {
            const productId = callbackData.replace('pay_', '');
            const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
            if (product) await tg.sendInvoice(tgUserId, product, tgUserId);
            return NextResponse.json({ ok: true });
        } else if (message && currentState?.is_waiting_input && currentState.current_node_id) {
            // CAPTURE INPUT
            const { data: node } = await supabase.from('commands').select('*').eq('id', currentState.current_node_id).single();
            if (node && node.type === 'input' && node.settings?.variable_name) {
                const { data: variable } = await supabase.from('variables').select('id').eq('bot_id', botId).eq('name', node.settings.variable_name).single();
                if (variable) {
                    await supabase.from('user_variables').upsert({
                        bot_id: botId,
                        tg_user_id: tgUserId,
                        variable_id: variable.id,
                        value: inputText
                    });
                    variables[node.settings.variable_name] = inputText;
                }
            }
            // Move to next node after input
            const { data: nextEdge } = await supabase.from('edges').select('target_node_id').eq('source_node_id', currentState.current_node_id).single();
            targetNodeId = nextEdge?.target_node_id || '';
        }

        // 5. Node Processor (Recursive for Logic nodes)
        const processNode = async (nodeId: string): Promise<void> => {
            const { data: node } = await supabase
                .from('commands')
                .select('*')
                .eq('id', nodeId)
                .single();

            if (!node) return;

            // Update State
            await supabase.from('user_states').upsert({
                bot_id: botId,
                tg_user_id: tgUserId,
                current_node_id: nodeId,
                is_waiting_input: node.type === 'input'
            }, { onConflict: 'bot_id, tg_user_id' });

            if (node.type === 'condition') {
                const isTrue = evaluateCondition(node.settings?.condition, variables);
                const handle = isTrue ? 'true' : 'false';

                const { data: nextEdge } = await supabase
                    .from('edges')
                    .select('target_node_id')
                    .eq('source_node_id', nodeId)
                    .eq('source_handle', handle)
                    .single();

                if (nextEdge?.target_node_id) {
                    await processNode(nextEdge.target_node_id);
                }
            } else {
                // Regular node (Message, Choice, Input)
                // 1. Interpolate text
                const finalBlocks = (node.content_blocks || []).map((b: any) => {
                    if (b.type === 'text' && b.content) {
                        return { ...b, content: interpolate(b.content, variables) };
                    }
                    return b;
                });

                // 2. Send to Telegram
                await tg.sendContentBlocks(tgUserId, finalBlocks, node.keyboard);

                // 3. Handle Autotransition
                if ((node.type === 'regular' || node.type === 'message') && node.type !== 'input') {
                    const { data: autoEdge } = await supabase
                        .from('edges')
                        .select('target_node_id')
                        .eq('source_node_id', nodeId)
                        .is('source_handle', null)
                        .single();

                    if (autoEdge?.target_node_id) {
                        await processNode(autoEdge.target_node_id);
                    }
                }
            }
        };

        if (targetNodeId) {
            await processNode(targetNodeId);
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
