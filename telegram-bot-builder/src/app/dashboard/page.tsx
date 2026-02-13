import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Bot, Settings } from 'lucide-react'
import CreateBotButton from './create-bot-button'
import ConnectWebhookButton from './connect-webhook-button'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: bots, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex flex-shrink-0 items-center">
                                <span className="text-xl font-bold text-gray-800">Bot Builder</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">{user.email}</span>
                            <form action="/auth/signout" method="post">
                                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">Sign out</button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="py-10">
                <header>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Dashboard</h1>
                        <CreateBotButton userId={user.id} />
                    </div>
                </header>
                <main>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {bots?.map((bot) => (
                                <div key={bot.id} className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-1 p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">{bot.name}</h3>
                                            <Bot className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500 truncate">
                                            Token: {bot.token ? '••••••••' + bot.token.slice(-4) : 'Not set'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/editor/${bot.id}`}
                                                className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            >
                                                Edit Flow
                                            </Link>
                                            <ConnectWebhookButton botId={bot.id} token={bot.token} />
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {(!bots || bots.length === 0) && (
                                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                                    <Bot className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No bots</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new Telegram bot.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
