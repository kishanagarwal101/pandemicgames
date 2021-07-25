import React from 'react';
import styles from './UserBlock.module.css'
const UserBlock = (props) => {
    return (
        <div className={styles.mainPanel}>
            {props.index}. {props.username}
        </div>
    );
}

export default UserBlock;