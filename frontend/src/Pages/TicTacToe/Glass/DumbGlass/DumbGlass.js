import React from 'react';
import redGlass from '../../redGlass.png';
import blueGlass from '../../blueGlass.png';
const DumbGlass = (props) => {
    return (
        <div>
            <img
                src={props.color === "RED" ? redGlass : blueGlass}
                alt={props.color === "RED" ? "redGlass" : "blueGlass"}
                height={props.weight * 20}
                style={{
                    transform: 'rotateX(180deg)'
                }}
            />
        </div>
    );
}

export default DumbGlass;