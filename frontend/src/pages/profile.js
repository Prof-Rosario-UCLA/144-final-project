import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants'

export default function Profile({ user }) {
    const [username, setUsername] = useState(user.username);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('auth_token');

        if (!token) {
            return;
        }

        const resp = await fetch(`${API_URL}/api/users/username`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                newuser: username,
            })
        });
        const r = await resp.json();
        if (resp.status !== 200) {
            setError("Username already taken!");
        } else {
            window.location.reload();
            setError("");
        }
    };

    return (
        <div
        className="w-full min-h-screen max-h-max bg-violet-100 flex flex-row items-center justify-center overflow-hidden"
        >
            <div 
            className="w-full max-w-md bg-zinc-100 rounded-2xl shadow-md p-6 text-center mb-[5rem]"
            >
                <form
                onSubmit={(e) => { handleSubmit(e)}}
                className="max-w-md mx-auto p-6 bg-transparent rounded-2xl"
                >
                    <label
                        htmlFor="username"
                        className="block text-lg font-bold text-sky-700 mb-2"
                    >
                        Edit Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isSaving}
                        className={`block w-full px-4 py-3 mb-3 border ${error ? "border-red-300" : "border-sky-300"} rounded-lg bg-white placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-shadow duration-150 shadow-inner`}
                        placeholder="Enter new username"
                    />
                    {error && (
                        <p className="text-red-500 text-sm mb-3">{error}</p>
                    )}
                    <div className="flex justify-end space-x-3">
                        <button
                        type="button"
                        onClick={() => setUsername(user.username)}
                        disabled={isSaving}
                        className="px-5 py-2 bg-sky-200 hover:bg-sky-300 text-sky-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2 bg-violet-400 hover:bg-violet-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-50 transition"
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}