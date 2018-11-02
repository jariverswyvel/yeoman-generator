import React from 'react';
import {node, arrayOf, number, objectOf, bool, func} from 'prop-types';
import './index.css';

const ContextMenu = ({children, position, show, showContextMenu}) => {
    if (show) {
        window.addEventListener(`click`, showContextMenu);
    } else {
        window.removeEventListener(`click`, showContextMenu);
    }

    if (show) {
        const {x, y} = position;
        return (
            <div className="contextmenu" style={{top: y, left: x}}>
                <ul>{children}</ul>
            </div>
        );
    } else return null;
};

ContextMenu.propTypes = {
    children: arrayOf(node).isRequired,
    position: objectOf(number),
    showContextMenu: func.isRequired,
    show: bool
};

ContextMenu.defaultProps = {
    show: false,
    position: {x: 0, y: 0}
};

export default ContextMenu;
