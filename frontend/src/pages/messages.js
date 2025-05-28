import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../constants'
import { io } from "socket.io-client";

export default function Messages({ user, selChat, setSelChat }) {
    const [message, setMessage] = useState("");
    const [allUserChats, setAllUserChats] = useState([]);
    const [chatHistories, setChatHistories] = useState({})
    // const [selChat, setSelChat] = useState([]);
    const [selChatHistory, setSelChatHistory] = useState(null);
    const [newMsgs, setNewMsgs] = useState([]);
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
        if (!selChat) return
        const beforeTS = (new Date()).toISOString()
        getMsgHistory(selChat._id, beforeTS)
    }, [])

    socket.on("private message", ({ content }) => {
        console.log("message emitted to socket room:", content)
        if(content?.sender?._id === user._id) return;
        // received from the current selected chat

        if(!allUserChats.map(c => c._id).includes(content?.chat)) {
            console.log("new message from new user! filling in new chat")
            getAllChats();
        }

        if(selChat?.participants.find(p => p._id === content?.sender?._id) !== undefined) {
            console.log("gotten from in sel'd chat:", content?.sender)
            setSelChatHistory([...selChatHistory, content])
            setAllUserChats(cur => cur.map(c => c._id === selChat?._id ? ({
                ...c, 
                latestMessage: content
            }) : c))
            markChatRead(selChat?._id)
        } else {
            console.log("new msg not in sel'd from", content?.sender)
            setAllUserChats(cur => cur.map(c => c._id === content?.chat ? ({
                ...c, 
                latestMessage: content,
                latestRead: c.latestRead.map(l => l.user === user._id ? {
                    user: l.user,
                    hasRead: false
                } : l)
            }) : c))

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
            setAllUserChats(() => r)
        } catch(e) {
            console.log("getAllChats error:", e)
        }
    }
    useEffect(() => {
        getAllChats();
    }, [])

    const sendMessage = async () => {
        try {
            console.log("sending message on this chat:", selChat)
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
            console.log("sendMessage resp:", r)
            // console.log(user)
            setSelChatHistory([...selChatHistory, r?.message]);
            setAllUserChats(cur => cur.map(c => c._id === r?.chat?._id ? r?.chat : c))

            socket.emit("private message", {
                content: r?.message,
                to: selChat.participants.find(p => p._id !== user._id)._id
            });
        } catch(e) {
            console.log("sendMessage error:", e)
        }
    }

    const handleSendMsg = (e) => {
        e.preventDefault();
        sendMessage();
        setAllUserChats([...moveToTop(allUserChats, selChat?._id)]);
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
            console.log("getMsgHistory error:", e)
        }
    }

    const markChatRead = async (chatId) => {
        try {
            const resp = await fetch(`${API_URL}/api/chats/${chatId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id
                })
            });
            const r = await resp.json()
            console.log("marked chat read", r)
            // console.log(chatId, beforeTS)
            setAllUserChats(cur => cur.map(c => c._id === r?._id ? r : c))
        } catch(e) {
            console.log("markChatRead error:", e)
        }
    }

    const handleSelChat = (e, chat) => {
        setNewMsgs([...newMsgs.filter(m => m !== chat._id)])
        if(e) e.preventDefault();
        setSelChat(chat);
        console.log("selChat", chat)
        const beforeTS = (new Date()).toISOString()
        getMsgHistory(chat._id, beforeTS);
        markChatRead(chat._id);
        // console.log("allChats", allUserChats)
    }

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-100 flex flex-row overflow-hidden"
        >
            <div
            className="h-screen sm:w-1/5 w-1/3 bg-violet-100 max-h-full divide-sky-900 overflow-y-auto border-r-2 border-black flex flex-col"
            >
                <h1
                className='w-full py-[1em] text-center font-extrabold text-violet-900 border-b-2 border-black text-xs sm:text-lg'
                >
                    Your Conversations
                </h1>
                
                {((allUserChats.length > 0) ? (allUserChats.sort((a, b) => {
                    const A = a.latestMessage.createdAt;
                    const B = b.latestMessage.createdAt;
                  
                    const aIsNull = A == null;
                    const bIsNull = B == null;
                    if (aIsNull && !bIsNull) return -1;
                    if (!aIsNull && bIsNull) return 1;
                    if (aIsNull && bIsNull) return 0;
                  
                    return B.localeCompare(A);
                }).map((c, i) => (
                    <button
                    className={"sm:h-[8em] h-[5em] pl-[.5em] w-full p-2 py-4 hover:bg-violet-300 flex flex-col items-center justify-content text-center transition-colors ease-linear duration-100 border-b-2 border-black "  + ((c._id === selChat?._id) ? " bg-fuchsia-200": " bg-violet-200")}
                    key={i}
                    onClick={(e) => handleSelChat(e, c)}
                    >
                        <div
                        className='flex flex-row w-full my-auto text-center items-center justify-center sm:mr-[.4em] mr-[.2em]'
                        >
                            <div 
                            className={'sm:w-[.8em] sm:h-[.8em] w-[.4em] h-[.4em] rounded-full mr-[.5em] flex-shrink-0 transition-colors ease-linear duration-150 ' + ((!c?.latestRead?.find(l => l.user === user._id).hasRead || false) ? "bg-sky-700" : "bg-transparent")}
                            />
                            <h1
                            className="text-xs sm:text-lg md:text-xl font-bold text-nowrap text-center overflow-hidden whitespace-nowrap truncate"// mt-[.5em] sm:mt-[1em]"
                            >
                                {c.participants.find(p => p._id !== user._id).username}
                            </h1>
                        </div>
                        <p
                        className={"text-xs max-w-full sm:text-md md:text-lg text-gray-600 text-nowrap overflow-hidden whitespace-nowrap truncate transition-all ease-linear duration-150 " + ((!c?.latestRead?.find(l => l.user === user._id).hasRead || false) ? "font-extrabold" : "font-medium")}
                        >
                            {c.latestMessage?.text || ""}
                        </p>
                    </button>
                ))) : (
                    <p
                    className='m-auto font-bold w-full text-center text-2xl mt-[2em] text-nowrap overflow-hidden whitespace-nowrap truncate'
                    >
                        No conversations available
                    </p>
                ))}
            </div>
            <div
            className='h-full sm:w-4/5 w-2/3 bg-indigo-100 flex flex-col'
            >   
                <div
                className={'flex-1 flex flex-col p-[1em] overflow-y-auto ' + ((selChatHistory) ? "bg-indigo-50" : "bg-zinc-50")}
                >
                    {(selChatHistory && selChatHistory.length > 0) ? (selChatHistory.map((s, i) => (
                        <div
                        className='w-full flex flex-col bg-transparent my-[.5em]'
                        key={i}
                        >
                            <h1
                            className='text-lg font-extrabold'
                            >
                                {s?.sender?.username} &nbsp;&nbsp;
                                <span
                                className='font-light text-xs inline-block whitespace-normal break-words'
                                > 
                                    {`${s?.createdAt.substring(0, 10)} ${s?.createdAt.substring(12, 19)}`} 
                                </span>
                            </h1>
                            <p
                            className={'whitespace-pre-wrap px-[1.2em] py-[.3em] my-[.3em] w-fit rounded-lg ' + ((s?.sender._id === user._id) ? "bg-blue-300" : "bg-neutral-200")}
                            >
                                {s?.text}
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
                    onKeyDown={(e) => {
                        if(e.key === "Enter"&& !e.shiftKey) handleSendMsg(e);
                    }}
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