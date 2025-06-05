import React, { useState, useEffect, useRef } from 'react';
import { API_URL, DEBUG } from '../constants'
import { io } from "socket.io-client";
import WebcamComp from '../components/webcam';
import AudioRecorder from '../components/audiorecord';

export default function Messages({ user, selChat, setSelChat }) {
    const [message, setMessage] = useState("");
    const [image, setImage] = useState(null);
    const [audio, setAudio] = useState(null);
    const [allUserChats, setAllUserChats] = useState([]);
    const [showWebcam, setShowWebcam] = useState(false);
    const [recording, setRecording] = useState(false);
    const [audioUrll, setAudioUrll] = useState(null);
    const [selChatHistory, setSelChatHistory] = useState(null);
    const [msgsLoading, setMsgsLoading] = useState(false);
    const [chatsLoading, setChatsLoading] = useState(false);
    const [paginationScroll, setPaginationScroll] = useState(false)
    const scrollBottom = useRef();
    const scrollTop = useRef();

    const socket = io((DEBUG ? 'http://localhost:8080' : 'https://cs144-su25-pranavp21.uw.r.appspot.com'), { 
        auth: {
            username: user.username,
            user_id: user._id
        },
        id: user._id
    });

    useEffect(() => {
        ((paginationScroll) ? scrollTop : scrollBottom)?.current?.scrollIntoView({ behavior: 'smooth' })
        setPaginationScroll(false);
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
            setChatsLoading(true);
            console.log("getAllChats with user:", user);
            const resp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/chats/${user._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const r = await resp.json()
            console.log("allchats:", r)
            // console.log(user)
            setChatsLoading(false);
            setAllUserChats(() => r)
        } catch(e) {
            console.log("getAllChats error:", e);
        }
    }
    useEffect(() => {
        getAllChats();
    }, [])

    const sendMessage = async () => {
        try {
            // if image != null, then add to object storage, get url, and then send that to backend
            let imageUrl = "";
            if (image) {
                const imageResp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/messages/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mediaUrl: image,
                        isImage: true,
                    })
                })
                const uploadResp = await imageResp.json();
                if (uploadResp.sucess) {
                    console.log("image was uploaded to cloud succesfully");
                    imageUrl = uploadResp.url;
                }
            }

            let audioUrl = "";
            if (audio) {
                const audioResp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/messages/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mediaUrl: audioUrll,
                        isImage: false
                    })
                })
                const uploadResp = await audioResp.json();
                if (uploadResp.sucess) {
                    console.log("Audio was uploaded to cloud successfully");
                    audioUrl = uploadResp.url;
                }
            }
            
            console.log("sending message on this chat:", selChat);
            let isMedia = "none";
            let mediaUrl = "";

            if (imageUrl !== "") {
                mediaUrl = imageUrl;
                isMedia = "image";
            } else if (audioUrl !== "") {
                mediaUrl = audioUrl;
                isMedia = "audio";
            }


            if (isMedia === "none" && message === "") return

            const resp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/messages/${selChat._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    sender: user._id,
                    receiver: selChat.participants.find(p => p._id !== user._id)._id,
                    media: mediaUrl,
                    isMedia,
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
        console.log("handleSendMsg")
        e.preventDefault();
        sendMessage();
        setMessage("");
        setShowWebcam(false);
        setImage(null);
        setRecording(false);
        setAudio(null);
        setAudioUrll(null);
    }

    const getMsgHistory = async (chatId, beforeTS, pagination = false) => {
        try {
            const resp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/messages/${chatId}/${beforeTS}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const r = await resp.json();
            console.log(`msg history with ${pagination && "pagination"}`, r);
            // console.log(chatId, beforeTS)
            setMsgsLoading(false);
            (pagination) ? setSelChatHistory(cur => [...r, ...cur]) : setSelChatHistory(() => r)
        } catch(e) {
            console.log("getMsgHistory error:", e)
        }
    }

    const markChatRead = async (chatId) => {
        try {
            const resp = await fetch(`${(DEBUG ? 'http://localhost:8080' : API_URL)}/api/chats/${chatId}/read`, {
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
        if(e) e.preventDefault();
        if (chat?._id === selChat?._id) return;
        setSelChat(chat);
        console.log("selChat", chat)
        const beforeTS = (new Date()).toISOString()
        getMsgHistory(chat._id, beforeTS);
        markChatRead(chat._id);
        // console.log("allChats", allUserChats)
    }

    const handleChatPagination = (e, chat) => {
        if(e) e.preventDefault();
        setPaginationScroll(true);
        setMsgsLoading(true);
        const beforeTS = selChatHistory?.[0]?.createdAt || (new Date()).toISOString()
        getMsgHistory(chat._id, beforeTS, true);
    }

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-100 flex flex-row overflow-hidden"
        aria-label="full screen background"
        >
            <div
            className="h-screen sm:w-1/5 w-1/3 bg-violet-100 max-h-full divide-sky-900 overflow-y-auto border-r-2 border-black flex flex-col"
            aria-label="vertical conversation selector"
            >
                <h1
                className='w-full py-[1em] text-center font-extrabold text-violet-900 border-b-2 border-black text-xs sm:text-lg'
                >
                    Your Conversations
                </h1>
                
                {(chatsLoading) ? (
                    <div
                    className='flex flex-col w-full text-center items-center mt-[2em]'
                    aria-label="chats loading"
                    >
                        <h2
                        className='text-xs sm:text-lg font-bold text-[2em]'
                        >
                            Getting your chats...
                        </h2>
                        <div className="w-[1.5em] h-[1.5em] border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : (((allUserChats.length > 0) ? (allUserChats.sort((a, b) => {
                    const A = a?.latestMessage?.createdAt || a?.createdAt;
                    const B = b?.latestMessage?.createdAt || b?.createdAt;
                    return B.localeCompare(A);
                }).map((c, i) => (
                    <button
                    className={"sm:h-[8em] h-[5em] pl-[.5em] w-full p-2 py-4 hover:bg-violet-300 flex flex-col items-center justify-content text-center transition-colors ease-linear duration-100 border-b-2 border-black "  + ((c._id === selChat?._id) ? " bg-violet-400/90": " bg-violet-200/70")}
                    key={i}
                    onClick={(e) => handleSelChat(e, c)}
                    >
                        <div
                        className='flex flex-row w-full my-auto text-center items-center justify-center sm:mr-[.4em] mr-[.2em]'
                        aria-label="conversation box text styling"
                        >
                            <div 
                            className={'sm:w-[.6em] sm:h-[.6em] w-[.4em] h-[.4em] rounded-full mr-[.5em] flex-shrink-0 transition-colors ease-linear duration-150 ' + ((!c?.latestRead?.find(l => l.user === user._id).hasRead || false) ? "bg-sky-700 animate-ping " : "bg-transparent")}
                            aria-label="blinking notification"
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
                            {
                                ((c?.latestMessage === null) ? 
                                "" : 
                                ((c?.latestMessage?.isMedia !== "none") ? 
                                "Media Attached" : 
                                c.latestMessage?.text || "Empty Message"))
                            }
                        </p>
                    </button>
                ))) : (
                    <p
                    className='m-auto font-bold w-full text-center text-2xl mt-[2em] text-nowrap overflow-hidden whitespace-nowrap truncate'
                    >
                        No conversations available
                    </p>
                )))}
            </div>
            <div
            className='h-full sm:w-4/5 w-2/3 bg-indigo-100 flex flex-col'
            aria-label="messages area"
            >   
                <div ref={scrollTop} />
                <div
                className={'flex-1 flex flex-col p-[1em] overflow-y-auto ' + ((selChatHistory) ? "bg-indigo-50" : "bg-zinc-50")}
                aria-label="scrollable messages area"
                >   
                    {(selChatHistory && selChatHistory.length > 0) && 
                    <div
                    className='flex justify-center items-center mb-[2em]'
                    aria-label="load more msgs button area"
                    >
                        {(msgsLoading) ? (
                            <div className="w-[1.5em] h-[1.5em] border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : (
                        <button
                        className='w-fit px-[1em] py-[.2em] text-sm bg-gray-300 hover:bg-gray-400/70 rounded-md border-[.1em] border-slate-800 transition-all ease-linear duration-150'
                        onClick={(e) => handleChatPagination(e, selChat)}
                        >
                            Load more messages
                        </button>)}
                    </div>}
                    {(selChatHistory && selChatHistory.length > 0) ? (selChatHistory.map((s, i) => (
                        <div
                        className='w-full flex flex-col bg-transparent my-[.5em]'
                        key={i}
                        aria-label="messages area"
                        >
                            <h1
                            className='text-lg font-extrabold'
                            >
                                {s?.sender?.username} &nbsp;&nbsp;&nbsp;&nbsp;
                                <span
                                className='font-light text-xs inline-block whitespace-normal break-words'
                                aria-label="messages date"  
                                > 
                                    {`${s?.createdAt.substring(0, 10)} ${s?.createdAt.substring(12, 19)}`} 
                                </span>
                            </h1>
                            <p
                            className={'whitespace-pre-wrap font-semibold px-[1.2em] my-[.3em] w-fit rounded-lg ' + ((s?.sender._id === user._id) ? "bg-blue-300 " : "bg-neutral-200 ") + ((s?.isMedia !== "none" && s?.text === "")  ? " py-[1.2em] " : " py-[.3em] ") + (s?.isMedia !== "none" && " pt-[1.2em]")}
                            >

                                {s?.isMedia === "image" && (
                                    <img
                                    src={s?.media}
                                    alt="Media message"
                                    className={"max-w-xs max-h-64 rounded-lg " + (s?.text !== "" && " pb-[.3em]")}
                                    />
                                )} 
                                { s?.isMedia === "audio" && (
                                    <audio
                                        controls
                                        src={s?.media}
                                        className={"max-w-xs rounded-lg " + (s?.text !== "" && " pb-[.3em]")}
                                    />
                                )}
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
                    <div ref={scrollBottom}/>
                </div>
                {selChat && 
                    <form
                    onSubmit={(e) => handleSendMsg(e)}
                    onKeyDown={(e) => {
                        if(e.key === "Enter"&& !e.shiftKey) handleSendMsg(e);
                    }}
                    className="flex items-center sm:p-[2em] p-[.5em] bg-indigo-50 overflow-x-auto space-x-[1em]"
                    aria-label="send msg form"
                    >
                        {!audio && <WebcamComp
                            image={image}
                            setImage={setImage}
                            onImageCaptured={(img) => setImage(img)}
                            showWebcam={showWebcam}
                            setShowWebcam={setShowWebcam}
                        />}
                        {!image && <AudioRecorder
                            onAudioCaptured={(audio) => {
                                if (audio === null) {
                                    setAudio(null);
                                    setAudioUrll(null);
                                    return;
                                }

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64Audio = reader.result;
                                    setAudioUrll(base64Audio);
                                };
                                reader.readAsDataURL(audio);                           
                            }}
                            recording={recording}
                            setRecording={setRecording}
                            audioBlob={audio}
                            setAudioBlob={setAudio}
                        />}
                        <textarea
                            type="text"
                            aria-label="Type a message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="h-[3em] min-w-[9em] flex-1 px-4 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 break-words leading-[2rem] resize-none"
                        />
                        <button
                            type="submit"
                            className="sm:ml-[1em] ml-[.2em] px-4 py-2 sm:text-lg text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ease-linear duration-150"
                            aria-label="send message button"
                        >
                            Send
                        </button>
                    </form>
                }
            </div>
        </div>
    )
};