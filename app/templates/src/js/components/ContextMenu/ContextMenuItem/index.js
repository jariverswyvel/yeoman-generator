import React from 'react';
import {func, string, node} from 'prop-types';
import './index.css';

const ContextMenuItem = ({title, onClick, icon}) => {
    return (
        <li className="contextmenu-item pointer flex-center" onClick={onClick}>
            {icon && icon}
            {title && <p>{title}</p>}
        </li>
    );
};

ContextMenuItem.propTypes = {
    onClick: func,
    icon: node,
    title: string
};

ContextMenuItem.defaultProps = {
    onClick: () => false,
    icon: null,
    title: null
};

export default ContextMenuItem;
