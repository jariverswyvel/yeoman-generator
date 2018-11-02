import React from 'react';
import {number, func} from 'prop-types';

const FadedDay = ({day, setMonth}) => {
    return (
        <div className="datepicker-day datepicker-day_faded" onClick={setMonth} style={{opacity: 0.3}}>
            <p>{day}</p>
        </div>
    );
};

FadedDay.propTypes = {
    day: number.isRequired,
    setMonth: func.isRequired
};

export default FadedDay;
