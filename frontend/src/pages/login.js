import React, { useState, useEffect } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // set error if email-pw not right
    const [error, setError] = useState('');
    const inputFormTailwind = "mt-1 block w-full px-3 py-2 border border-gray-300 \
                            rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 \
                            focus:ring-blue-500 focus:border-blue-500 transition-all ease-linear duration-200";

    const handleSubmit = (e) => {
        e.preventDefault();
        // auth? 
    };

    return (
        <div 
        className="min-h-screen w-screen flex flex-col items-center justify-center bg-sky-50 p-4"
        >
            <h1 
            className="text-[4rem] font-bold mb-16 text-violet-900 text-center"
            >
                Company Name
            </h1>
            <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6"
            >
                <h1 
                className="text-2xl font-bold mb-4 text-gray-800 text-center"
                >
                    Sign In/Up with Google:
                </h1>

                {/* Sign in with google button instead */}
                <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md text-white font-semibold transition ease-in-out duration-200"
                >
                    We didn't implement Google SSO yet
                </button>
            </div>
        </div>
    );
};
