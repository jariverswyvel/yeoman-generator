import React, {Component} from 'react';
import {string, node, func, bool} from 'prop-types';
import './index.css';
import Confirm from '../Confirm';

class ActionButton extends Component {
    state = {
        showConfirm: false
    };

    componentDidMount() {
        const {confirm} = this.props;
        if (confirm) {
            window.addEventListener(`click`, this.handleCloseConfirm);
        }
    }

    componentWillUnmount() {
        const {confirm} = this.props;
        if (confirm) {
            window.removeEventListener(`click`, this.handleCloseConfirm);
        }
    }

    handleCloseConfirm = ({target}) => {
        const {showConfirm} = this.state;
        if (this.button && !this.button.contains(target) && showConfirm) {
            this.handleShowConfirm();
        }
    };

    handleShowConfirm = () => {
        const {showConfirm} = this.state;
        this.setState({showConfirm: !showConfirm});
    };

    render() {
        const {text, onClick, icon, confirm, className, color, iconRight, background} = this.props;
        const {showConfirm} = this.state;

        return (
            <div className="relative">
                <button
                    className={`button-action unselectable flex-center ${className} ${
                        !background ? `button-action-no-bg` : ``
                    } ${color}`}
                    onClick={confirm ? this.handleShowConfirm : onClick}
                    ref={node => (this.button = node)}
                    type="submit">
                    {!iconRight && icon && <p>{icon}</p>}
                    {text && <p>{text}</p>}
                    {iconRight && icon && <p>{icon}</p>}
                </button>
                <Confirm onCancel={this.handleShowConfirm} onDelete={onClick} show={showConfirm} />
            </div>
        );
    }
}

ActionButton.propTypes = {
    text: string,
    className: string,
    color: string,
    onClick: func,
    icon: node,
    confirm: bool,
    iconRight: bool,
    background: bool
};

ActionButton.defaultProps = {
    text: ``,
    onClick: () => false,
    icon: ``,
    className: ``,
    color: `blue`,
    confirm: false,
    iconRight: false,
    background: true
};

export default ActionButton;
