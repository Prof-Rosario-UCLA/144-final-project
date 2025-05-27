import React, { useState, useEffect } from 'react';
import { API_URL } from '../constants'

export default function Profile({ user }) {
    // console.log(user)

    return (
        <div
        className="w-full min-h-full max-h-max bg-sky-400 flex flex-row overflow-hidden"
        >
            helo {user.username}
        </div>
    )
}