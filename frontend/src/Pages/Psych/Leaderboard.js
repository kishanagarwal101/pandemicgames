import React from 'react';

const LeaderboardCard = (props) => {
    const color = props.position===1?'gold':props.position===2?'silver':props.position===3?'brown':"black";
    return ( 
        <div style={{display:'flex', backgroundColor:props.hasAnswered?'rgb(194, 255, 232)':(props.position%2===0)?'rgb(255,226,188)':'rgb(240, 240, 240)', alignItems:'center', padding:'6px', borderRadius:'4px', marginTop:'10px', justifyContent:'space-between', fontFamily:'strikefighter'}}>
            <div style={{display:'flex', alignItems:'center'}}>
                <div>
                    <div style={{height:'20px', width:'20px', border:`4px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', padding:'10px' }}>{props.position}</div>
                </div>
                <div style={{marginLeft:'30px'}}>{props.name}</div>
            </div>
            <div style={{marginRight:'10px'}}>{props.points}</div>
        </div>
     );
}
 
export default LeaderboardCard;