import React, { useEffect, useState } from 'react';
import POST from './../../Requests/POST';
import SocketIOClient from 'socket.io-client';
import styles from './TicTacToe.module.css';
import Chat from '../../Component/Chat/Chat';
import SelectableGlass from './Glass/SelectableGlass/SelectableGlass';
import DumbGlass from './Glass/DumbGlass/DumbGlass';
const TicTacToe = (props) => {

    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({
        users: []
    });
    const [users, setUsers] = useState(null);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState(null);

    //GAME RELATED STATES

    const [myWeightArray, setMyWeightArray] = useState([2, 2.5, 3, 3.5, 4]);
    const [opponentWeightArray, setOpponentWeightArray] = useState([2, 2.5, 3, 3.5, 4]);



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
        POST(`/joinTTT/${props.location.state.roomID}`, payload)
            .then(res => {
                setRoom(res.room);
                setUsers(res.room.users);
                socket.emit('userJoinedTTT', { users: res.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
            });

    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);
    useEffect(() => {
        if (socket) {
            socket.on('userJoinedTTT', ({ users, username }) => {
                console.log(`${username} Joined!`);
                setMessages(prev => [...prev, { username: 'SYSTEM', message: `${username} Joined!` }]);
                setUsers(users);
            });

            socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));

        }
    }, [socket]);

    const myWeightGlass = myWeightArray.map((m) => <SelectableGlass weight={m} key={m} />)
    const opponentWeightGlass = opponentWeightArray.map((m) => <DumbGlass weight={m} color="BLUE" key={m} />)
    return (
        <div className={styles.mainTTT}>
            <div className={styles.gameArea}>
                <div style={{ height: '100vh', width: '80%' }}>
                    <div className={styles.opponentPanel}>
                        <div className={styles.namePanel}>
                            <div style={{ backgroundColor: 'rgb(58,90,255)' }}>Kishan</div>
                        </div>
                        <div className={styles.glassPanel}>
                            {opponentWeightGlass}
                        </div>
                    </div>
                    <div className={styles.gameBoard}>
                        <div style={{ width: '70%', height: '60vh', marginLeft: '30%' }}>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderBottom: '3px solid black' }}></div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderTop: 'none' }}></div>
                                <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderBottom: '3px solid black' }}></div>
                            </div>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderLeft: 'none' }}></div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black' }}></div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderRight: 'none' }}></div>
                            </div>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderTop: '3px solid black' }}></div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderBottom: 'none' }}></div>
                                <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderTop: '3px solid black' }}></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.myPanel}>
                        <div className={styles.namePanel}>
                            <div style={{ backgroundColor: 'rgb(234, 81, 78)' }}>Sanyam</div>
                        </div>
                        <div className={styles.glassPanel}>
                            {myWeightGlass}
                        </div>
                    </div>
                </div>
                <div style={{ height: '100vh', width: '20%', position: 'relative' }}>
                    <div className={styles.gameName}>
                        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                            <div style={{ textAlign: 'center' }}>T</div>
                            <div style={{ textAlign: 'center' }}>I</div>
                            <div style={{ textAlign: 'center' }}>C</div>
                        </div>
                        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                            <div style={{ textAlign: 'center' }}>T</div>
                            <div style={{ textAlign: 'center' }}>A</div>
                            <div style={{ textAlign: 'center' }}>C</div>
                        </div>
                        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                            <div style={{ textAlign: 'center' }}>T</div>
                            <div style={{ textAlign: 'center' }}>O</div>
                            <div style={{ textAlign: 'center' }}>E</div>
                        </div>
                        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                            2.0
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.chatArea}>
                <Chat socket={socket} username={username} messages={messages} />
            </div>
        </div>

    );
}


export default TicTacToe;

