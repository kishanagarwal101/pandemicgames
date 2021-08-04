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
import moment from 'moment';
import gameArray from '../../Component/gameArray';
import GamePane from './../../Component/GamePane/GamePane';
import { Redirect } from 'react-router-dom';

const Lobby = (props) => {
    const [roomID, setRoomID] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState({});
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [day, setDay] = useState('Friday');
    const [date, setDate] = useState('24 July, 2021');
    const [time, setTime] = useState('01:29 am');
    const [selectedGame, setSelectedGame] = useState(-1);
    const [redirect, setRedirect] = useState('');


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
                    setSelectedGame(response.room.selectedGame);
                    socket.emit('userJoined', { users: response.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
                } else {
                    window.location = "/";
                }
            });
        return () => {

        }

    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);

    useEffect(() => {
        if (socket) {
            socket.on('userJoined', ({ users, username }) => {
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
                setMessages(prev => [...prev, { username: 'SYSTEM', message: `${obj.username} Left!` }])

            });

            socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));

            socket.on('changeSelectedGame', ({ gameCode }) => setSelectedGame(gameCode));

            socket.on('TTTStart', () => {
                socket.disconnect();
                setRedirect('tictactoe');
            });
            socket.on('ShazamStart', () => {
                socket.disconnect();
                setRedirect('shazam');
            });
            return () => {
                setSocket(null);
                setUsername('');
                setSelectedGame(-1);
                setMessages([]);
                setIsAdmin(false);
            }
        }
    }, [socket, username]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDay(moment().format('dddd'));
            setTime(moment().format('hh:mm:ss a'));
            setDate(moment().format('MMMM Do YYYY'));
        }, 1000);
        return () => {
            window.clearInterval(interval);
        }

    }, []);

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

    const attemptStartGame = () => {
        if (selectedGame === -1) return toast('Select a Game to Start!');
        // if (users.length === 1) return toast('You Need More Players(1)!');
        if (!gameArray[selectedGame].limit) {
            if (gameArray[selectedGame].gameCode === 1)
                return socket.emit('startGame', { gameCode: selectedGame, room });
        }

        if (users.length > gameArray[selectedGame].limit) return toast(`This game has a ${gameArray[selectedGame].limit} player Limit!`);
        socket.emit('startGame', { gameCode: selectedGame, room });
    }

    function copyToClipboard(text) {
        const elem = document.createElement('textarea');
        elem.value = text;
        document.body.appendChild(elem);
        elem.select();
        document.execCommand('copy');
        document.body.removeChild(elem);
        toast('Room ID Copied!');
    }

    const userBlockGroup = users.map((m, i) => <UserBlock username={m.username} key={i} id={m._id} index={i + 1} />);
    const gameArrayGroup = gameArray.map((m) => <GamePane key={m.gameCode} gameCode={m.gameCode} name={m.name} limit={m.limit} isAdmin={isAdmin} socket={socket} />);

    if (redirect) {
        return <Redirect
            to={{
                pathname: `/${redirect}`,
                state: { roomID: roomID, username: username, isAdmin: isAdmin }
            }}
        />
    }

    return (
        <div className={styles.lobbyPage}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url(${BGIMAGE})` }} ref={(e) => mainRef = e}>
                <div className={styles.appBar}>
                    <div className={styles.innerAppBar}>
                        <h1 className={styles.h1} style={{ fontFamily: 'strikefighter' }}>PANDEMIC GAMES</h1>
                        <MenuIcon fontSize="large" style={{ cursor: 'pointer', visibility: open ? 'hidden' : 'visible' }} onClick={openDrawer} />
                    </div>
                </div>
                {/* Lobby */}
                <div style={{ width: '80%', margin: 'auto', marginTop: '5vh', height: '80vh' }}>
                    <div className={styles.pane1}>
                        <div className={styles.gameList}>
                            {gameArrayGroup}
                        </div>
                        <div className={styles.aboutPanel}>
                            <svg width="120" height="120" viewBox="0 0 250 250" style={{ fill: '#fff', color: '#151513', position: 'absolute', top: 0, border: 0, left: 0, transform: 'scale(-1, 1)', zIndex: 10, cursor: 'pointer', borderRadius: '6px' }} onClick={() => window.open('https://github.com/sanyam-2001/Pandemic-Games', "_blank")} aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style={{ transformOrigin: '130px 106px' }} className="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor"></path></svg>
                            <div style={{ color: 'white', position: 'absolute', bottom: '5%', right: '5%', fontFamily: 'monospace' }}>
                                {time}
                            </div>
                            <div style={{ color: 'white', position: 'absolute', top: '5%', right: '5%', fontFamily: 'monospace' }}>
                                {day}
                            </div>
                            <div style={{ color: 'white', position: 'absolute', bottom: '5%', left: '5%', fontFamily: 'monospace' }}>
                                {date}
                            </div>
                        </div>
                    </div>
                    <div className={styles.pane2}>
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
                        <div className={styles.userList}>
                            <div style={{ color: 'white', writingMode: 'vertical-lr', fontSize: '24px', transform: 'rotate(180deg)', textAlign: 'center', fontFamily: 'strikefighter', padding: '20px', borderLeft: '2px solid white' }}>
                                USERS
                            </div>
                            <div className={styles.scrollbar} style={{ flex: 1, overflowY: 'scroll' }}>
                                {userBlockGroup}
                            </div>
                        </div>

                        <div className={styles.selectedGame}>
                            {selectedGame === -1 ? "No Game Selected!" : gameArray[selectedGame].name}
                        </div>

                    </div>
                    <div className={styles.startGame} style={{ display: isAdmin ? 'block' : 'none' }}>
                        {/* display: room.adminUsername === username ? 'block' : 'none' */}
                        <Button
                            variant="contained"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', width: '25%', backdropFilter: ' saturate(100%) blur(5px)', padding: '10px' }}
                            onClick={() => attemptStartGame()}
                        >
                            Start Game
                        </Button>
                    </div>
                </div>
            </div>
            {/* DRAWER */}
            <div className={styles.chatBox} style={{ position: 'absolute', left: '100%', height: '100vh' }} ref={(e) => drawerRef = e}>
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