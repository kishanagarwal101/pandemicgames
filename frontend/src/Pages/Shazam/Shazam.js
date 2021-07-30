import React, { useState, useEffect } from 'react';
import SocketIOClient from 'socket.io-client';
const Shazam = (props) => {
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({ users: [] });
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState(null);

    useEffect(() => {
        const socket = SocketIOClient("/");
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);

    });
    return (
        <div>
            SHAZAM
        </div>
    );
}

export default Shazam;