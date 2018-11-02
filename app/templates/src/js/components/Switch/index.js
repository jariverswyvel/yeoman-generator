import React from 'react';
import {string, bool, func} from 'prop-types';
import './index.css';

const Switch = ({title, checked, rowSpan, onSwitch, name}) => {
    return (
        <div
            className={`flex-center ${rowSpan}-row space-between switch-container pointer`}
            onClick={() => onSwitch(name, !checked)}>
            <label className="input-title pointer">{title}</label>
            <div className="switch pointer">
                <i className={`fal fa-toggle-${checked ? `on` : `off`}`} />
            </div>
        </div>
    );
};

Switch.propTypes = {
    checked: bool,
    title: string,
    onSwitch: func,
    name: string,
    rowSpan: string
};

Switch.defaultProps = {
    checked: false,
    title: null,
    onSwitch: () => false,
    name: ``,
    rowSpan: `single`
};

export default Switch;
