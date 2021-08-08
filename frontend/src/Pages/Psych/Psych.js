import React, {useEffect, useState} from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST';
import Chat from '../../Component/Chat/Chat';
import styles from './Psych.module.css'; 
import LeaderboardCard from './Leaderboard';
const Psych = (props) => {
    const [username, setUsername] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [roomID, setRoomID] = useState('');
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [room, setRoom] = useState({
        users:[]
    })
    const [messages, setMessages] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameState, setGameState] = useState([]);
    useEffect(() => {
        const socket = SocketIOClient('/');
        setSocket(socket);
        setUsername(props.location.state.username);
        setIsAdmin(props.location.state.isAdmin);
        setRoomID(props.location.state.roomID);
        const payload = {
            username: props.location.state.username,
            isAdmin: props.location.state.isAdmin,
            points:0,
            prompt: ''
        }
        POST(`/joinPsych/${props.location.state.roomID}`, payload)
            .then(res => {
                setRoom(res.room);
                setUsers(res.room.users);
                setGameState(res.room.users);
                socket.emit('userJoinedPsych', { users: res.room.users, username: props.location.state.username, roomID: props.location.state.roomID })
            });

    }, [props.location.state.roomID, props.location.state.isAdmin, props.location.state.username]);

    useEffect(()=>{
        if(socket){
            socket.on('userJoinedPsych', (payload) => {
                console.log(`${payload.username} Joined!`);
                setUsers(payload.users);
            });
            socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));
            socket.on('gameInitialized', ()=>{
                setGameStarted(true);
                if(isAdmin){
                    socket.emit('roundStart');
                }
            });
            socket.on('roundStart', (payload)=>{
                let initGameState = payload.users;
                initGameState.forEach((m)=> m.prompt = null);
                setGameState(initGameState);
            });

        }
    }, [socket, isAdmin, users]);

    const LeaderboardComponent = gameState.sort((a, b)=>b.points-a.points).map((m, i)=><LeaderboardCard position={i+1} name={m.username} points={m.points} hasAnswered = {m.hasAnswered} key={i}/>)
    return ( 
        <div className={styles.background}>
            <div className={styles.mainContainer}>
            <div className={styles.userList}>
                <div className={styles.heading}>Players</div>
                <hr />
                {gameStarted?LeaderboardComponent:LeaderboardComponentI}
            </div>
            <div className={styles.gameContainer}>
                <div className={styles.psych}>PSYCH</div>
                <div className={styles.gameArea}>
                    <div className={styles.questionPrompt} style={{display:gameStarted?'block':'none'}}></div>
                    <div className={styles.answerPanel} style={{display:gameStarted?'block':'none'}}></div>
                    <div className={styles.submit} style={{display:gameStarted?'block':'none'}}><button>Submit</button></div>


                    <div className={styles.button} style={{display:gameStarted?'none':'block'}} onClick={()=>isAdmin && socket.emit('gameInitialized')}>
                        <span className={styles.buttonMask}></span>
                        <span className={styles.buttonText}>{isAdmin?'Play':'Waiting...'}</span>
                    </div>
                </div>
                <div className={styles.psych}>PSYCH</div>
            </div>
            <div className={styles.chatContainer}>
                <Chat socket={socket} username={username} messages={messages} />
            </div>
        </div>
        </div>
     );
}
 
export default Psych;