import React from 'react';
import {string, oneOfType} from 'prop-types';
import './index.css';

import profilepicture from '../../../assets/img/profilepicture.png';

const User = ({name, img}) => {
    return (
        <div className="user flex-center">
            <div className="user-img">
                <img alt="picture" className="cover" src={img ? img : profilepicture} />
            </div>
            <p className="ellipsis user-name">{name}</p>
        </div>
    );
};

User.propTypes = {
    name: string.isRequired,
    img: string
};

User.defaultProps = {
    img: oneOfType([string, null])
};

export default User;
