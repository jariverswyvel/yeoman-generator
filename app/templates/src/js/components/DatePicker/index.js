import React, {Component} from 'react';

import {string, func, bool, objectOf, any, oneOfType} from 'prop-types';

import './index.css';

import {dayRemap, formatDate} from '../../lib/helpers';
import FadedDay from './FadedDay';
import Day from './Day';
import Picker from './Picker';

class DatePicker extends Component {
    state = {
        showDatePicker: false,
        date: new Date(),
        today: new Date(),
        selectedDate: this.props.value ? this.props.value : ``,
        position: {top: 0, left: 0}
    };

    componentDidMount() {
        this.generateDays();
        this.getPosition();
    }

    getPosition = () => {
        let {top, left} = this.getOffset(this.datepickerInput);

        if (top + 420 >= window.innerHeight) {
            top = window.innerHeight - 420;
        }

        if (top <= 0) {
            top = 25;
        }

        this.setState({position: {top, left}});
    };

    getOffset = el => {
        const {left, top} = el.getBoundingClientRect();

        return {
            left: left,
            top: top + this.datepickerInput.clientHeight + 10
        };
    };

    weeks = [];

    handleKeyPress = e => e.key === `Enter` && this.props.onEnter();

    daysInMonth = () => {
        const {date} = this.state;
        const month = date.getMonth();
        const year = date.getFullYear();
        return new Date(year, month + 1, 0).getDate();
    };

    selectDate = selectedDate => {
        const {onChange, name} = this.props;
        selectedDate.setHours(0, 0, 0, 0);
        onChange({target: {value: selectedDate, name}});
        this.setState({selectedDate, date: selectedDate}, () => this.generateDays());
    };

    generateDays = () => {
        const {date, today, selectedDate} = this.state;

        const daysInMonth = this.daysInMonth();

        const currentMonth = new Date(date.getFullYear(), date.getMonth(), daysInMonth);
        let currentMonthEnd = dayRemap(currentMonth.getDay());

        const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
        let prevMonthBegin = dayRemap(prevMonth.getDay());

        const days = [];

        if (prevMonthBegin !== 6) {
            while (prevMonthBegin >= 0) {
                days.push(
                    <FadedDay day={prevMonth.getDate() - prevMonthBegin} key={prevMonthBegin * 100} setMonth={this.prevMonth} />
                );
                prevMonthBegin--;
            }
        }

        for (let i = 1; i <= daysInMonth; i += 1) {
            days.push(
                <Day date={date} index={i} key={i} selectDate={this.selectDate} selectedDate={selectedDate} today={today} />
            );
        }

        for (let i = 1; currentMonthEnd < 6; i++) {
            days.push(<FadedDay day={i} key={currentMonthEnd * 121} setMonth={this.nextMonth} />);
            currentMonthEnd++;
        }

        const perChunk = 7;

        const weeks = days.reduce((resultArray, item, index) => {
            const chunkIndex = Math.floor(index / perChunk);

            if (!resultArray[chunkIndex]) {
                resultArray[chunkIndex] = [];
            }

            resultArray[chunkIndex].push(item);

            return resultArray;
        }, []);

        this.weeks = weeks;
        this.forceUpdate();
    };

    prevMonth = () => {
        const {date} = this.state;
        const month = date.getMonth();
        const year = date.getFullYear();
        const prevMonth = new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1);
        this.setState({date: prevMonth}, () => this.generateDays());
    };

    nextMonth = () => {
        const {date} = this.state;
        const month = date.getMonth();
        const year = date.getFullYear();
        const nextMonth = new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1);
        this.setState({date: nextMonth}, () => this.generateDays());
    };

    handleShowDatePicker = () => {
        this.getPosition();

        const {showDatePicker} = this.state;
        this.setState({showDatePicker: !showDatePicker});
        document.querySelector(`body`).classList.toggle(`no-scroll`);
    };

    render() {
        const {
            title,
            placeholder,
            onChange,
            type,
            name,
            showError,
            errorText,
            inputStyle,
            required,
            disabled,
            rowSpan
        } = this.props;

        const {showDatePicker, position, date, selectedDate} = this.state;

        return (
            <div className={`${rowSpan}-row`} ref={node => (this.datepickerInput = node)}>
                {title && (
                    <label className="input-title" htmlFor={`input-${name}`}>
                        {title}
                        {required && <span className="required-input">*</span>}
                    </label>
                )}
                <div className="input-holder">
                    <input
                        autoComplete="off"
                        className={`form-input ${showError ? `error-input` : ``}`}
                        disabled={disabled}
                        id={`input-${name}`}
                        name={name}
                        onChange={onChange}
                        onClick={this.handleShowDatePicker}
                        onKeyPress={this.handleKeyPress}
                        placeholder={placeholder}
                        ref={node => (this.input = node)}
                        style={inputStyle}
                        type={type}
                        value={selectedDate ? formatDate(selectedDate) : ``}
                    />
                </div>
                {showError && <div className="error-input-message">{errorText}</div>}
                {showDatePicker && (
                    <Picker
                        date={date}
                        handleShowDatePicker={this.handleShowDatePicker}
                        nextMonth={this.nextMonth}
                        position={position}
                        prevMonth={this.prevMonth}
                        selectDate={this.selectDate}
                        selectedDate={selectedDate}
                        weeks={this.weeks}
                    />
                )}
            </div>
        );
    }
}

DatePicker.propTypes = {
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

DatePicker.defaultProps = {
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

export default DatePicker;
