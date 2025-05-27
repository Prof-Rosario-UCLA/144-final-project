import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../constants'
import { io } from "socket.io-client";

export default function Messages({ user, selChat, setSelChat }) {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]);
    const [chatHistories, setChatHistories] = useState({})
    // const [selChat, setSelChat] = useState([]);
    const [selChatHistory, setSelChatHistory] = useState(null);
    const scrollBottom = useRef();
    const moveToTop = (list, key) => {
        const obj = list.find(item => item._id === key);
        if (!obj) return list;
        return [obj, ...list.filter(item => item._id !== key)];
      }
    const socket = io("http://localhost:3002/", { 
        auth: {
            username: user.username,
            user_id: user._id
        },
        id: user._id
    });

    useEffect(() => {
        scrollBottom?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [selChatHistory])

    useEffect(() => {
        socket.connect();
        socket.onAny((event, ...args) => {
            console.log(event, args);
        });
    }, [socket])

    useEffect(() => {
        handleSelChat("", selChat)
    }, [])

    socket.on("private message", ({content, from, fromUser}) => {
        console.log("message emitted to socket room:", content)
        if(from === user._id) return;
        const newMsg = {
            sender: {
                _id: from,
                username: fromUser
            },
            receiver: user._id,
            text: content,
            createdAt: (new Date()).toISOString()
        }
        if(selChat.participants.find(p => p._id === from) !== undefined) {
            // console.log("gotten from", fromUser)
            setSelChatHistory([...selChatHistory, newMsg])
            setChats([...moveToTop(chats, selChat?._id)]);
        } else {
            // new msg functionality -- TBD
        }
    })

    const getAllChats = async() => {
        try {
            const resp = await fetch(`${API_URL}/api/chats/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const r = await resp.json()
            // console.log(r)
            // console.log(user)
            setChats(() => r)
        } catch(e) {
            console.log("getAllChats error:", e)
        }
    }
    useEffect(() => {
        getAllChats();
    }, [])

    const sendMessage = async () => {
        try {
            console.log(selChat)
            const resp = await fetch(`${API_URL}/api/messages/${selChat._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    sender: user._id,
                    receiver: selChat.participants.find(p => p._id !== user._id)._id
                })
            });
            const r = await resp.json()
            console.log(r)
            // console.log(user)
            setSelChatHistory([...selChatHistory, {
                chat: selChat._id,
                sender: user,
                text: message,
                createdAt: (new Date()).toISOString()
                // media will be done later
            }]);

            socket.emit("private message", {
                content: message,
                to: selChat.participants.find(p => p._id !== user._id)._id
            });
        } catch(e) {
            console.log("getAllChats error:", e)
        }
    }

    const handleSendMsg = (e) => {
        e.preventDefault();
        sendMessage();
        setChats([...moveToTop(chats, selChat?._id)]);
        setMessage("");
    }

    const getMsgHistory = async (chatId, beforeTS) => {
        try {
            const resp = await fetch(`${API_URL}/api/messages/${chatId}/${beforeTS}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const r = await resp.json()
            console.log("msg history with", r)
            // console.log(chatId, beforeTS)
            setSelChatHistory(() => r)
        } catch(e) {
            console.log("getAllChats error:", e)
        }
    }

    const handleSelChat = (e, chat) => {
        if(e) e.preventDefault();
        setSelChat(chat);
        console.log("selChat", chat._id)
        const beforeTS = (new Date()).toISOString()
        getMsgHistory(chat._id, beforeTS)
    }

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-100 flex flex-row overflow-hidden"
        >
            <div
            className="h-screen sm:w-1/5 w-1/3 bg-violet-100 max-h-full divide-sky-900 overflow-y-auto border-r-2 border-black flex flex-col"
            >
                {((chats.length > 0) ? (chats.map((c, i) => (
                    <button
                    className={"sm:h-[8em] h-[5em] pl-[.5em] w-full p-2 sm:pl-[1em] bg-violet-200 hover:bg-violet-300 flex flex-col items-center text-center transition-colors ease-linear duration-100 border-b-2 border-black"  + ((c._id === selChat?._id) ? " bg-fuchsia-300": " ")}
                    key={i}
                    onClick={(e) => handleSelChat(e, c)}
                    >
                        <h1
                        className="text-xs sm:text-lg font-bold mt-[.5em] sm:mt-[1em]"
                        >
                            {c.participants.find(p => p._id !== user._id).username}
                        </h1>
                        <p
                        className="text-xs max-w-full sm:text-lg mt-[.5em] sm:mt-[1em] text-gray-600 text-nowrap overflow-hidden whitespace-nowrap truncate"
                        >
                            {/* {selChatHistory[selChatHistory.length-1]?.text might scrap this idea later} */}
                            {/* Will prob use this to do new message notif instead */}
                        </p>
                    </button>
                ))) : (
                    <p
                    className='m-auto font-bold w-full text-center text-2xl mt-[2em]'
                    >
                        No chats here
                    </p>
                ))}
            </div>
            <div
            className='h-full sm:w-4/5 w-2/3 bg-indigo-100 flex flex-col'
            >   
                <div
                className='flex-1 flex flex-col bg-red-100 p-[1em] overflow-y-auto'
                >
                    {(selChatHistory && selChatHistory.length > 0) ? (selChatHistory.map((s, i) => (
                        <div
                        className='w-full flex flex-col bg-transparent my-[.5em]'
                        key={i}
                        >
                            <h1
                            className='text-lg font-extrabold'
                            >
                                {s?.sender?.username}
                            </h1>
                            <p
                            className='whitespace-pre-wrap pl-[.5em]'
                            >
                                {s.text}
                            </p>
                        </div>
                    ))) : (
                        (selChatHistory) ? (
                            <p
                            className='m-auto font-bold w-full text-center text-2xl mt-[2em]'
                            >
                                This chat's empty. Send a message!
                            </p>
                        ) : (
                            <p
                            className='m-auto font-bold w-full text-center text-2xl mt-[2em]'
                            >
                                No conversation selected. Click on one to get started!
                            </p>
                        ))}
                    <div 
                    ref={scrollBottom}
                    />
                </div>
                <form
                    onSubmit={(e) => handleSendMsg(e)}
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