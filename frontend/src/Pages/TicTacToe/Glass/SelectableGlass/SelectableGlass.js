import React from 'react';
import redGlass from '../../redGlass.png'
const SelectableGlass = (props) => {
    return (
        <div>
            <img
                src={redGlass}
                alt="RedGlass"
                height={props.weight * 20}
                style={{
                    transform: 'rotateX(180deg)',
                    cursor: 'pointer'
                }}
            />
        </div>
    );
}

export default SelectableGlass;