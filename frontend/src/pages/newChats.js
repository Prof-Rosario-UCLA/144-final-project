import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants'

export default function FindNewChats({ user }) {
    const [query, setQuery] = useState("")
    const range = [...Array(100).keys()]

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-200 flex flex-row overflow-hidden"
        >
            <div
            className="h-screen sm:w-1/2 w-full m-auto bg-transparent flex flex-col items-center p-[2em]"
            >
                <div 
                className="w-full sm:max-w-lg bg-zinc-100 rounded-2xl shadow-md sm:p-[1em] p-[.5em] text-center"
                >
                    <h2 
                    className="sm:text-xl text-md font-bold sm:mb-[1em] mb-[.5em] text-gray-800"
                    >
                        Search for other Users
                    </h2>
                    <form
                    onSubmit={() => {}}
                    className="flex items-center"
                    >
                        <input
                            type="text"
                            aria-label="Search for Friends"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="sm:h-[3em] h-[2em] sm:w-3/4 w-1/2 flex-1 px-4 sm:py-1 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                        <button
                            type="submit"
                            className="sm:ml-[1em] ml-[.2em] sm:px-4 sm:py-2 p-[.5em] sm:text-lg text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </form>
                    {/* <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div> */}
                </div>
                <div
                className="flex-1 w-full m-[1em] sm:mb-[4em] mb-[12em] overflow-y-auto sm:px-[3em] px-[.5em] sm:pt-[1em] pt-[.5em] rounded-xl border-slate-100 sm:border-[.3em] border-[.1em]"
                >   
                    {range.map(r => (
                        <button
                        className="sm:h-[5em] h-[3em] w-full py-2 sm:px-[5em] px-[1em] bg-zinc-100 flex items-center text-center flex-row rounded-full mb-[1em] shadow-md" 
                        >
                            <p
                            className="text-xs sm:text-lg font-bold"
                            >
                                {"Chat #"+r}
                            </p>
                            <div
                            className="rounded-full bg-green-500 hover:bg-green-700 p-2 flex items center justify-center cursor-pointer ml-auto transition-colors ease-linear duration-200"
                            >
                                <p
                                className="font-bold sm:text-lg text-xs"
                                >
                                    ADD
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}