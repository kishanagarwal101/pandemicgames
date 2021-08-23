import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import Chat from "../../Component/Chat/Chat";
import POST from "../../Requests/POST";
import styles from "./Wxyz.module.css";
import { Redirect } from "react-router-dom";
import WxyzParticipant from "./WxyzParticipant";
import WxyzBI from "./Wxyz.jpg";
import Arrow from "@material-ui/icons/ArrowRightAlt";

const Wxyz = (props) => {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState({ users: [] });
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomID, setRoomID] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [heightCircle, setHeightCircle] = useState("");
  const [locateX, setLocateX] = useState([]);
  const [locateY, setLocateY] = useState([]);
  const [degree, setDegree] = useState("180");
  let myPosition = useRef(null);
  const circle = useRef(null);
  const startButton = useRef(null);

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
    };
    POST(`/joinWXYZ/${props.location.state.roomID}`, payload).then((res) => {
      setRoom(res.room);
      setUsers(res.room.users);
      res.room.users.forEach((user, i) => {
        if (user.username === props.location.state.username) {
          myPosition.current = i;
          console.log("i1=" + i);
        }
      });
      socket.emit("userJoinedWXYZ", {
        users: res.room.users,
        username: props.location.state.username,
        roomID: props.location.state.roomID,
      });
    });
  }, [
    props.location.state.username,
    props.location.state.isAdmin,
    props.location.state.roomID,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("userJoinedWXYZ", ({ users, username }) => {
        console.log(`${username} Joined!`);
        users.forEach((user, i) => {
          if (user.username === props.location.state.username) {
            myPosition.current = i;
            console.log("i2=" + i);
          }
        });
        setMessages((prev) => [
          ...prev,
          { username: "SYSTEM", message: `${username} Joined!` },
        ]);
        setUsers(users);
      });

      socket.on("chatMessage", (payload) =>
        setMessages((prev) => [...prev, payload])
      );

      // socket.on('returnToRoomFromWXYZ', ({ admin }) => {
      //   if (admin) {
      //       setIsAdmin(true);
      //   }
      //   setRedirect(true)
      // });
    }
  }, [socket, username]);

  useEffect(() => {
    if (socket && users.length) {
      socket.on("WXYZTurn", (res) => {
        console.log(res.position, myPosition.current, "dono");
        console.log((180 + res.position * (360 / users.length)) % 360);
        setTimeout(() => {
          setDegree((180 + res.position * (360 / users.length)) % 360);
        }, 3000);
        if (res.position === myPosition.current) {
          setMyTurn(true);
          setTimeout(() => {
            console.log("hello" + ((res.position + 1) % users.length));
            setMyTurn(false);
            socket.emit("WXYZTurn", (res.position + 1) % users.length);
          }, 3000);
        }
      });
    }
  }, [socket, users]);

  console.log(degree + "degree");

  useEffect(() => {
    setHeightCircle(circle.current.offsetWidth);
    var i = 1;
    const theta = 360 / users.length;
    const r = circle.current.offsetWidth / 2;
    setLocateX([]);
    setLocateY([]);
    while (i <= users.length) {
      const x = r - r * Math.cos((theta * i * Math.PI) / 180);
      setLocateX((prev) => {
        return [...prev, x];
      });
      const y = r - r * Math.sin((theta * i * Math.PI) / 180);
      setLocateY((prev) => {
        return [...prev, y];
      });
      i++;
    }
  }, [users]);

  // const resize=()=>{
  //   setHeightCircle(circle.current.offsetWidth);
  //   setLocateX(circle.current.offsetWidth);
  //   setLocateY(circle.current.offsetWidth/2)
  // }

  // window.onresize=resize;

  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: "/lobby",
          state: {
            roomID: props.location.state.roomID,
            username: props.location.state.username,
            isAdmin: isAdmin,
          },
        }}
      />
    );
  }

  const startGame = () => {
    socket.emit("startWXYZ");
    startButton.current.style.visibility = "hidden";
  };

  const circleStyles = {
    width: "100%",
    margin: "22%",
    height: heightCircle,
    position: "relative",
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${WxyzBI})`,
  };

  const arrowStyles = {
    position: "absolute",
    left: heightCircle / 2,
    top: heightCircle / 2,
    transform: "translate(-50%,-50%)",
    color: "black",
    background: "none",
  };

  const arrowRotation = {
    fontSize: "100",
    transform: `rotateZ(${degree}` + `deg)`,
  };

  return (
    <div className={styles.mainwxyz}>
      <div className={styles.gameArea}>
        <div className={styles.circle} ref={circle} style={circleStyles}>
          <div style={arrowStyles}>
            <Arrow style={arrowRotation} />
          </div>
          {users.map((i, index) => (
            <WxyzParticipant
              i={i}
              key={index}
              index={index}
              locateX={locateX}
              locateY={locateY}
            />
          ))}
        </div>
        <div>
          {isAdmin && (
            <button onClick={startGame} ref={startButton}>
              start game
            </button>
          )}
        </div>
      </div>
      <div className={styles.chatArea}>
        <Chat socket={socket} username={username} messages={messages} />
      </div>
    </div>
  );
};

export default Wxyz;
