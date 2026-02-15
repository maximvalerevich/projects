import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TelegramClient } from '@/lib/telegram';

export async function POST(
    req: NextRequest,
    { params }: { params: { botId: string } }
) {
    const { botId } = params;
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

        // 2. Identify Update Type
        const message = body.message;
        const callbackQuery = body.callback_query;

        let tgUserId = '';
        let input = '';
        let callbackData = '';

        if (message) {
            tgUserId = message.from.id.toString();
            input = message.text || '';
        } else if (callbackQuery) {
            tgUserId = callbackQuery.from.id.toString();
            callbackData = callbackQuery.data || '';
        } else {
            return NextResponse.json({ ok: true }); // Ignore other types for MVP
        }

        // 3. Handle Flow Traversal
        let targetNodeId = '';

        if (input === '/start') {
            // Find start node
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
            // Fetch product and send invoice
            const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
            if (product) {
                await tg.sendInvoice(tgUserId, product, tgUserId);
            }
            return NextResponse.json({ ok: true });
        }

        // 4. Execute Node
        if (targetNodeId) {
            const { data: node } = await supabase
                .from('commands')
                .select('*')
                .eq('id', targetNodeId)
                .single();

            if (node) {
                // Interpolate variables (MVP: simple string replace)
                const contentBlocks = node.content_blocks.map((b: any) => {
                    if (b.type === 'text' && b.content) {
                        // Logic for {variable} would go here
                        return b;
                    }
                    return b;
                });

                await tg.sendContentBlocks(tgUserId, contentBlocks, node.keyboard);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
