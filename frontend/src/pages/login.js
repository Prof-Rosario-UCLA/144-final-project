import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants'

export default function Login({ onLoginSuccess }) {
    // set error if something wrong?
    const [error, setError] = useState('');

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const validateToken = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/users/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });
            
            const data = await response.json();
            
            if (data.valid) {
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('username', data.user.username);
                setIsAuthenticated(true);
                setIsLoading(false);

                if (onLoginSuccess) onLoginSuccess(data.user);
            } else {
                localStorage.removeItem('auth_token');
                setError('Session expired, login again.');
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('auth_token');
            setError('Auth error, try again.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const authError = urlParams.get('error');
        
        if (token || authError) window.history.replaceState({}, document.title, window.location.pathname);
        
        if (authError) {
            setError('Auth error, try again.');
            setIsLoading(false);
            return;
        }
        
        if (token) {
            localStorage.setItem('auth_token', token);
            validateToken(token);
            return;
        }
        
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            validateToken(storedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/api/users/auth/google`;
    };

    if (isLoading) {
        return (
            <div 
            className="min-h-screen w-screen flex flex-col items-center justify-center bg-sky-50 p-4"
            >
                <div 
                className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6 text-center"
                >
                    <h2 
                    className="text-xl font-bold mb-4 text-gray-800"
                    >
                        Verifying login...
                    </h2>
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) return null;
    
    return (
        <div 
        className="min-h-screen w-screen flex flex-col items-center justify-center bg-sky-50 p-4"
        >
            <h1 
            className="text-[4rem] font-bold mb-[1em] text-violet-900 text-center"
            >
                DoolahiChat
            </h1>
            <div 
            className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6"
            >
                <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md text-gray-700 font-medium transition ease-linear duration-200"
                >
                    { /* got this online */ }
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    Sign in with Google
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <h2
            className="text-[1.2rem] font-semibold my-[1em] text-blue-900 text-center"
            >
                By Bach & Pranav
            </h2>
        </div>
    );
};
