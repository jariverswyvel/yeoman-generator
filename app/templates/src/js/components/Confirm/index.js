import React from 'react';
import {func, bool} from 'prop-types';
import './index.css';

const Confirm = ({onDelete, onCancel, show}) => {
    if (show) {
        return (
            <div className="confirm-menu confirm-container">
                <ul className="confirm-menu-list">
                    <li
                        className="confirm-menu-list-item flex-center space-between pointer unselectable"
                        onClick={() => {
                            onDelete();
                            onCancel();
                        }}>
                        Delete <i className="fal fa-trash-alt" />
                    </li>
                    <li
                        className="confirm-menu-list-item pointer flex-center space-between unselectable"
                        onClick={() => {
                            onCancel();
                        }}>
                        Cancel <i className="fas fa-ban" />
                    </li>
                </ul>
            </div>
        );
    } else {
        return null;
    }
};

Confirm.propTypes = {
    onDelete: func.isRequired,
    onCancel: func.isRequired,
    show: bool
};

Confirm.defaultProps = {
    show: false
};

export default Confirm;
