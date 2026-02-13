import { createAdminClient } from '@/utils/supabase/admin';

export default async function AdminUsersPage() {
    const supabase = createAdminClient();

    // Fetch users with pagination (default 50)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        return <div className="text-red-500">Error loading users: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900">Users</h1>

            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Last Sign In</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 bg-white">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-zinc-900">
                                    {user.email}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500">
                                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    {/* Toggle Placeholder */}
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
