import React, { useState, useEffect } from 'react';

export default function SetUsername() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkUsername = async () => {
        setLoading(true);
        setError('');
        try {
            // check username validity
        } catch (e) {
            setError('Error checking username. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username) return;

        await checkUsername();

        if (error) return;

        try {
            // sign up new user and go to app
        } catch {
            setError('Failed to set username.');
        }
    };

    return (
        <div 
        className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4"
        >
            <h1 
            className="text-3xl font-bold mb-16 text-gray-800 text-center"
            >
                You're a new user! Please choose a username
            </h1>
            <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6"
            >
                <h2 
                className="text-xl font-semibold mb-4 text-gray-800 text-center"
                >
                    Choose a Username
                </h2>

                <form 
                onSubmit={handleSubmit} 
                aria-label="Set username form"
                >
                    <div 
                    className="mb-4"
                    >
                        <label 
                        htmlFor="username" 
                        className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={checkUsername}
                        required
                        aria-required="true"
                        aria-describedby="username-error"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ease-linear duration-200"
                        placeholder="your_username"
                        />
                        {error && (
                            <p 
                            id="username-error" 
                            className="mt-2 text-sm text-red-500"
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none rounded-md text-white font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting' : 'Set Username'}
                    </button>
                </form>
            </div>
        </div>
    );
}