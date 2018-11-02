import React from 'react';
import {string, func, bool, objectOf, any, oneOfType} from 'prop-types';
import './index.css';

const Input = ({
    title,
    placeholder,
    onChange,
    type,
    name,
    showError,
    errorText,
    value,
    onEnter,
    inputStyle,
    required,
    disabled,
    rowSpan
}) => {
    const handleKeyPress = e => e.key === `Enter` && onEnter();

    return (
        <div className={`${rowSpan}-row`}>
            {title && (
                <label className="input-title ellipsis" htmlFor={`input-${name}`}>
                    {title}
                    {required && <span className="required-input">*</span>}
                </label>
            )}
            <div className="input-holder">
                <input
                    className={`form-input ${showError ? `error-input` : ``}`}
                    disabled={disabled}
                    id={`input-${name}`}
                    min="0"
                    name={name}
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    step="1"
                    style={inputStyle}
                    type={type}
                    value={value}
                />
            </div>
            {showError && <div className="error-input-message">{errorText}</div>}
        </div>
    );
};

Input.propTypes = {
    title: string,
    placeholder: string,
    onChange: func,
    type: string,
    name: string,
    showError: bool,
    errorText: string,
    value: oneOfType([any]),
    onEnter: func,
    inputStyle: objectOf(any),
    required: bool,
    disabled: bool,
    rowSpan: string
};

Input.defaultProps = {
    title: null,
    placeholder: ``,
    onChange: () => false,
    type: `text`,
    name: ``,
    showError: false,
    errorText: ``,
    value: undefined,
    onEnter: () => false,
    inputStyle: {},
    required: false,
    disabled: false,
    rowSpan: `single`
};

export default Input;
