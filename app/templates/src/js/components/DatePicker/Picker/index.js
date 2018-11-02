import React, {Component} from 'react';
import {instanceOf, func, oneOfType, string} from 'prop-types';
import {render, unmountComponentAtNode} from 'react-dom';

import ActionButton from '../../ActionButton';
import {dayRemap} from '../../../lib/helpers';

class Picker extends Component {
    state = {
        showYearPicker: false,
        selectedYear: this.props.selectedDate ? this.props.selectedDate.getFullYear() : new Date().getFullYear()
    };

    componentDidMount() {
        const {selectDate, selectedDate} = this.props;
        if (!selectedDate || selectedDate === ``) {
            selectDate(new Date());
        }
        this.generateYears();
        this.picker = document.createElement('div');
        this.picker.classList.add(`datepicker-wrapper`);
        this.picker.addEventListener(`click`, this.handleClickAway);
        document.body.appendChild(this.picker);
        this.renderPickerContent(this.props);
    }

    componentDidUpdate() {
        this.renderPickerContent(this.props);
        const {selectedYear} = this.state;
        const {selectedDate} = this.props;
        if (selectedDate && selectedYear !== selectedDate.getFullYear()) {
            this.setState({selectedYear: selectedDate.getFullYear()});
        }
    }

    componentWillUnmount() {
        this.picker.classList.add(`datepicker-willunmount`);
        setTimeout(() => {
            document.body.removeChild(this.picker);
            unmountComponentAtNode(this.picker);
        }, 250);
    }

    years = [];

    dayNames = [`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`];

    //prettier-ignore
    monthNames = [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`];

    parseDate = date => {
        const month = this.monthNames[date.getMonth()];
        const day = this.dayNames[dayRemap(date.getDay())];
        const year = date.getFullYear();

        return {
            month,
            day,
            year
        };
    };

    generateYears = () => {
        const currentYear = new Date().getFullYear();

        for (let i = 1970; i < currentYear + 101; i++) {
            this.years.push(i);
        }
    };

    handleClickAway = ({target}) => target === this.picker && this.props.handleShowDatePicker();

    handleShowYearPicker = () => {
        const {showYearPicker} = this.state;

        if (showYearPicker) {
            this.yearpicker.classList.add(`yearpicker-willunmount`);
            setTimeout(() => {
                this.setState({showYearPicker: !showYearPicker});
            }, 250);
        } else {
            this.setState({showYearPicker: !showYearPicker});
        }
    };

    handleClickYear = year => {
        const {selectDate, selectedDate} = this.props;
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();

        selectDate(new Date(year, month, day));
        this.handleShowYearPicker();
    };

    scrollToSelectedYear = () => {
        // console.log(this.yearpicker, this.yearpickerList);
        // this.yearpickerList.scrollTo(this.selectedYear);
    };

    renderPickerContent = props => {
        const {position, weeks, handleShowDatePicker, nextMonth, prevMonth, date, selectedDate} = props;
        const {showYearPicker, selectedYear} = this.state;
        const {month, year} = this.parseDate(date);
        this.scrollToSelectedYear();

        render(
            <div
                className="datepicker"
                onClick={() => showYearPicker && this.handleShowYearPicker()}
                style={{top: position.top, left: position.left}}>
                <div className="flex-center space-between datepicker-header">
                    <div className="datepicker-month-year flex-center">
                        <p className="pointer" onClick={this.handleShowYearPicker}>
                            {selectedYear}
                        </p>
                        {showYearPicker && (
                            <div className="datepicker-yearpicker" ref={node => (this.yearpicker = node)}>
                                <ul className="datepicker-yearpicker-list" ref={node => (this.yearpickerList = node)}>
                                    {this.years.map(year => (
                                        <li
                                            className={selectedYear === year ? `datepicker-yearpicker_selected` : ``}
                                            key={year}
                                            onClick={() => this.handleClickYear(year)}
                                            ref={node => {
                                                if (selectedYear === year && node) {
                                                    // console.log(node);
                                                }
                                            }}>
                                            {year}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* <p className="datepicker-title">Select a date</p> */}
                    <div className="flex-center">
                        <div className="datepicker-month-year flex-center">
                            <p>{month}</p>&nbsp;&nbsp;<p className="pointer">{year}</p>
                        </div>
                        <div className="flex-center space-between datepicker-header-actions">
                            <i className="far fa-long-arrow-left pointer" onClick={prevMonth} />
                            <i className="far fa-long-arrow-right pointer" onClick={nextMonth} />
                        </div>
                    </div>
                </div>
                <div className="datepicker-week">
                    {this.dayNames.map(day => (
                        <div className="datepicker-day" key={day}>
                            <p>{day}</p>
                        </div>
                    ))}
                </div>
                <div>
                    {weeks.map((week, index) => (
                        <div className="datepicker-week" key={index}>
                            {week.map(day => day)}
                        </div>
                    ))}
                </div>
                <div className="flex-center datepicker-actions">
                    <ActionButton icon={<i className="fal fa-mouse-pointer" />} onClick={handleShowDatePicker} text="Select" />
                    <ActionButton
                        color="red"
                        icon={<i className="fal fa-times" />}
                        onClick={handleShowDatePicker}
                        text="Cancel"
                    />
                </div>
            </div>,
            this.picker
        );
    };

    render() {
        return null;
    }
}

Picker.propTypes = {
    selectedDate: oneOfType([instanceOf(Date), string]).isRequired,
    // date: instanceOf(Date).isRequired,
    handleShowDatePicker: func.isRequired,
    selectDate: func.isRequired
};

export default Picker;
