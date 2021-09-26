import React, { useState, useEffect, useRef } from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST'
import styles from './Shazam.module.css'
import UserListShazam from '../../Component/UserListShazam/UserListShazam'
import GET from '../../Requests/GET';
import axios from 'axios';
import SendIcon from '@material-ui/icons/Send';
import ShazamChat from '../../Component/ShazamChat/ShazamChat';
import { Redirect } from 'react-router-dom';
import gsap from 'gsap';

const Shazam = (props) => {
    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({ users: [] });
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState(null);
    const [songUrl, setSongUrl] = useState('http://h.saavncdn.com/987/cd902d048c13e5ce6ca84cc409746a5d.mp3');
    const [songList, setSongList] = useState([]);
    const [songName, setSongName] = useState('apple');
    const [text, setText] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [numberOfCorrectGuesses, setNumberOfCorrectGuesses] = useState(0);
    const [redirect, setRedirect] = useState(false);
    const roundNumber = useRef(0);

    var scrollRef = useRef(null);
    var countDown = useRef(null);
    var countDownInner = useRef(null);
    var startButton = useRef(null);
    var audioElement = useRef(null)
    var buttonGroupRef = useRef(null);
    var listenPartyRef = useRef(null);
    var timerBarRef = useRef(null);
    var betweenRound = useRef(null);
    const tl2 = useRef(null);
    const tl = useRef(null);
    const gameOverRef = useRef(null);

    useEffect(() => {
        const socket = SocketIOClient("/");
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin,
            score: 0
        }
        POST(`/joinShazam/${props.location.state.roomID}`, payload)
            .then(res => {
                console.log(res);
                setRoom(res.room);
                setUsers(res.room.users);
                socket.emit('userJoinedShazam', { users: res.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
            })

        GET('/getSongList')
            .then(res => {
                console.log(res.songList, 'UseEffect');
                setSongList(res.songList);
            })
    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username,]);
    useEffect(() => {
        if (socket) {
            socket.on('userJoinedShazam', ({ users, username }) => {
                console.log(`${username} Joined!`);
                setUsers(users);
            });
            socket.on('ShazamChatMessage', (payload) => {
                setMessages(prev => [...prev, payload])
                if (payload.userCorrectGuess === true)
                    setNumberOfCorrectGuesses(prev => { return prev + 1 });
            });
        }
    }, [socket])
    useEffect(() => {
        if (socket) {
            socket.on('ShazamStart', (number) => {
                if (songList[number]) {
                    roundNumber.current++;
                    console.log(roundNumber);
                    tl2.current = gsap.timeline({ paused: true });
                    tl.current = gsap.timeline({ paused: true });
                    betweenRound.current.style.visibility = 'hidden';
                    buttonGroupRef.current.style.visibility = 'hidden';
                    setSongUrl(songList[number].media_url);
                    setSongName(songList[number].album);
                    startButton.current.style.display = 'none';
                    countDownFunction();
                    setTimeout(() => {
                        tl2.current.to(document.getElementById('buttonContainer'), { visibility: 'hidden', display: 'none', duration: 0.1 })
                        tl2.current.to(document.getElementById('timerBar'), {
                            width: '100%', duration: 0.1, ease: "none"
                        })
                        tl2.current.play();
                        countDown.current.style.visibility = 'hidden';
                        betweenRound.current.style.visibility = 'hidden';
                        play();
                    }, 3000)
                    setTimeout(() => {
                        audioElement.current.pause();
                        betweenRound.current.style.visibility = 'visible';
                        if (isAdmin) {
                            listenPartyRef.current.style.visibility = 'visible';
                            listenPartyRef.current.style.display = 'flex';
                            if (roundNumber.current === 5) {
                                console.log('hey there')
                                socket.emit('ShazamOver')
                            }
                            else {
                                tl.current.to(document.getElementById('buttonContainer'), { visibility: 'visible', display: 'flex', duration: 0.5 })
                                tl.current.fromTo(document.getElementById('timerBar'), { width: '100%' }, {
                                    width: 0, duration: 7, ease: "none", onComplete: function () {
                                        socket.emit('ShazamStart', songList.length)
                                    }
                                })
                                tl.current.play();
                            }
                        }
                    }, 15000);
                }
            })
            socket.on('ShazamSongParty', () => {
                const audio = audioElement.current;
                audio.volume = 0.1;
                audio.play()
            })
            socket.on('ShazamOver', () => {
                gameOverRef.current.style.visibility = 'visible';
            })

            // return (socket.disconnect())
        }

    }, [isAdmin, socket, songList])
    useEffect(() => {
        if (socket)
            socket.on('returnToRoomFromleaveShazam', () => {
                socket.disconnect();
                setRedirect(true);
            })
    }, [socket])

    useEffect(() => {
        if (socket) {
            socket.on('changeShazamAdmin', ({ adminUsername }) => {
                console.log(adminUsername)
                if (username === adminUsername) {
                    setIsAdmin(true);
                }
            })
        }
    }, [socket, username]);

    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length])
    const Equality = (SongName, userGuess) => {
        let cmp = SongName.toLowerCase();
        cmp.split(' ').join('');
        cmp.replace(/[^a-zA-Z0-9]/g, '');
        let str = userGuess.toLowerCase();
        return (str === cmp);
    }
    const sendChatMessage = async () => {
        if (!text) return;
        if (Equality(songName, text)) {
            setHasGuessed(true);
            socket.emit('ShazamChatMessage', { username: username, message: text, guess: true, afterGuess: false, userCorrectGuess: true })
            setSongName('');
            const score = 100 - (numberOfCorrectGuesses * 10);

            POST(`/updateShazamScore/${props.location.state.roomID}`, { score: score, username: username })
                .then(res => {
                    console.log(res);
                    setRoom(res.room);
                    setUsers(res.room.users);
                })
        }
        else {
            if (hasGuessed)
                socket.emit('ShazamChatMessage', { username: username, message: text, guess: false, afterGuess: true, userCorrectGuess: false });
            else
                socket.emit('ShazamChatMessage', { username: username, message: text, guess: false, afterGuess: false, userCorrectGuess: false });
        }
        setText('');
    }
    const countDownFunction = () => {

        let countDownDiv = countDown.current;
        countDownInner.current.textContent = 3;
        countDownDiv.style.visibility = 'visible';
        let i = 2;
        var countdownInterval = setInterval(() => {
            if (i === 0) {
                countDown.current.style.visibility = 'hidden';
                clearInterval(countdownInterval);
            }
            countDownInner.current.textContent = i--;
        }, 1000);
    }
    const userList = users.map((m, i) => <UserListShazam user={users[i]} key={i} index={i + 1} />)
    const messageBlock = messages.map((m, i) => <ShazamChat username={m.username} message={m.message} key={i} index={i + 1} guess={m.guess} afterGuess={m.afterGuess} myUsername={username} userCorrectGuess={m.userCorrectGuess} hasGuessed={hasGuessed} />)

    const startGame = () => {
        socket.emit('ShazamStart', songList.length);
    }
    const play = () => {
        const audio = audioElement.current;
        audioElement.current.currentTime = 0;
        audio.volume = 0.1;
        audio.play()
    }
    ////REDIRECT
    const leaveShazam = () => {
        GET(`/leaveShazam/${props.location.state.roomID}`)
            .then(res => {
                console.log(res);
                if (res.code === 200) {
                    socket.emit('returnToRoomFromleaveShazam');
                }
            })
    }

    if (redirect) {
        return <Redirect
            to={{
                pathname: "/lobby",
                state: { roomID: props.location.state.roomID, username: props.location.state.username, isAdmin: isAdmin }
            }}
        />
    }
    return (
        <div className={styles.mainDiv} >
            <div className={styles.countDown} ref={countDown}>
                <div >ROUND {roundNumber.current}</div>
                <div ref={countDownInner}>3</div>
            </div>
            <div className={styles.playerListBetweenRounds} ref={betweenRound}>
                <div className={styles.playerList2}>
                    {userList}
                </div>
                <div style={{ display: 'flex' }} className={styles.buttonContainer}
                    ref={buttonGroupRef} id='buttonContainer'>
                    <div className={styles.musicPartyButton}
                        onClick={() => {

                            tl.current.pause();
                            listenPartyRef.current.style.visibility = 'hidden';
                            listenPartyRef.current.style.display = 'none';
                            socket.emit('ShazamSongParty')
                        }} ref={listenPartyRef}>
                        Have a music party!
                        <div className={styles.timerBar}
                            ref={timerBarRef} id='timerBar'>
                        </div>
                    </div>
                    <div className={styles.nextRoundButton} onClick={() => {
                        if (tl.current)
                            tl.current.pause();
                        listenPartyRef.current.style.visibility = 'hidden';
                        listenPartyRef.current.style.display = 'none';
                        betweenRound.current.style.visibility = 'hidden';
                        buttonGroupRef.current.style.visibility = 'hidden';
                        socket.emit('ShazamStart', songList.length)
                    }}> Next round??</div>
                </div>
            </div>
            <div className={styles.gameOverDiv} ref={gameOverRef}>
                <div className={styles.playerList2}>
                    {userList}
                </div>
                <div className={styles.gameOverButtonContainer}>
                    <div className={styles.goToLobby} onClick={leaveShazam}>Go to lobby.</div>
                </div>
            </div>
            <div className={styles.gamearea}>
                <div className={styles.userArea}>
                    <div className={styles.playerHeading}>
                        Players
                    </div>
                    <div className={styles.playerList}>
                        {userList}
                    </div>
                </div>

                <div className={styles.musicArea}>
                    <audio className={styles.audioElementClass} ref={audioElement} src={songUrl}>
                    </audio>
                    <div style={{ display: isAdmin ? 'flex' : 'none' }} className={styles.startButton} onClick={startGame} ref={startButton}> START</div>


                </div>

                <div className={styles.chatArea}>
                    <div className={styles.messageArea} ref={scrollRef}>
                        {messageBlock}
                    </div>
                    <div className={styles.inputArea}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Type a Message..."
                                className={styles.input}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                            />
                        </div>
                        <div><SendIcon style={{ color: '#291212', cursor: 'pointer' }} onClick={sendChatMessage} /></div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Shazam;