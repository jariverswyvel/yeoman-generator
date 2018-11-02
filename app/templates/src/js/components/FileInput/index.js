import React from 'react';
import {string, func, bool, node, objectOf, any} from 'prop-types';
import './index.css';

const FileInput = ({title, icon, onChange, name, showError, errorText, inputStyle, required, disabled, rowSpan}) => {
    return (
        <div className={`${rowSpan}-row`}>
            {title && (
                <label className="file-input-title flex-center" htmlFor={`file-input-${name}`}>
                    {icon}
                    {title}
                    {required && <span className="required-input">*</span>}
                </label>
            )}
            <div className="input-holder">
                <input
                    className={`form-input hide-file-input ${showError ? `error-input` : ``}`}
                    disabled={disabled}
                    id={`file-input-${name}`}
                    name={name}
                    onChange={onChange}
                    style={inputStyle}
                    type="file"
                />
            </div>
            {showError && <div className="error-input-message">{errorText}</div>}
        </div>
    );
};

FileInput.propTypes = {
    title: string,
    icon: node,
    onChange: func,
    name: string,
    showError: bool,
    errorText: string,
    inputStyle: objectOf(any),
    required: bool,
    disabled: bool,
    rowSpan: string
};

FileInput.defaultProps = {
    title: null,
    icon: null,
    onChange: () => false,
    name: ``,
    showError: false,
    errorText: ``,
    inputStyle: {},
    required: false,
    disabled: false,
    rowSpan: `single`
};

export default FileInput;
