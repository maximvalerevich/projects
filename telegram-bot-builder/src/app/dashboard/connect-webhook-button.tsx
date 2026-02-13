'use client'

import { useState } from 'react'
import { Loader2, Link as LinkIcon } from 'lucide-react'

export default function ConnectWebhookButton({ botId, token }: { botId: string, token: string }) {
    const [loading, setLoading] = useState(false)

    const handleConnect = async () => {
        if (!token) {
            alert("Bot token is missing. Cannot connect webhook.")
            return
        }

        setLoading(true)
        try {
            const webhookUrl = `${window.location.origin}/api/webhook/${botId}`
            const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`

            // We call this directly from client? Or via a proxy route?
            // Calling directly avoids exposing token to our backend logs if we want, but exposing it in URL is same risk.
            // User request said: "This button should trigger a function that calls https://api.telegram.org/bot{token}/setWebhook?url={current_app_url}/api/webhook/{bot_id}."

            // Browsers might block cross-origin requests to Telegram API if not handled correctly, but Telegram API usually allows CORS?
            // Actually, Telegram SetWebhook response is JSON. It supports CORS? 
            // Best practice: Do it via server action or API route to hide token? 
            // But user provided token in the UI anyway.
            // Let's try direct call first as requested explicitly.

            const response = await fetch(telegramUrl)
            const data = await response.json()

            if (data.ok) {
                alert('Webhook connected successfully!')
            } else {
                alert('Failed to connect webhook: ' + data.description)
            }
        } catch (error) {
            alert('Error connecting webhook: ' + error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            title="Connect Webhook to Telegram"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
                <LinkIcon className="h-4 w-4 text-gray-500" />
            )}
            <span className="ml-2">Connect</span>
        </button>
    )
}
