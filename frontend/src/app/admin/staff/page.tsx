"use client";

import { useState } from "react";
import useSWR from "swr";
import { usersApi, User } from "@/lib/api/users";
import Button from "@/components/ui/Button";
import * as Icons from "lucide-react";
import StaffForm from "./StaffForm";
import toast from "react-hot-toast";

const fetcher = () => usersApi.getAll();

export default function StaffPage() {
    const { data: users, error, mutate } = useSWR<User[]>("users", fetcher);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Filter out ADMINs if you want, or show all. The requirement says "create Waiter and Kitchen Staff".
    // Usually admins can see other admins too.
    // Let's grouping them for better UI

    const waiters = users?.filter(u => u.role === 'WAITER') || [];
    const kitchenStaff = users?.filter(u => u.role === 'KITCHEN') || [];
    const admins = users?.filter(u => u.role === 'ADMIN') || [];

    const handleAddNew = () => {
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        mutate();
    };

    if (error) return <div>Failed to load staff</div>;
    if (!users) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-sm text-gray-700">Manage Waiters, Kitchen Staff and Admins.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Icons.PlusCircle className="mr-2 h-4 w-4" /> Add New Staff
                </Button>
            </div>

            {isFormOpen && (
                <StaffForm onClose={handleFormClose} />
            )}

            <div className="space-y-8">

                {/* Waiters Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🤵 Waiters <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">{waiters.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {waiters.map(user => (
                            <StaffCard key={user.id} user={user} icon="🤵" />
                        ))}
                        {waiters.length === 0 && <p className="text-gray-500 italic">No waiters found.</p>}
                    </div>
                </section>

                {/* Kitchen Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        👨‍🍳 Kitchen Staff <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">{kitchenStaff.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kitchenStaff.map(user => (
                            <StaffCard key={user.id} user={user} icon="👨‍🍳" />
                        ))}
                        {kitchenStaff.length === 0 && <p className="text-gray-500 italic">No kitchen staff found.</p>}
                    </div>
                </section>

                {/* Admins Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🛡️ Admins <span className="bg-gray-200 text-sm px-2 py-1 rounded-full">{admins.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {admins.map(user => (
                            <StaffCard key={user.id} user={user} icon="🛡️" />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

function StaffCard({ user, icon }: { user: User; icon: string }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex items-start justify-between">
            <div>
                <div className="font-bold text-lg flex items-center gap-2">
                    {icon} {user.name}
                </div>
                <div className="text-gray-600 text-sm">{user.email}</div>
                {user.phone && <div className="text-gray-500 text-xs mt-1">📞 {user.phone}</div>}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {user.role}
            </div>
        </div>
    );
}
