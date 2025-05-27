'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


    export default function Topbar() {
        const router = useRouter();
        const [user, setUser] = useState<string | null>(null);

        useEffect(() => {
            const token = localStorage.getItem('access');
            const email = localStorage.getItem('user_email');
            if (!token) {
                router.push('/login');
            } else {
                setUser(email);
            }
        }, []);

        const handleLogout = () => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user_email');
            router.push('/login');
        };

        return (
            <header className="w-full h-16 bg-zinc-800 flex items-center justify-between px-6 text-white">
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <div className="flex items-center gap-4">
                    {user && <span className="text-sm text-gray-300">{user}</span>}
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                        Logout
                    </button>
                </div>
            </header>
        );
    }
