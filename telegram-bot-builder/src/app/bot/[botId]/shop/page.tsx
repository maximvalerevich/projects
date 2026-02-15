'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Plus,
    ShoppingBag,
    Package,
    DollarSign,
    Trash2,
    Edit,
    Search,
    Loader2,
    Image as ImageIcon,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Tag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image_url: string;
    category: string;
    digital_content: string;
}

interface Order {
    id: string;
    tg_user_id: string;
    amount: number;
    status: 'pending' | 'paid' | 'cancelled';
    created_at: string;
    product_name?: string;
}

export default function ShopPage() {
    const params = useParams();
    const botId = params.botId as string;
    const supabase = createClient();

    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // New Product Form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        category: '',
        digital_content: '',
        image_url: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: prodData } = await supabase
            .from('products')
            .select('*')
            .eq('bot_id', botId)
            .order('created_at', { ascending: false });

        const { data: ordData } = await supabase
            .from('orders')
            .select('*, products(name)')
            .eq('bot_id', botId)
            .order('created_at', { ascending: false });

        setProducts(prodData || []);
        setOrders(ordData?.map(o => ({ ...o, product_name: o.products?.name })) || []);
        setLoading(false);
    }, [botId, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('products').insert({
            ...formData,
            bot_id: botId
        });

        if (error) {
            alert('Error creating product: ' + error.message);
        } else {
            setIsAdding(false);
            setFormData({ name: '', description: '', price: 0, currency: 'USD', category: '', digital_content: '', image_url: '' });
            fetchData();
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchData();
    };

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-3">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                        Shop Module
                    </h1>
                    <p className="text-zinc-500 text-sm">Sell digital goods and management payments directly in Telegram.</p>
                </div>
                <div className="flex bg-zinc-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'products' ? "bg-white shadow-sm text-primary" : "text-zinc-400")}
                    >
                        PRODUCTS
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'orders' ? "bg-white shadow-sm text-primary" : "text-zinc-400")}
                    >
                        ORDERS
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {activeTab === 'products' ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Inventory ({products.length})</h2>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                                >
                                    <Plus className="h-4 w-4" /> Add Product
                                </button>
                            </div>

                            {isAdding && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Product Name</label>
                                                <input required type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white"
                                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Description</label>
                                                <textarea className="w-full p-3 rounded-lg border border-zinc-200 bg-white" rows={3}
                                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Price</label>
                                                    <input required type="number" step="0.01" className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white"
                                                        value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Currency</label>
                                                    <select className="w-full h-10 px-2 rounded-lg border border-zinc-200 bg-white"
                                                        value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="XTR">Stars</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Category</label>
                                                <input type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white"
                                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Digital Content / Link</label>
                                                <input type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white"
                                                    value={formData.digital_content} onChange={e => setFormData({ ...formData, digital_content: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase">Image URL (Optional)</label>
                                                <input type="text" className="w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white"
                                                    value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                                            </div>
                                            <div className="pt-2 flex justify-end gap-3">
                                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium hover:bg-zinc-200 rounded-md transition-colors">Cancel</button>
                                                <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-all">Create Product</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map(p => (
                                    <div key={p.id} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                                        <div className="relative aspect-video bg-zinc-100 flex items-center justify-center overflow-hidden">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <Package className="h-10 w-10 text-zinc-300" />
                                            )}
                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 bg-white rounded-md border border-zinc-100 text-zinc-500 hover:text-primary transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 bg-white rounded-md border border-zinc-100 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-zinc-900 group-hover:text-primary transition-colors">{p.name}</h3>
                                                <span className="text-sm font-bold text-primary">{p.price} {p.currency}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 line-clamp-2">{p.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-2 pt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                                <Tag className="h-3 w-3" />
                                                {p.category || 'Uncategorized'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {products.length === 0 && !isAdding && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                                        <ShoppingBag className="h-10 w-10 text-zinc-300 mb-4 opacity-30" />
                                        <p className="text-sm text-zinc-500 font-medium tracking-tight">Your shop is empty.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold">Sales History</h2>
                            <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 border-b border-zinc-200">
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Order ID</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer ID</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Product</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                            <th className="text-right px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {orders.map(o => (
                                            <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-zinc-400">#{o.id.split('-')[0]}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-zinc-600">ID: {o.tg_user_id}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-zinc-900">{o.product_name || 'Deleted Product'}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-primary">{o.amount} USD</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                        o.status === 'paid' ? "bg-green-100 text-green-700" :
                                                            o.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                    )}>
                                                        {o.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> :
                                                            o.status === 'pending' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs text-zinc-400">
                                                    {new Date(o.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                                                        <ShoppingBag className="h-8 w-8 opacity-20" />
                                                        <p className="text-xs font-medium">No orders found yet.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
