import React, { useState, useEffect } from "react";
import SocketIOClient from "socket.io-client";
import Chat from "../../Component/Chat/Chat";
import POST from "../../Requests/POST";
import styles from "./Wxyz.module.css";
import { Redirect } from 'react-router-dom';

const Wxyz = (props) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState({ users: [] });
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomID, setRoomID] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const socket = SocketIOClient("/");
    setSocket(socket);
    setUsername(props.location.state.username);
    setIsAdmin(props.location.state.isAdmin);
    setRoomID(props.location.state.roomID);
    const payload = {
      username: props.location.state.username,
      isAdmin: props.location.state.isAdmin,
      lives: 3,
  }
  POST(`/joinWXYZ/${props.location.state.roomID}`, payload)
      .then(res => {
          setRoom(res.room);
          setUsers(res.room.users);
          socket.emit('userJoinedWXYZ', { users: res.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
      });
  }, [
    props.location.state.username,
    props.location.state.isAdmin,
    props.location.state.roomID,
  ]);

  useEffect(() => {
    if (socket) {
        socket.on('userJoinedWXYZ', ({ users, username }) => {
            console.log(`${username} Joined!`);
            setMessages(prev => [...prev, { username: 'SYSTEM', message: `${username} Joined!` }]);
            setUsers(users);
        });

        socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));

        socket.on('returnToRoomFromWXYZ', ({ admin }) => {
          if (admin) {
              setIsAdmin(true);
          }
          setRedirect(true)
        });
      }
    },[socket,username]);



  if (redirect) {
    return <Redirect
        to={{
            pathname: "/lobby",
            state: { roomID: props.location.state.roomID, username: props.location.state.username, isAdmin: isAdmin }
        }}
    />
  }
  

  return (
    <div>
      <div className={styles.chatArea}>
        <Chat socket={socket} username={username} messages={messages} />
      </div>
    </div>
  );
};

export default Wxyz;
