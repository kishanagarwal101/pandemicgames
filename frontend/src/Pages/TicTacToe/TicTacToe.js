import React, { useEffect, useState } from 'react';
import POST from './../../Requests/POST';
import SocketIOClient from 'socket.io-client';

const TicTacToe = (props) => {

    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({
        users: []
    });
    const [users, setUsers] = useState(null);
    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin
        }
        POST(`/joinTTT/${props.location.state.roomID}`, payload)
            .then(res => {
                setRoom(res.room);
                setUsers(res.room.users);
                console.log(res)
            });
    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);
    return (
        <div>TICTACTOE</div>
    );
}

export default TicTacToe;

