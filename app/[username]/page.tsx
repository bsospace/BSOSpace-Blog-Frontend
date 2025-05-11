import React from 'react'

export default function Profile({ params }: { params: { username: string } }) {
    // Decode the URL-encoded string and remove @ symbol if it exists
    const decodedUsername = decodeURIComponent(params.username)
    const cleanUsername = decodedUsername.startsWith('@')
        ? decodedUsername.substring(1)
        : decodedUsername

    return (
        <div>
            <h1>Hello World, I am still running!!!</h1>
            <h2>My name is {cleanUsername}</h2>
        </div>
    )
}
