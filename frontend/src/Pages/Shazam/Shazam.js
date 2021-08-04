import React, { useState, useEffect, useRef } from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST'
import styles from './Shazam.module.css'
import UserListShazam from '../../Component/UserListShazam/UserListShazam'
import GET from '../../Requests/GET';
import axios from 'axios';
import SendIcon from '@material-ui/icons/Send';
import ShazamChat from '../../Component/ShazamChat/ShazamChat';
const play = () => {
    const audio = document.getElementsByClassName("audioElement")[0]
    audio.volume = 0.1;
    audio.play()

}

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
    const [text, setText] = useState('');
    const [hasGuessed, setHasGuessed] = useState(false);
    const [songName, setSongName] = useState('apple');

    let countDown = useRef(null);
    const startGame = () => {
        socket.emit('ShazamStart');
    }
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
                console.log(res);
                setSongList(res.songList);
            })
    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username,]);
    useEffect(() => {
        if (socket) {
            socket.on('userJoinedShazam', ({ users, username }) => {
                console.log(`${username} Joined!`);
                setUsers(users);
            });
            socket.on('ShazamChatMessage', (payload) => setMessages(prev => [...prev, payload]));
            socket.on('ShazamChatMessageGuessed', (payload) => {
                if (hasGuessed)
                    setMessages(prev => [...prev, payload]);
            })
            socket.on('ShazamUserCorrectGuess', (payload) => {
                setMessages(prev => [...prev, payload]);
            })
            socket.on('ShazamStart', () => {
                play();
            })
        }
    }, [socket])
    const sendChatMessage = async () => {
        if (!text) return;
        if (text === songName) {
            setHasGuessed(true);
            setMessages(prev => [...prev, { username: username, message: text, guess: true, afterGuess: false }])
            socket.emit('ShazamUserCorrectGuess', { username: username, message: text, guess: false, afterGuess: true, userCorrectGuess: true })
        }
        else {
            if (hasGuessed)
                socket.emit('ShazamChatMessageGuessed', { username: username, message: text, guess: false, afterGuess: true, userCorrectGuess: false });
            else
                socket.emit('ShazamChatMessage', { username: username, message: text, guess: false, afterGuess: false, userCorrectGuess: false });
        }
        setText('');
    }

    const userList = users.map((m, i) => <UserListShazam user={users[i]} key={i} index={i + 1} />)
    const messageBlock = messages.map((m, i) => <ShazamChat username={m.username} message={m.message} key={i} index={i + 1} guess={m.guess} afterGuess={m.afterGuess} myUsername={username} userCorrectGuess={m.userCorrectGuess} />)

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
                    <audio className="audioElement">
                        <source src={songUrl}></source>
                    </audio>
                    <div style={{ width: '70%', height: '40px', backgroundColor: 'beige' }}
                        onClick={play}> </div>
                    <div style={{ display: isAdmin ? 'flex' : 'none' }} className={styles.startButton} onClick={startGame}> START</div>
                </div>
                <div className={styles.chatArea}>
                    <div className={styles.messageArea}>
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
                        <div><SendIcon style={{ color: '#291212', cursor: 'pointer' }} /></div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Shazam;