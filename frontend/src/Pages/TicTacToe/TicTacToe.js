import React, { useEffect, useState } from 'react';
import POST from './../../Requests/POST';
import SocketIOClient from 'socket.io-client';
import styles from './TicTacToe.module.css';
import glassImg from './glass.png'
import blueGlass from './blueGlass.png'
import Chat from '../../Component/Chat/Chat';
const typo = {
    textAlign: 'center'
}
const Glass = (props) => {

    const weight = props.weight;
    return (
        <div style={{ opacity: props.weight < 0 ? '0.5' : 1 }}>
            {props.color === "red" ?

                <img src={glassImg} alt="Glass" style={{ transform: 'rotateX(180deg)', height: `${Math.abs(weight) * 20}px`, cursor: props.visible === 0 ? 'none' : 'pointer', filter: props.selectedGlass === props.index ? 'drop-shadow(2px 2px 0 black) drop-shadow(-2px -2px 0 black)' : 'drop-shadow(10px -10px 3px rgba(0, 0, 0, 0.2))', transform: props.selectedGlass === props.index ? 'translateY(-50%) rotateX(180deg)' : 'rotateX(180deg)' }} onClick={() => {
                    if (props.myTurn && weight > 0) {
                        props.setSelectedGlass(props.index)
                    }
                }} />
                :
                <img src={blueGlass} alt="Glass" style={{ transform: 'rotateX(180deg)', height: `${Math.abs(weight) * 20}px`, filter: 'drop-shadow(10px -10px 3px rgba(0, 0, 0, 0.2))' }} />
            }
        </div>
    )
}
const TicTacToe = (props) => {

    const [socket, setSocket] = useState(null);
    const [room, setRoom] = useState({
        users: []
    });
    const [users, setUsers] = useState(null);
    const [myUsername, setMyUsername] = useState('');
    const [myWeightArray, setMyWeightArray] = useState([2, 2.5, 3, 3.5, 4]);
    const [opponentWeightArray, setOpponentWeightArray] = useState([2, 2.5, 3, 3.5, 4]);
    const [selectedGlass, setSelectedGlass] = useState(-1);
    const [gameState, setGameState] = useState([
        [{ weight: 0, userName: null }, { weight: 0, userName: null }, { weight: 0, userName: null }],
        [{ weight: 0, userName: null }, { weight: 0, userName: null }, { weight: 0, userName: null }],
        [{ weight: 0, userName: null }, { weight: 0, userName: null }, { weight: 0, userName: null }]
    ]);
    const [myTurn, setMyTurn] = useState(true);
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin
        }
        // POST(`/joinTTT/${props.location.state.roomID}`, payload)
        //     .then(res => {
        //         setRoom(res.room);
        //         setUsers(res.room.users);
        //         console.log(res)
        //     });
    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);





    return (
        <div style={{ backgroundColor: '#FEA82F', display: 'flex' }}>
            <div style={{ width: '80%' }}>
                <div style={{ height: '100vh', width: '100%', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '80%' }}>
                        <div className={styles.user1}>
                            <div style={{ width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ backgroundColor: 'rgb(58,90,255)', width: '50%', textAlign: 'center', padding: '16px', borderRadius: '10px', color: 'white', filter: 'drop-shadow(10px 10px 3px rgba(0, 0, 0, 0.2))' }}>
                                    {/* {opponentUsername} */}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-around', width: '60%' }}>
                                {opponentWeightArray.map((m, i) => <Glass weight={m} key={i} index={i} color={"blue"} visible={m} />).reverse()}
                            </div>
                        </div>
                        <div className={styles.gameArea}>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderBottom: '3px solid black' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderTop: 'none' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderBottom: '3px solid black' }}>
                                </div>
                            </div>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderLeft: 'none' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderRight: 'none' }}>
                                </div>
                            </div>
                            <div style={{ display: 'flex', height: '33.33%' }}>
                                <div className={styles.grid} style={{ flex: '1', borderRight: '3px solid black', borderTop: '3px solid black' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', border: '3px solid black', borderBottom: 'none' }}>
                                </div>
                                <div className={styles.grid} style={{ flex: '1', borderLeft: '3px solid black', borderTop: '3px solid black' }}>
                                </div>
                            </div>
                        </div>
                        <div className={styles.user2}>
                            <div style={{ width: '40%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ backgroundColor: 'rgb(234,81,78)', width: '50%', textAlign: 'center', padding: '16px', borderRadius: '10px', color: 'white', filter: 'drop-shadow(10px 10px 3px rgba(0, 0, 0, 0.2))' }}>
                                    {/* Red Us */}
                                    { }
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-around', width: '60%' }}>
                                {myWeightArray.map((m, i) => <Glass weight={m} key={i} index={i} color={"red"} visible={m} setSelectedGlass={setSelectedGlass} selectedGlass={selectedGlass} myTurn={myTurn} />)}
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '20%', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', }} className={styles.gameName}>
                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                <div style={typo}>T</div>
                                <div style={typo}>I</div>
                                <div style={typo}>C</div>
                            </div>
                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                <div style={typo}>T</div>
                                <div style={typo}>A</div>
                                <div style={typo}>C</div>
                            </div>
                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                <div style={typo}>T</div>
                                <div style={typo}>O</div>
                                <div style={typo}>E</div>
                            </div>
                            <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                                2.0
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ width: '20%', boxShadow: '3px 3px 10px 10px rgba(0, 0, 0, 0.4)', height: '100vh', overflow: 'hidden' }}>
                <div style={{ height: '90vh', backgroundColor: 'rgb(20, 20, 20)' }}>
                    <Chat socket={socket} username='USERNAME' messages={messages} />
                </div>
            </div>
        </div>

    );
}


export default TicTacToe;

