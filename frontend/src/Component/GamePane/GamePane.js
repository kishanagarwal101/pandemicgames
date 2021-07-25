import React from 'react';
import styles from './GamePane.module.css';

const GamePane = (props) => {
    const changeGame = () => {
        if (!props.isAdmin) return;
        props.socket.emit('changeSelectedGame', { gameCode: props.gameCode });
    }
    return (
        <div className={styles.pane} style={{ cursor: props.isAdmin ? 'pointer' : 'none' }} onClick={changeGame}>
            <div>{props.name}</div>
        </div>
    );
}

export default GamePane;