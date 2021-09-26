import React from 'react';
import styles from './Userlistshazam.module.css'
const UserlistShazam = (props) => {
    return (
        <div className={styles.mainPanel}>
            <div className={styles.index}>
                {props.index}
            </div>
            <div className={styles.username}>
                {props.user.username}
            </div>
            <div className={styles.score}>
                {props.user.score}
            </div>
        </div>
    );
}

export default UserlistShazam;