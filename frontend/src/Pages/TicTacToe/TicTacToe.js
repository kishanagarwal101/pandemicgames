import React, { useEffect, useState } from 'react';
import POST from './../../Requests/POST';
import SocketIOClient from 'socket.io-client';
import styles from './TicTacToe.module.css';
import Chat from '../../Component/Chat/Chat';
import SelectableGlass from './Glass/SelectableGlass/SelectableGlass';
import DumbGlass from './Glass/DumbGlass/DumbGlass';
import Result from './TTTResult/TTTResult.js';
import { Redirect } from 'react-router-dom';
const TicTacToe = (props) => {

    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({
        users: []
    });
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const opponentName = users.length === 2 ? users[0].username === username ? users[1].username : users[0].username : null
    const [messages, setMessages] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState(null);
    const [result, setResult] = useState(null);
    const [redirect, setRedirect] = useState(false);
    //GAME RELATED STATES

    const [myWeightArray, setMyWeightArray] = useState([2, 2.5, 3, 3.5, 4]);
    const [opponentWeightArray, setOpponentWeightArray] = useState([2, 2.5, 3, 3.5, 4]);
    const [selectedGlassIndex, setSelectedGlassIndex] = useState(-1);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [gameState, setGameState] = useState([
        [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }],
        [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }],
        [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }]
    ]);



    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);
        setIsMyTurn(props.location.state.isAdmin);
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

            socket.on('TTTMove', ({ gameState, incomingWeightArray }) => {
                setIsMyTurn(true);
                setGameState(gameState);
                setOpponentWeightArray(incomingWeightArray);
            });
            socket.on('TTTWon', () => {
                console.log("you won");
                setResult('YOU WON!');
            })
            socket.on('TTTLost', ({ gameState, incomingWeightArray }) => {
                console.log(gameState);
                setGameState(gameState);
                setOpponentWeightArray(incomingWeightArray);
                setResult('You Lost');
                console.log("you lost");
            })
            socket.on('TTTDraw', ({ gameState, incomingWeightArray }) => {
                setGameState(gameState);
                setOpponentWeightArray(incomingWeightArray);
                console.log('DRAW');
                setResult('DRAW');
            })
            socket.on('TTTReset', () => {
                setResult(null);
                setOpponentWeightArray([2, 2.5, 3, 3.5, 4]);
                setMyWeightArray([2, 2.5, 3, 3.5, 4]);
                setGameState([
                    [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }],
                    [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }],
                    [{ weight: 0, user: null }, { weight: 0, user: null }, { weight: 0, user: null }]
                ]);
                // console.log(room.lastTurn);
                // console.log(room);
                // console.log(username);
                if (username === room.lastTurn) {
                    setIsMyTurn(false);
                    let newRoom = room;
                    newRoom.lastTurn = opponentName;
                    setRoom(newRoom);
                    console.log('A')
                } else {
                    setIsMyTurn(true);
                    let newRoom = room;
                    newRoom.lastTurn = username;
                    setRoom(newRoom);
                    console.log('B')
                }
                setSelectedGlassIndex(-1);
            })
            socket.on('returnToRoomFromTTT', () => setRedirect(true));
        }
    }, [socket, room, username, opponentName]);


    const handleGridClick = (e, i, j) => {
        e.stopPropagation();
        //No Glass Selected
        if (selectedGlassIndex === -1) return;
        //Not My Turn
        if (!isMyTurn) return;
        //Invalid Move --> Low Weight On higher Level Weight
        if (myWeightArray[selectedGlassIndex] <= gameState[i][j].weight) return;
        //Invalid move --> Cannot Superimpose own Glass
        if (gameState[i][j].user === username) return;
        //Valid move

        const newGameState = gameState;
        newGameState[i][j].weight = myWeightArray[selectedGlassIndex];
        newGameState[i][j].user = username;
        setGameState(newGameState);

        const newMyWeightArray = myWeightArray;
        newMyWeightArray[selectedGlassIndex] *= -1;
        setMyWeightArray(newMyWeightArray);

        setIsMyTurn(false);
        setSelectedGlassIndex(-1);
        socket.emit('TTTMove', { gameState: newGameState, myWeightArray: newMyWeightArray, opponentWeightArray: opponentWeightArray });




    }
    const myWeightGlass = myWeightArray.map((m, i) => <SelectableGlass
        weight={m}
        key={m}
        index={i}
        selectedGlassIndex={selectedGlassIndex}
        setSelectedGlassIndex={setSelectedGlassIndex}
        isMyTurn={isMyTurn}
    />)
    const opponentWeightGlass = opponentWeightArray.map((m) => <DumbGlass weight={m} color="BLUE" key={m} />);
    if (redirect) {
        return <Redirect
            to={{
                pathname: "/lobby",
                state: { roomID: props.location.state.roomID, username: props.location.state.username, isAdmin: props.location.state.isAdmin }
            }}
        />
    }
    return (
        <>
            <Result result={result} socket={socket} isAdmin={isAdmin} roomID={roomID} />
            <div className={styles.mainTTT} >
                <div className={styles.gameArea}>
                    <div className={styles.leftClassPanel} style={{ height: '100vh' }}>
                        <div className={styles.opponentPanel}>
                            <div className={styles.namePanel}>
                                <div style={{ backgroundColor: 'rgb(58,90,255)' }}>
                                    {opponentName}
                                </div>
                            </div>
                            <div className={styles.glassPanel}>
                                {opponentWeightGlass}
                            </div>
                        </div>
                        <div className={styles.gameBoard}>
                            <div className={styles.gridPlacement}>
                                <div style={{ display: 'flex', height: '33.33%' }}>
                                    <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderBottom: '3px solid black' }} onClick={(e) => handleGridClick(e, 0, 0)}>
                                        {!gameState[0][0].user ? null
                                            :
                                            gameState[0][0].user === username ? <DumbGlass weight={gameState[0][0].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[0][0].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderTop: 'none' }} onClick={(e) => handleGridClick(e, 0, 1)}>
                                        {!gameState[0][1].user ? null
                                            :
                                            gameState[0][1].user === username ? <DumbGlass weight={gameState[0][1].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[0][1].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderBottom: '3px solid black' }} onClick={(e) => handleGridClick(e, 0, 2)}>
                                        {!gameState[0][2].user ? null
                                            :
                                            gameState[0][2].user === username ? <DumbGlass weight={gameState[0][2].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[0][2].weight} color="BLUE" />
                                        }

                                    </div>
                                </div>
                                <div style={{ display: 'flex', height: '33.33%' }}>
                                    <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderLeft: 'none' }} onClick={(e) => handleGridClick(e, 1, 0)}>
                                        {!gameState[1][0].user ? null
                                            :
                                            gameState[1][0].user === username ? <DumbGlass weight={gameState[1][0].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[1][0].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', border: '3px solid black' }} onClick={(e) => handleGridClick(e, 1, 1)}>
                                        {!gameState[1][1].user ? null
                                            :
                                            gameState[1][1].user === username ? <DumbGlass weight={gameState[1][1].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[1][1].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderRight: 'none' }} onClick={(e) => handleGridClick(e, 1, 2)}>
                                        {!gameState[1][2].user ? null
                                            :
                                            gameState[1][2].user === username ? <DumbGlass weight={gameState[1][2].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[1][2].weight} color="BLUE" />
                                        }

                                    </div>
                                </div>
                                <div style={{ display: 'flex', height: '33.33%' }}>
                                    <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderTop: '3px solid black' }} onClick={(e) => handleGridClick(e, 2, 0)}>
                                        {!gameState[2][0].user ? null
                                            :
                                            gameState[2][0].user === username ? <DumbGlass weight={gameState[2][0].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[2][0].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderBottom: 'none' }} onClick={(e) => handleGridClick(e, 2, 1)}>
                                        {!gameState[2][1].user ? null
                                            :
                                            gameState[2][1].user === username ? <DumbGlass weight={gameState[2][1].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[2][1].weight} color="BLUE" />
                                        }

                                    </div>
                                    <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderTop: '3px solid black' }} onClick={(e) => handleGridClick(e, 2, 2)}>
                                        {!gameState[2][2].user ? null
                                            :
                                            gameState[2][2].user === username ? <DumbGlass weight={gameState[2][2].weight} color="RED" />
                                                :
                                                <DumbGlass weight={gameState[2][2].weight} color="BLUE" />
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.myPanel}>
                            <div className={styles.namePanel}>
                                <div style={{ backgroundColor: 'rgb(234, 81, 78)' }}>{username}</div>
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
        </>
    );
}


export default TicTacToe;

