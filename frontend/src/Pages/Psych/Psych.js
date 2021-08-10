import React, {useEffect, useState} from 'react';
import SocketIOClient from 'socket.io-client';
import POST from '../../Requests/POST';
import Chat from '../../Component/Chat/Chat';
import styles from './Psych.module.css'; 
import LeaderboardCard from './Leaderboard';
import PsychVote from '../../Component/PsychVote/PsychVote';
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
    const [selectedVote, setSelectedVote] = useState(null);
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
            prompt: '',
            vote:[],
            hasVoted:false
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
                setSelectedVote(null);

            });
            socket.on('roundGuess', (updatedGameState)=>{
                setGameState(updatedGameState);
            })
            socket.on('startVoting', ()=>{
                setStatus(3);
            })
            socket.on('psychRoundVote', (payload)=>{
                setGameState(payload.gameState);
            });
            socket.on('showResults', ()=>{
                setStatus(5); 
            })

        }
    }, [socket, isAdmin, users]);

    useEffect(()=>{
        if(socket)
            socket.on('chatMessage', (payload) => setMessages(prev => [...prev, payload]));

    }, [socket]);

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
    const vote = ()=>{
        if(!selectedVote)return;
        socket.emit('psychRoundvote', {
            voter:username,
            votee: selectedVote.username,
            gameState: gameState
        });
        setStatus(4)
    }
    const LeaderboardComponent = gameState.sort((a, b)=>b.points-a.points).map((m, i)=><LeaderboardCard position={i+1} name={m.username} points={m.points} prompt={m.prompt} key={i}/>)
    const votingBooth = gameState.map((m, i)=><PsychVote data={m} key={i} selectedVote={selectedVote} setSelectedVote={setSelectedVote} myUsername={username}/>)
    console.log(gameState)
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


                    <div className={styles.button} style={{display: status===0 || status===2 || status===4?'block':'none'}} onClick={()=>(status===0)&&isAdmin && socket.emit('gameInitialized')}>
                        <span className={styles.buttonMask}></span>
                        <span className={styles.buttonText}>
                            {status===0?isAdmin?'Play':'Waiting...':null}
                            {status===2?"Waiting for others...":null}
                            {status===4?"Waiting for others...":null}
                        </span>
                    </div>
                    <div style={{display:status===3?"block":'none'}}>
                        <div className={styles.psych} style={{textAlign:'left', fontSize:'2em'}}>VOTING</div>
                        <div className={styles.votingBooth}>
                            {votingBooth}
                        </div>
                        <div className={styles.submit}><button onClick={vote}>Vote</button></div>

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

//0->Game Not Started
//1->Game Started
//2->I have Answered
//3->Everybody Has Answered && Voting Booth;
//4->I Voted
//5->Voting Complete && Show Result