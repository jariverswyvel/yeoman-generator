import React from 'react';
import {string, objectOf, any} from 'prop-types';
import './index.css';
import {handleShowModal} from '../../lib/helpers';

const ModalHeader = ({modalName, environment}) => {
    return (
        <header className="modal-header">
            <i className="fal fa-times pointer" onClick={() => handleShowModal(modalName, environment)} />
        </header>
    );
};

ModalHeader.propTypes = {modalName: string.isRequired, environment: objectOf(any).isRequired};

export default ModalHeader;
