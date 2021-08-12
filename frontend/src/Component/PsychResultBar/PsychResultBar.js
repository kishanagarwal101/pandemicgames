import React from 'react';
import Chip from '@material-ui/core/Chip';
import Badge from '@material-ui/core/Badge';
const nthFib = (n)=> {
    if(n <= 2) return n -1;
    return nthFib(n - 2) + nthFib(n - 1);
}

const psychScore = (n)=>{
    if(n===0)return 0;
    let ans =  nthFib(n+2)*2;
    return ans;
}
const PsychResultBar = (props) => {
    const Labels = props.vote.map((i, index)=> index%2===0? <Chip label={i} variant="outlined" color='secondary' key={index}/>:<Chip label={i}  color='secondary' key={index}/>)
    return ( 
            
            <div style={{display:'flex', backgroundColor:'rgb(22, 39, 53)', justifyContent:'space-between', width:'80%', margin:'auto', padding:'16px', marginTop:'2.5%', borderRadius:'6px'}}>
                <div style={{width:'70%'}}>
                    <div style={{fontFamily:'strikefighter', color:'white'}}>{props.prompt}</div>
                    <div style={{fontFamily:'KGHAPPY', color:'white', fontSize:'0.5em', marginLeft:'30px', marginTop:'10px'}}>---{props.username}</div>
                </div>
                <div style={{width:'25%', display:'flex', flexWrap:'wrap', marginLeft:'5%'}}>
                    {Labels}
                </div>
            </div>
     );
}
 
export default PsychResultBar;