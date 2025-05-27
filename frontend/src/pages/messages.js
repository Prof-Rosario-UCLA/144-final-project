import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants'

export default function Messages({ user }) {
    const [message, setMessage] = useState("")
    const range = [...Array(100).keys()]


    const getAllChats = async() => {
        // const resp = await fetch(`${API_URL}/api/chats/...`, {
        //     headers: {
        //       Authorization: `Bearer ${token}`
        //     }
        // });
    }
    useEffect(() => {
        getAllChats();
    }, [])

    const sendMessage = () => {
        // send msg API 
    }

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-100 flex flex-row overflow-hidden"
        >
            <div
            className="h-full sm:w-1/5 w-1/3 bg-violet-200 max-h-full divide-sky-900 divide-solid divide-y-2 overflow-y-auto border-r-2 border-black"
            >
                {range.map(r => (
                    <button
                    className="sm:h-[8em] h-[5em] pl-[.5em] w-full p-2 sm:pl-[1em] hover:bg-violet-300 flex flex-col items-center text-center transition-colors ease-linear duration-100"
                    >
                        <h1
                        className="text-xs sm:text-lg font-bold mt-[.5em] sm:mt-[1em]"
                        >
                            {"Chat #"+r}
                        </h1>
                        <p
                        className="text-xs max-w-full sm:text-lg mt-[.5em] sm:mt-[1em] text-gray-600 text-nowrap overflow-hidden whitespace-nowrap truncate"
                        >
                            recent message recent message recent message recent message recent message recent message
                        </p>
                    </button>
                ))}
            </div>
            <div
            className='h-full sm:w-4/5 w-2/3 bg-indigo-100 flex flex-col-reverse'
            >
                <form
                    onSubmit={() => sendMessage()}
                    className="flex items-center sm:p-[2em] p-[.5em] bg-indigo-50"
                    >
                    <textarea
                        type="text"
                        aria-label="Type a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="h-[3em] flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 break-words leading-[1rem] resize-none"
                    />
                    <button
                        type="submit"
                        className="sm:ml-[1em] ml-[.2em] px-4 py-2 sm:text-lg text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
};