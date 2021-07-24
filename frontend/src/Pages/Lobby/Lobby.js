import React, { useEffect, useState, useRef } from 'react';
import POST from './../../Requests/POST';
import SocketIOClient from 'socket.io-client';
import styles from './Lobby.module.css'
import MenuIcon from '@material-ui/icons/Menu';
import { gsap } from 'gsap'
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import BGIMAGE from './lobbyBackground.png';
import Chat from '../../Component/Chat/Chat';
import { Button } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { toast } from 'react-toastify'
import UserBlock from './../../Component/UserBlock/UserBlock';
const Lobby = (props) => {
    const [roomID, setRoomID] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState({});
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    let mainRef = useRef(null);
    let drawerRef = useRef(null);

    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin
        }
        POST(`/joinRoom/${props.location.state.roomID}`, payload)
            .then(response => {
                //if (!response) window.location = "/";
                if (response.code === 200) {
                    setRoom(response.room);
                    setUsers(response.room.users);
                    socket.emit('userJoined', { users: response.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
                } else {
                    window.location = "/";
                }
            });
    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);
    useEffect(() => {
        if (socket) {
            socket.on('userJoined', ({ users, username }) => {
                console.log(`${username} Joined!`);
                setMessages(prev => [...prev, { username: 'SYSTEM', message: `${username} Joined!` }]);
                setUsers(users);
            });

            socket.on('userLeft', (obj) => {
                setRoom(obj.updatedRoom);
                setUsers(obj.updatedRoom.users);
                if (obj.updatedRoom.adminUsername === username) {
                    setIsAdmin(true);
                }
                else {
                    setIsAdmin(false);
                }
                console.log(`${obj.username} Left!`);
                setMessages(prev => [...prev, { username: 'SYSTEM', message: `${obj.username} Left!` }])

            });

            socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));
        }
    }, [socket, username]);

    const openDrawer = () => {
        const tl = gsap.timeline({ paused: true });
        tl.to(mainRef, { width: '80%', duration: 0.5 });
        tl.to(drawerRef, { left: '80%', delay: '-0.5' });
        tl.play();
        setOpen(true);
    }
    const closeDrawer = () => {
        const tl = gsap.timeline({ paused: true });
        tl.to(mainRef, { width: '100%', duration: 0.5 });
        tl.to(drawerRef, { left: '100%', delay: "-0.5" });
        setOpen(false);
        tl.play()
    }
    function copyToClipboard(text) {
        const elem = document.createElement('textarea');
        elem.value = text;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
        toast('Room ID Copied!')
    }

    console.log(isAdmin);
    return (
        <div className={styles.lobbyPage}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${BGIMAGE})` }} ref={(e) => mainRef = e}>
                <div className={styles.appBar}>
                    <div className={styles.innerAppBar}>
                        <h1 style={{ fontFamily: 'strikefighter', fontSize: '40px' }}>PANDEMIC GAMES</h1>
                        <MenuIcon fontSize="large" style={{ cursor: 'pointer', visibility: open ? 'hidden' : 'visible' }} onClick={openDrawer} />
                    </div>
                </div>
                {/* Lobby */}
                <div style={{ width: '80%', margin: 'auto', marginTop: '5vh', height: '80vh' }}>
                    <div className={styles.pane1}>
                        <div className={styles.gameList}></div>
                        <div className={styles.roomInfo}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div style={{ fontSize: '20px', fontFamily: 'strikefighter' }}>{room.roomName}</div>
                                <div style={{ fontFamily: 'monospace', position: 'absolute', top: 0, left: 0 }}>Room Name</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div style={{ fontSize: '20px', fontFamily: 'strikefighter' }}>{room.adminUsername}</div>
                                <div style={{ fontFamily: 'monospace', position: 'absolute', top: 0, left: 0 }}>Room Admin</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                                <div style={{ fontSize: '20px', fontFamily: 'strikefighter', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%' }}><span>{roomID}</span> <FileCopyIcon style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(roomID)} /></div>
                                <div style={{ fontFamily: 'monospace', position: 'absolute', top: 0, left: 0 }}>Room ID</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.pane2}>
                        <div className={styles.userList}>
                            <div style={{ color: 'white', writingMode: 'vertical-lr', fontSize: '24px', transform: 'rotate(180deg)', textAlign: 'center', fontFamily: 'strikefighter', padding: '20px', borderLeft: '2px solid white' }}>
                                USERS
                            </div>
                            <div style={{ flex: 1 }}>

                            </div>
                        </div>
                        <div className={styles.selectedGame}></div>
                    </div>
                    <div className={styles.startGame} style={{ display: room.adminUsername === username ? 'block' : 'none' }}>
                        <Button
                            variant="contained"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', width: '25%', backdropFilter: ' saturate(100%) blur(5px)', padding: '10px' }}>
                            Start Game
                        </Button>
                    </div>
                </div>
            </div>
            {/* DRAWER */}
            <div style={{ position: 'absolute', left: '100%', width: '20%', height: '100vh' }} ref={(e) => drawerRef = e}>
                <div className={styles.drawerHeader}>
                    <ChevronRightIcon fontSize='large' style={{ cursor: 'pointer', marginLeft: '5%' }} onClick={closeDrawer} />
                </div>
                <div style={{ height: '90vh', backgroundColor: 'rgb(20, 20, 20)' }}>
                    <Chat socket={socket} username={username} messages={messages} />
                </div>
            </div>


        </div>
    );
}

export default Lobby;