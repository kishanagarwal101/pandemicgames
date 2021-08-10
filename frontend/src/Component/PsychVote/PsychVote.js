import React from 'react';
import styles from './PsychVote.module.css';
const PsychVote = (props) => {
    return ( 
        <div className={styles.main} onClick={()=>props.setSelectedVote(props.data)} style={{backgroundColor: props.selectedVote?props.selectedVote.username===props.data.username?'rgba(255, 171, 74, 0.226)':null:null, display:props.data.username===props.myUsername?'none':'block'}}>
            {props.data.prompt}
        </div>
     );
}
 
export default PsychVote;