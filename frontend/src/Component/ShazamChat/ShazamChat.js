import React from 'react';
import styles from './ShazamChat.module.css'
const ShazamChat = (props) => {
    if (props.userCorrectGuess) {
        return (
            <div className={styles.chatBox}  >
                <p style={{ color: '#1c9600', textAlign: 'center' }}>
                    <b>{props.username} has guessed correctly!</b>
                </p>
            </div>
        )
    }
    else if (props.hasGuessed === false && props.afterGuess === true)
        return (null);
    else {
        return (
            <div className={styles.chatBox} >
                <p style={{
                    backgroundColor: (props.index % 2 === 0 ? '#f0d8b4' : null),
                    color: props.guess === true ? '#1c9600' : (props.afterGuess === true ? '#8c880e' : '')
                }}>
                    <b>{props.username === props.myUsername ? 'You:' : props.username + ': '} </b>
                    <span>
                        {props.message} {props.c}
                    </span>
                </p>
            </div>
        )
    }
}
export default ShazamChat;