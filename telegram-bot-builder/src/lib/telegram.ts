export interface TelegramButton {
    text: string;
    type: 'url' | 'node' | 'pay';
    value: string;
}

export interface TelegramContentBlock {
    id: string;
    type: 'text' | 'image' | 'video';
    content?: string;
    url?: string;
    settings?: any;
}

export class TelegramClient {
    private token: string;
    private apiUrl: string;

    constructor(token: string) {
        this.token = token;
        this.apiUrl = `https://api.telegram.org/bot${token}`;
    }

    async sendMessage(chatId: string | number, text: string, options: any = {}) {
        return this.call('sendMessage', {
            chat_id: chatId,
            text,
            ...options
        });
    }

    async sendPhoto(chatId: string | number, photo: string, options: any = {}) {
        return this.call('sendPhoto', {
            chat_id: chatId,
            photo,
            ...options
        });
    }

    async sendVideo(chatId: string | number, video: string, options: any = {}) {
        return this.call('sendVideo', {
            chat_id: chatId,
            video,
            ...options
        });
    }

    async sendInvoice(chatId: string | number, product: any, userId: string) {
        // Simplified invoice sending for demo/MVP
        return this.call('sendInvoice', {
            chat_id: chatId,
            title: product.name,
            description: product.description || 'Digital Product',
            payload: `order_${userId}_${product.id}`,
            provider_token: process.env.PAYMENT_PROVIDER_TOKEN || '',
            currency: product.currency || 'USD',
            prices: [{ label: 'Price', amount: Math.round(product.price * 100) }], // In cents
            start_parameter: 'shop'
        });
    }

    async sendContentBlocks(chatId: string | number, blocks: TelegramContentBlock[], keyboard: TelegramButton[] = []) {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const isLast = i === blocks.length - 1;

            const options: any = {};
            if (isLast && keyboard.length > 0) {
                options.reply_markup = {
                    inline_keyboard: this.mapKeyboard(keyboard)
                };
            }

            if (block.type === 'text') {
                await this.sendMessage(chatId, block.content || '', options);
            } else if (block.type === 'image') {
                await this.sendPhoto(chatId, block.url || '', options);
            } else if (block.type === 'video') {
                await this.sendVideo(chatId, block.url || '', options);
            }
        }
    }

    private mapKeyboard(buttons: TelegramButton[]) {
        // Simple logic: 2 buttons per row
        const rows: any[][] = [];
        for (let i = 0; i < buttons.length; i += 2) {
            const row = buttons.slice(i, i + 2).map(btn => {
                if (btn.type === 'url') {
                    return { text: btn.text, url: btn.value };
                } else if (btn.type === 'node') {
                    return { text: btn.text, callback_data: `node_${btn.value}` };
                } else if (btn.type === 'pay') {
                    return { text: btn.text, callback_data: `pay_${btn.value}` };
                }
                return { text: btn.text, callback_data: 'noop' };
            });
            rows.push(row);
        }
        return rows;
    }

    private async call(method: string, params: any) {
        const response = await fetch(`${this.apiUrl}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        const data = await response.json();
        if (!data.ok) {
            console.error(`Telegram API Error (${method}):`, data);
            throw new Error(data.description || 'Unknown error');
        }
        return data.result;
    }
}
