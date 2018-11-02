import React from 'react';
import {node, string, bool} from 'prop-types';

const ModalTitle = ({icon, title, right}) => {
    return (
        <h2 className="modal-title">
            {!right && icon} {title} {right && icon}
        </h2>
    );
};

ModalTitle.propTypes = {
    title: string,
    icon: node,
    right: bool
};

ModalTitle.defaultProps = {
    title: null,
    icon: null,
    right: false
};

export default ModalTitle;
