import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import Chat from "../../Component/Chat/Chat";
import POST from "../../Requests/POST";
import GET from "../../Requests/GET";
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
  const [degree, setDegree] = useState(180);
  const [currentUser, setCurrentUser] = useState("");
  const [wordList, setWordList] = useState([]);
  const [str, setStr] = useState("");
  const [inputWord, setInputWord] = useState("");
  const finalWinner = useRef(null);
  let winner = useRef(null);
  let ans = useRef(false);
  let myPosition = useRef(null);
  const circle = useRef(null);
  const startButton = useRef(null);
  const userArr = useRef([]);
  const timer = useRef(null);
  const currentPosition = useRef(null);
  const currentlivesChecker = useRef(null);
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
      userArr.current = res.room.users;
      res.room.users.forEach((user, i) => {
        if (user.username === props.location.state.username) {
          myPosition.current = i;
          // console.log("i1=" + i);
        }
      });
      socket.emit("userJoinedWXYZ", {
        users: res.room.users,
        username: props.location.state.username,
        roomID: props.location.state.roomID,
      });
    });

    GET("/wordList").then((res) => {
      setWordList(res.wordList);
    });
  }, [
    props.location.state.username,
    props.location.state.isAdmin,
    props.location.state.roomID,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("userJoinedWXYZ", ({ users, username }) => {
        // console.log(`${username} Joined!`);
        users.forEach((user, i) => {
          if (user.username === props.location.state.username) {
            myPosition.current = i;
            // console.log("i2=" + i);
          }
        });
        setMessages((prev) => [
          ...prev,
          { username: "SYSTEM", message: `${username} Joined!` },
        ]);
        setUsers(users);
        userArr.current = users;
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
  }, [props.location.state.username, socket, username]);

  useEffect(() => {
    if (socket && userArr.current) {
      socket.on("WXYZTurn", (res) => {
        ans.current = false;
        setCurrentUser(userArr.current[res.position].username);
        // console.log(res.position, myPosition.current, "dono");
        if (res.position === myPosition.current) {
          setMyTurn(true);
          GET("/wordStr").then((res) => {
            // console.log(res.str);
            socket.emit("WXYZstr", res.str);
          });
        }
        const livesChecker = () => {
          let i = 1;
          while (userArr.current[res.position].lives) {
            let livesCheck =
              userArr.current[(res.position + i) % userArr.current.length]
                .lives;
            if (livesCheck > 0) {
              if (
                (res.position + i) % userArr.current.length ===
                res.position
              ) {
                if (isAdmin) {
                  socket.emit("WXYZwinner", res.position);
                }
                i = -1;
              }
              break;
            } else {
              i++;
            }
          }
          if (i !== -1) return i;
          else {
            // console.log("chicken dinner");
            return -1;
          }
        };
        currentPosition.current = res.position;
        currentlivesChecker.current = livesChecker();
        if (livesChecker() !== -1) {
          timer.current = setTimeout(() => {
            if (res.position === myPosition.current) {
              socket.emit("WXYZwrongAnswerRotate", currentlivesChecker.current);
              if (!ans.current) {
                socket.emit("WXYZReduceLives", res.position);
              }
              setMyTurn(false);
              socket.emit(
                "WXYZTurn",
                (res.position + currentlivesChecker.current) %
                  userArr.current.length
              );
            }
          }, 5000);
        } else {
          setTimeout(() => {
            console.log(winner.current, "winner");
          }, 500);
        }
      });

      socket.on("WXYZReduceLives", (res) => {
        userArr.current[res.pos].lives = userArr.current[res.pos].lives - 1;
      });

      socket.on("WXYZstr", (res) => {
        setStr(res.str);
      });

      socket.on("WXYZcorrectAnswerRotate", (res) => {
        console.log(res.liveChecker, myPosition.current);
        setDegree((prev) => {
          return (
            (prev + (res.liveChecker * 360) / userArr.current.length) % 360
          );
        });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("returnToRoomFromleaveWXYZ", () => {
        socket.disconnect();
        setRedirect(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("WXYZwinner", (res) => {
        // console.log(res.winner + " return winner");
        finalWinner.current.style.visibility = "visible";
        winner.current = res.winner;
        // if (isAdmin) {
        //   const leave = setTimeout(leaveWXYZ, 5000);
        //   console.log(leave, "hello paaji");
        // }
      });
    }
  }, [socket, isAdmin]);

  useEffect(() => {
    if (socket) {
      socket.on("changeWxyzAdmin", ({ adminUsername, leftUsername }) => {
        let leftPosition = -1;
        userArr.current.forEach((user, i) => {
          if (user.username === leftUsername) {
            leftPosition = i;
          }
        });
        console.log(leftPosition);
        if (leftPosition !== -1) {
          userArr.current[leftPosition].lives = 0;
        }
        console.log("check kar raha hun");
        console.log(currentPosition.current, leftPosition);
        // if (currentPosition.current === leftPosition) {
        //   clearTimeout(timer.current);
        //   socket.emit("WXYZcorrectAnswerRotate", currentlivesChecker.current);
        //   setMyTurn(false);
        //   socket.emit(
        //     "WXYZTurn",
        //     (currentPosition.current + currentlivesChecker.current) %
        //       userArr.current.length
        //   );
        // }
        console.log(
          "uski lives zero hai bhi ya nhi",
          userArr.current[leftPosition].lives
        );
        if (
          userArr.current[currentPosition.current].username === adminUsername
        ) {
          console.log("mai admin hun", adminUsername);
          setIsAdmin(true);
        }
        const livesChecker = () => {
          let i = 1;
          while (userArr.current[leftPosition].lives) {
            let livesCheck =
              userArr.current[(leftPosition + i) % userArr.current.length]
                .lives;
            if (livesCheck > 0) {
              if (
                (leftPosition + i) % userArr.current.length ===
                leftPosition
              ) {
                if (isAdmin) {
                  socket.emit("WXYZwinner", leftPosition);
                }
                i = -1;
              }
              break;
            } else {
              i++;
            }
          }
          if (i !== -1) return i;
          else {
            // console.log("chicken dinner");
            return -1;
          }
        };
        console.log(currentPosition.current + livesChecker(), leftPosition);
        if (currentPosition.current + livesChecker() === leftPosition) {
          currentlivesChecker.current += livesChecker();
        }
      });
    }
  }, [socket, isAdmin]);

  useEffect(() => {
    setHeightCircle(circle.current.offsetWidth);
    var i = 0;
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

  // console.log(myTurn, username);

  const endTimeOutRotation = () => {
    console.log("hello");
    socket.emit("WXYZcorrectAnswerRotate", currentlivesChecker.current);
    setMyTurn(false);
    socket.emit(
      "WXYZTurn",
      (currentPosition.current + currentlivesChecker.current) %
        userArr.current.length
    );
  };

  const startGame = () => {
    socket.emit("startWXYZ");
    startButton.current.style.visibility = "hidden";
  };

  //SEARCHING THROUGH wordList Array
  const check = () => {
    var found = new Boolean();
    const wordInLowerCase = inputWord.toLowerCase();
    console.log(wordInLowerCase);
    found = wordList.find((element) => element === wordInLowerCase);

    if (found && inputWord.includes(str)) {
      ans.current = true;
      clearTimeout(timer.current);
      endTimeOutRotation();
    } else {
      ans.current = false;
    }
    setInputWord("");
  };

  const circleStyles = {
    margin: "12%",
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
    fontSize: "200",
    transform: `rotateZ(${degree}deg)`,
  };

  const leaveWXYZ = () => {
    GET(`/leaveWXYZ/${props.location.state.roomID}`).then((res) => {
      console.log(res);
      if (res.code === 200) {
        socket.emit("returnToRoomFromleaveWXYZ");
      }
    });
  };

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

  // console.log(str);
  return (
    <div className={styles.mainwxyz}>
      <div className={styles.winnerArea} ref={finalWinner}>
        <div className={styles.winner}>
          {winner.current ? userArr.current[winner.current].username : null} is
          the winner!
        </div>
        <div>
          {isAdmin && (
            <button className={styles.leaveButton} onClick={leaveWXYZ}>
              Leave Room
            </button>
          )}
        </div>
      </div>
      <div className={styles.gameArea}>
        <div className={styles.circle} ref={circle} style={circleStyles}>
          <div style={arrowStyles}>
            <div className={styles.string}>{str}</div>
            <Arrow style={arrowRotation} />
          </div>
          {userArr.current.map((i, index) => (
            <WxyzParticipant
              i={i}
              key={index}
              index={index}
              locateX={locateX}
              locateY={locateY}
            />
          ))}
        </div>
        <div className={styles.answerArea}>
          <div>
            {isAdmin && (
              <button
                className={styles.startButton}
                onClick={startGame}
                ref={startButton}
              >
                Start Game
              </button>
            )}
          </div>
          <div>
            {myTurn ? (
              <div>
                <input
                  type="text"
                  className={styles.inputWord}
                  placeholder="enter the word"
                  value={inputWord}
                  onChange={(e) => setInputWord(e.target.value)}
                ></input>
                <button onClick={check} className={styles.submitButton}>
                  Submit
                </button>
              </div>
            ) : (
              currentUser && (
                <span className={styles.userTurn}>{currentUser}'s Turn</span>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles.chatArea}>
        <Chat socket={socket} username={username} messages={messages} />
      </div>
    </div>
  );
};

export default Wxyz;
