import React, { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css'
import SendIcon from '@material-ui/icons/Send';
import Message from '../Message/Message';
const Chat = (props) => {
    const [text, setText] = useState('');
    const scrollRef = useRef(null);
    const sendChatMessage = () => {
        if (!text) return;
        props.socket.emit('chatMessage', { username: props.username, message: text });
        setText('');
    }
    useEffect(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [props.messages.length])
    const messageGroup = props.messages.map((m, i) => <Message username={m.username} message={m.message} key={i} myUsername={props.username} />)
    return (
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
    );
}

export default Chat;