import React, { useState, useEffect, useRef } from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST'
import styles from './Shazam.module.css'
import UserListShazam from '../../Component/UserListShazam/UserListShazam'
import GET from '../../Requests/GET';
import axios from 'axios';
import SendIcon from '@material-ui/icons/Send';
import ShazamChat from '../../Component/ShazamChat/ShazamChat';
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

    const scrollRef = useRef(null);
    let countDown = useRef(null);
    let startButton = useRef(null);
    let audioElement = useRef(null)
    let buttonGroup = useRef(null);
    let listenPartyRef = useRef(null);
    let timerBarRef = useRef(null);
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
                    setSongUrl(songList[number].media_url);
                    setSongName(songList[number].album);
                    startButton.current.style.display = 'none';
                    countDownFunction();
                    setTimeout(() => {
                        var tl2 = gsap.timeline({ paused: true });
                        tl2.to(buttonGroup, { visibility: 'hidden', display: 'none', duration: 0.5 })
                        countDown.current.style.visibility = 'hidden';
                        play();
                    }, 3100)
                    setTimeout(() => {
                        audioElement.current.pause();
                        audioElement.current.currentTime = 0;
                        if (isAdmin) {
                            var tl = gsap.timeline({ paused: true });
                            tl.to(buttonGroup, { visibility: 'visible', display: 'flex', duration: 0.5 })
                            tl.to(timerBarRef, { width: 0, duration: 5 })
                            tl.play();
                        }
                    }, 13000);
                }
            })
            socket.on('ShazamNextRound', (number) => {

            })
        }
    }, [socket, songList])
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
        console.log(songName);
        if (Equality(songName, text)) {
            setHasGuessed(true);
            socket.emit('ShazamChatMessage', { username: username, message: text, guess: true, afterGuess: false, userCorrectGuess: true })
            setSongName('');
            const score = 100 - (numberOfCorrectGuesses * 10);
            console.log(score, 'SCORE');
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
        countDownDiv.textContent = 3;
        countDownDiv.style.visibility = 'visible';
        let i = 2;
        var countdownInterval = setInterval(() => {
            if (i === 0) {
                countDown.current.style.visibility = 'hidden';
                clearInterval(countdownInterval);
            }
            countDownDiv.textContent = i--;
        }, 1000);
    }
    const userList = users.map((m, i) => <UserListShazam user={users[i]} key={i} index={i + 1} />)
    const messageBlock = messages.map((m, i) => <ShazamChat username={m.username} message={m.message} key={i} index={i + 1} guess={m.guess} afterGuess={m.afterGuess} myUsername={username} userCorrectGuess={m.userCorrectGuess} hasGuessed={hasGuessed} />)

    const startGame = () => {
        socket.emit('ShazamStart', songList.length);
    }
    const play = () => {
        const audio = audioElement.current;
        console.log(audio, "AUDIO");
        audio.volume = 0.1;
        audio.play()
    }
    console.log(numberOfCorrectGuesses);
    return (
        <div className={styles.mainDiv} >
            <div className={styles.countDown} ref={countDown}>
                3
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
                    <audio ref={audioElement} src={songUrl}>
                    </audio>
                    <div style={{ display: isAdmin ? 'none' : 'none' }} className={styles.startButton} onClick={startGame} ref={startButton}> START</div>

                    <div style={{ display: 'flex' }} className={styles.buttonContainer} ref={(e) => buttonGroup = e}>
                        <div className={styles.musicPartyButton} onClick={''} ref={listenPartyRef}>
                            Have a music party!
                            <div style={{ width: '100%' }} className={styles.timerBar}
                                ref={(e) => timerBarRef = e}>
                            </div>
                        </div>
                        <div className={styles.nextRoundButton} onClick={() => socket.emit('ShazamStart', songList.length)}> Next round??</div>
                    </div>

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