import React from 'react';

const Message = (props) => {
    const sender = props.myUsername === props.username;
    if (props.username === "SYSTEM") {
        return (
            <div style={{ textAlign: 'center', color: '#968abd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', marginBottom: '10px' }}>
                <div style={{ width: '20%', height: '1px', backgroundColor: '#968abd' }}></div>
                <div style={{ fontSize: '12px' }}>{props.message}</div>
                <div style={{ width: '20%', height: '1px', backgroundColor: '#968abd' }}></div>
            </div>
        )
    }
    return (
        <div style={{ height: '10vh', display: 'flex', alignItems: 'center', justifyContent: sender ? 'flex-end' : 'flex-start', width: '90%', margin: 'auto', marginTop: '10px', marginBottom: '10px' }}>
            <div style={{ color: 'white', width: '70%', padding: '12px', backgroundColor: sender ? '#FF6701' : '#3A2E3C', borderRadius: '12px' }}>
                <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{sender ? "You" : props.username}</div>
                <div style={{ fontFamily: 'Franklin Gothic Medium', fontSize: "12px" }}>{props.message}</div>
            </div>
        </div>
    );
}

export default Message;