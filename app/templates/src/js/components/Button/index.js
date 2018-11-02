import React from 'react';
import {func, string} from 'prop-types';
import './index.css';

const Button = ({text, onClick, color}) => {
    return (
        <button className={`form-button ${color ? `form-button-${color} ` : ``}pointer`} onClick={onClick} type="submit">
            {text}
        </button>
    );
};

Button.propTypes = {
    text: string.isRequired,
    onClick: func,
    color: string
};

Button.defaultProps = {
    onClick: () => false,
    color: `blue`
};

export default Button;
