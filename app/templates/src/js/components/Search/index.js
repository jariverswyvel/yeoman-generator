import React from 'react';
import {string, func, bool, objectOf, any, oneOfType} from 'prop-types';
import './index.css';

const Search = ({
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
                <label className="input-title" htmlFor={`input-${name}`}>
                    {title}
                    {required && <span className="required-input">*</span>}
                </label>
            )}
            <div className="input-holder search-input-holder">
                <div className="input-search-icon">
                    <i className="far fa-search" />
                </div>
                <input
                    className={`form-input search-input ${showError ? `error-input` : ``}`}
                    disabled={disabled}
                    id={`input-${name}`}
                    name={name}
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    style={inputStyle}
                    type={type}
                    value={value}
                />
            </div>
            {showError && <div className="error-input-message">{errorText}</div>}
        </div>
    );
};

Search.propTypes = {
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

Search.defaultProps = {
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

export default Search;
