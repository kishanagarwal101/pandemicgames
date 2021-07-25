import React, { useEffect } from 'react';

const TicTacToe = (props) => {
    useEffect(() => {
        console.log(props);
    }, [props]);
    return (
        <div>TICTACTOE</div>
    );
}

export default TicTacToe;

