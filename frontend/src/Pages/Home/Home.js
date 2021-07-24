import React, { useRef, useState, useEffect } from 'react';
import styles from './Home.module.css';
import { Button } from '@material-ui/core';
import POST from './../../Requests/POST';
import { toast } from 'react-toastify'
import GET from './../../Requests/GET';
import { Redirect } from 'react-router-dom';

const Home = () => {
    const [jUsername, setJUsername] = useState('');
    const [jRoomID, setJRoomID] = useState('');
    const [cUsername, setCUsername] = useState('');
    const [cRoomName, setCRoomName] = useState('');
    const [join, setJoin] = useState(true);
    const [redirect, setRedirect] = useState('');
    const [receivedRoomID, setReceivedRoomID] = useState(null);
    let frontRef = useRef(null);
    let backRef = useRef(null);
    let cardRef = useRef(null);
    //Flips The Dialogue
    //@ CSS Manipulation: Rotation
    useEffect(() => {
        if (!join) {
            cardRef.current.style.transform = "rotateY(180deg)";

            setTimeout(() => {
                frontRef.current.style.visibility = "hidden";
                backRef.current.style.visibility = "visible";
            }, 400)

        }
        else {
            cardRef.current.style.transform = "rotateY(0deg)"
            setTimeout(() => {
                frontRef.current.style.visibility = "visible"
                backRef.current.style.visibility = "hidden";
            }, 400)

        }
    }, [join]);

    const attemptJoin = async () => {
        if (!jUsername) return toast('Username Cannot Be Empty!');
        if (jRoomID.length !== 6) return toast('Invalid Room!');
        const response = await GET(`/validateUsername/${jRoomID}/${jUsername}`);
        if (response.code === 200) {
            setRedirect('JOIN');
        }
        else toast(response.message)
    }
    const attemptCreate = async () => {
        if (!cUsername) return toast('Username Cannot Be Empty!');
        if (!cRoomName) return toast('Room Name cannot Be Empty!');
        const payload = {
            roomID: null,
            users: [],
            roomName: cRoomName,
            adminUsername: cUsername
        }
        const response = await POST('/createRoom', payload);
        if (response.code === 200) {
            setReceivedRoomID(response.room.roomID);
            setRedirect('CREATE');
        } else {
            toast('Internal Server Error!')
        }
    }
    if (redirect) {
        if (redirect === 'CREATE') {
            return <Redirect
                to={{
                    pathname: "/lobby",
                    state: { roomID: receivedRoomID, username: cUsername, isAdmin: true }
                }}
            />
        }
        return <Redirect
            to={{
                pathname: "/lobby",
                state: { roomID: jRoomID, username: jUsername, isAdmin: false }
            }}
        />
    }
    return (
        <div className={styles.homeContainer}>
            <div className={styles.flipContainer}>
                <div className={styles.flipCard} ref={cardRef}>
                    {/* FRONTRef START */}
                    <div className={styles.front} ref={frontRef}>
                        <h1>JOIN ROOM</h1>
                        <div className={styles.inputPanel}>
                            <input type="text" placeholder="Username" value={jUsername} onChange={(e) => setJUsername(e.target.value)} style={{ display: 'block' }} />
                            <input type="text" placeholder="Room ID" value={jRoomID} onChange={(e) => setJRoomID(e.target.value)} style={{ display: 'block' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '25%' }}><Button style={{ backgroundColor: '#FF6701', width: '100%' }} onClick={attemptJoin}>Join</Button></div>
                    </div>
                    {/* FRONTRef END */}

                    {/* BACKRef START */}
                    <div className={styles.back} ref={backRef}>
                        <h1>CREATE ROOM</h1>
                        <div className={styles.inputPanel}>
                            <input type="text" placeholder="Username" value={cUsername} onChange={(e) => setCUsername(e.target.value)} style={{ display: 'block' }} />
                            <input type="text" placeholder="Room Name" value={cRoomName} onChange={(e) => setCRoomName(e.target.value)} style={{ display: 'block' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '25%' }}><Button style={{ backgroundColor: '#FF6701', width: '100%' }} onClick={attemptCreate}>Create</Button></div>
                    </div>
                    {/* BACKRef END */}

                </div>
                <div style={{ textAlign: 'center', marginTop: '2.5%' }}><Button variant="contained" style={{ backgroundColor: '#FFC288', color: 'black', width: '50%' }} onClick={() => setJoin(prev => !prev)}>{join ? "CREATE ROOM" : 'JOIN ROOM'}</Button></div>
            </div>
        </div>
    );
}

export default Home;