import React, { useState, useEffect, useRef } from 'react';
import SendIcon from '@material-ui/icons/Send';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST';
import styles from './Psych.module.css'; 
import LeaderboardCard from './Leaderboard';
import Message from '../../Component/Message/Message';
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
    const [status, setStatus] = useState(0);
    const [gameState, setGameState] = useState([]);
    const [roundQuestion, setRoundQuestion] = useState('');
    const [value, setValue] = useState('');
    const [text, setText] = useState('');

    let scrollRef = useRef(null);
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
    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages.length])
    useEffect(()=>{
        if(socket){
            socket.on('userJoinedPsych', (payload) => {
                console.log(`${payload.username} Joined!`);
                setUsers(payload.users);
                setGameState(payload.users);
            });
            socket.on('gameInitialized', ()=>{
                if(isAdmin){
                    socket.emit('roundStart');
                }
            });
            socket.on('roundStart', (payload)=>{
                let initGameState = payload.users;
                initGameState.forEach((m)=> m.prompt = null);
                setGameState(initGameState);
                setRoundQuestion(payload.roundQuestion);
                setStatus(1);

            });
            socket.on('roundGuess', (updatedGameState)=>{
                setGameState(updatedGameState);
            })
            socket.on('startVoting', ()=>{
                setStatus(3);
            })

        }
    }, [socket, isAdmin, users]);

    useEffect(()=>{
        if(socket){
            socket.on('chatMessagePsych', (payload) => {
                const newArr = [...messages, payload];
                setMessages(newArr)
            });
        }
    }, [socket, messages]);

    const sendResponse = ()=>{
        if(!value)return;
        socket.emit('roundGuess', {
            gameState:gameState,
            username:username,
            value:value
        })
        setStatus(2);
        setValue('');

    }
    const sendChatMessage = () => {
        if (!text) return;
        socket.emit('chatMessagePsych', { username: username, message: text });
        setText('');
    }
    
    const LeaderboardComponent = gameState.sort((a, b)=>b.points-a.points).map((m, i)=><LeaderboardCard position={i+1} name={m.username} points={m.points} prompt={m.prompt} key={i}/>)
    const messageGroup = messages.map((m, i) => <Message username={m.username} message={m.message} key={i} myUsername={username} />)

    return ( 
        <div className={styles.background}>
            <div className={styles.mainContainer}>
            <div className={styles.userList}>
                <div className={styles.heading}>Players</div>
                <hr />
                {LeaderboardComponent}
            </div>
            <div className={styles.gameContainer}>
                <div className={styles.psych}>PSYCH</div>
                <div className={styles.gameArea}>
                    <div className={styles.questionPrompt} style={{display:status===1?'block':'none'}}>{roundQuestion}</div>
                    <div className={styles.answerPanel} style={{display:status===1?'block':'none'}}>
                        <textarea value={value} onChange={(e)=>setValue(e.target.value)} className={styles.textarea} style={{width:'100%', height:'15vh'}} placeholder="Your Answer..."></textarea>
                    </div>
                    <div className={styles.submit} style={{display:status===1?'block':'none'}}><button onClick={sendResponse}>Submit</button></div>


                    <div className={styles.button} style={{display: status===0 || status===2?'block':'none'}} onClick={()=>(status===0)&&isAdmin && socket.emit('gameInitialized')}>
                        <span className={styles.buttonMask}></span>
                        <span className={styles.buttonText}>
                            {status===0?isAdmin?'Play':'Waiting...':null}
                            {status===2?"Waiting for others...":null}
                        </span>
                    </div>
                </div>
                <div className={styles.psych}>PSYCH</div>
            </div>
            <div className={styles.chatContainer}>
            <div style={{ height: '100%', width: '100%' }}>
            <div className={styles.messageContainer} ref={scrollRef}>
                {messageGroup}
            </div>
            <div className={styles.inputContainer}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90%' }}>
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
                    <div><SendIcon style={{ color: '#FF6701', cursor: 'pointer' }} onClick={sendChatMessage} /></div>
                </div>
            </div>
        </div>
            </div>
        </div>
        </div>
     );
}
 
export default Psych;

//0->Game Not Started
//1->Game Started
//2->I have Answered
//3->Everybody Has Answered && Voting Booth;
//4->Voting Complete && Show Result