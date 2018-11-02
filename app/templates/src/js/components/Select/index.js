import React from 'react';
import {arrayOf, node, string, func, bool, oneOfType, any} from 'prop-types';
import './index.css';

const Select = ({children, name, onChange, rowSpan, showError, errorText, title, required, value, defaultValue}) => {
    return (
        <div className={`${rowSpan}-row`}>
            {title && (
                <label className="input-title" htmlFor={`input-${name}`}>
                    {title}
                    {required && <span className="required-input">*</span>}
                </label>
            )}
            <div className="select-holder input-holder">
                <select defaultValue={defaultValue} name={name} onChange={onChange} value={value}>
                    {children}
                </select>
            </div>
            {showError && <div className="error-input-message">{errorText}</div>}
        </div>
    );
};

Select.propTypes = {
    children: arrayOf(node),
    value: oneOfType([any]),
    name: string,
    onChange: func,
    showError: bool,
    errorText: string,
    required: bool,
    title: string,
    rowSpan: string,
    defaultValue: string
};

Select.defaultProps = {
    children: [],
    name: ``,
    value: undefined,
    defaultValue: undefined,
    onChange: () => false,
    showError: false,
    errorText: ``,
    required: false,
    title: null,
    rowSpan: `single`
};

export default Select;
