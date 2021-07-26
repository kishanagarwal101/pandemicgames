import React from 'react';
import { Button } from '@material-ui/core';
import styles from '../TicTacToe.module.css'
const TTTResult = (props) => {

    return (
        <>
            {props.result && <div style={{ position: "fixed", height: "100vh", width: "100%", background: "rgba(0, 0, 5, 0.8)", zIndex: "500", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: '50%', height: '50%' }}>
                    <div style={{ textAlign: 'center', fontSize: '70px' }} className={styles.result}>
                        {props.result}
                    </div>
                    {props.isAdmin && <div style={{ textAlign: 'center' }}>
                        <Button style={{ backgroundColor: '#FF6701', marginRight: '10px' }}>Play Again</Button>
                        <Button style={{ backgroundColor: '#FF6701', marginLeft: '10px' }}>Return to Lobby</Button>
                    </div>}
                </div>
            </div>}
        </>
    )
}
export default TTTResult;