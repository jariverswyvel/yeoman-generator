import React from 'react';
import {instanceOf, func, number, string, oneOfType} from 'prop-types';
import {formatDate} from '../../../lib/helpers';

const Day = ({today, date, selectDate, index, selectedDate}) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const todayDate = new Date();

    const todayDay = todayDate.getDate();
    const todayMonth = todayDate.getMonth();
    const todayYear = todayDate.getFullYear();

    const todayWithoutTime = new Date(todayYear, todayMonth, todayDay);
    const componentDate = new Date(year, month, index);

    return (
        <div
            className={`datepicker-day ${
                formatDate(selectedDate) === formatDate(componentDate) ? `datepicker-day_selected` : ``
            } ${formatDate(todayWithoutTime) === formatDate(componentDate) ? `datepicker-day_today` : ``}`}
            onClick={() => selectDate(componentDate)}>
            <p>{index}</p>
        </div>
    );
};

Day.propTypes = {
    selectedDate: oneOfType([instanceOf(Date), string]),
    today: instanceOf(Date).isRequired,
    date: instanceOf(Date).isRequired,
    selectDate: func.isRequired,
    index: number.isRequired
};

Day.defaultProps = {
    selectedDate: null
};

export default Day;
