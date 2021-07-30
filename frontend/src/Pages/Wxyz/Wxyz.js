import React, { useState, useEffect } from "react";
import SocketIOClient from "socket.io-client";
import POST from "../../Requests/POST";

const Wxyz = (props) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState({ users: [] });
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomID, setRoomID] = useState(null);

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
  return (
    <div>
       Wxyz
      <p>hello</p>
    </div>
  );
};

export default Wxyz;
