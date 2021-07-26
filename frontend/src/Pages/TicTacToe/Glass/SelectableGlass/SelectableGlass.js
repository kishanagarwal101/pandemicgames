import React from 'react';
import redGlass from '../../redGlass.png'
const SelectableGlass = (props) => {
    return (
        <div style={{ transform: props.selectedGlassIndex === props.index ? 'translateY(-30%)' : 'translateY(0)', transition: '0.4s ease' }}
            onClick={() => {
                if (props.weight <= 0) return;
                props.setSelectedGlassIndex(props.index)
            }}
        >
            <img
                src={redGlass}
                alt="RedGlass"
                height={Math.abs(props.weight) * 20}
                style={{
                    transform: 'rotateX(180deg)',
                    cursor: 'pointer',
                    filter: props.selectedGlassIndex === props.index
                        ? 'drop-shadow(2px 2px 0 black) drop-shadow(-2px -2px 0 black)' : 'drop-shadow(10px -10px 3px rgba(0, 0, 0, 0.2))',
                    opacity: props.weight <= 0 ? '0.5' : 1
                }}
            />
        </div>
    );
}

export default SelectableGlass;