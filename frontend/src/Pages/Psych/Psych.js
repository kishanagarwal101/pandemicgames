import React, {useEffect, useState} from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST';

const Psych = (props) => {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState('');
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [room, setRoom] = useState({
        users:[]
    })
    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin,
            score:0
        }
        POST(`/joinPsych/${props.location.state.roomID}`, payload)
            .then(res => {
                setRoom(res.room);
                setUsers(res.room.users);
                socket.emit('userJoinedPsych', { users: res.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
            });

    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);

    useEffect(()=>{
        if(socket){
            socket.on('userJoinedPsych', (payload) => {
                console.log(`${payload.username} Joined!`);
                setUsers(payload.users);
            });
        }
    }, [socket]);
    console.log(users);
    return ( 
        <div>
            Psych
        </div>
     );
}
 
export default Psych;