export const formatDate = date => {
    //date must be a string
    const inputDate = new Date(date);
    let dd = inputDate.getDate();
    let mm = inputDate.getMonth() + 1; //January is 0!
    let yyyy = inputDate.getFullYear();

    if (dd < 10) dd = `0` + dd;
    if (mm < 10) mm = `0` + mm;

    return `${dd}-${mm}-${yyyy}`;
};

export const formatDateWithTime = date => {
    //date must be a string
    const inputDate = new Date(date);
    const H = inputDate.getHours() > 10 ? inputDate.getHours() : `0` + inputDate.getHours();
    const i = inputDate.getMinutes() > 10 ? inputDate.getMinutes() : `0` + inputDate.getMinutes();
    let dd = inputDate.getDate();
    let mm = inputDate.getMonth() + 1; //January is 0!
    let yyyy = inputDate.getFullYear();

    if (dd < 10) dd = `0` + dd;
    if (mm < 10) mm = `0` + mm;

    return `${dd}-${mm}-${yyyy} ${H}:${i}`;
};

export const formatDateTextual = date => {
    const dayNames = [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`];
    const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sept`, `Oct`, `Nov`, `Dec`];

    //date must be a string
    const inputDate = new Date(date);
    const H = inputDate.getHours() > 10 ? inputDate.getHours() : `0` + inputDate.getHours();
    const i = inputDate.getMinutes() > 10 ? inputDate.getMinutes() : `0` + inputDate.getMinutes();
    const DDD = dayNames[inputDate.getDay()];
    let dd = inputDate.getDate();
    const MMM = monthNames[inputDate.getMonth()];
    let yyyy = inputDate.getFullYear();

    if (dd < 10) dd = `0` + dd;

    return `${DDD} ${MMM} ${dd} ${yyyy} ${H}:${i}`;
};

export const formatNamedDate = date => {
    const monthNames = [
        `Januari`,
        `Februari`,
        `Maart`,
        `April`,
        `Mei`,
        `Juni`,
        `July`,
        `Augustus`,
        `September`,
        `Oktober`,
        `November`,
        `December`
    ];

    //date must be a string
    const inputDate = new Date(date);
    const dd = inputDate.getDate();
    const mm = inputDate.getMonth() + 1; //January is 0!

    return `${dd} ${monthNames[mm]}`;
};

export const dayRemap = day => (day === 0 ? 6 : day - 1);

export const formatDateReversed = date => {
    //date must be a string
    const inputDate = new Date(date);
    let dd = inputDate.getDate();
    let mm = inputDate.getMonth() + 1; //January is 0!
    let yyyy = inputDate.getFullYear();

    if (dd < 10) dd = `0` + dd;
    if (mm < 10) mm = `0` + mm;

    return `${yyyy}-${mm}-${dd}`;
};

export const millisToDays = millis => {
    return millis / 1000 / 60 / 60 / 24;
};

export const roundNumber = (num, scale) => {
    if (!(`` + num).includes(`e`)) {
        return +(Math.round(num + `e+` + scale) + `e-` + scale);
    } else {
        const arr = (`` + num).split(`e`);
        let sig = ``;
        if (+arr[1] + scale > 0) {
            sig = `+`;
        }
        return +(Math.round(+arr[0] + `e` + sig + (+arr[1] + scale)) + `e-` + scale);
    }
};

export const formatAmount = amount =>
    parseFloat(amount)
        .toLocaleString()
        .replace(/,/g, `.`);

export const formatMoneyString = string =>
    parseFloat(string)
        .toFixed(2)
        .replace(`.`, `,`);

export const parserData = data => {
    if (data === 0) {
        return data;
    } else {
        data = parseFloat(data);
        let dec = ``;
        if (data % 1 === 0) {
            dec = `.00`;
        }
        let num = data.toLocaleString();

        num = `${num}${dec}`;
        const array = num.split(/[,]/);
        let result = `${array[0]}`;
        for (let i = 1; i < array.length; i++) {
            result = `${result}.${array[i]}`;
        }
        const arr = result.split(/[.]/);
        const decimal = arr.pop();
        result = arr.join(`.`);

        if (decimal.length === 1) {
            result = `${result},${decimal}0`;
        } else if (decimal.length >= 3) {
            result = `${result},${decimal.substring(0, 2)}`;
        } else result = `${result},${decimal}`;

        return result;
    }
};

export const isValidDate = date => {
    const matches = /^[0-9]{4}(-|\/)[0-3]{1}[0-9]{1}(-|\/)[0-3]{1}[0-9]{1} [0-9]{2}:[0-9]{2}:[0-9]{2}$/.exec(date);
    if (matches === null) return false;
    else return true;
};

export const isValidCreditCard = cardNumber => {
    const matches = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/.exec(cardNumber);
    if (matches === null) return false;
    else return true;
};

export const isValidPassword = password => {
    const matches = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.exec(password);
    if (matches === null) return false;
    else return true;
};

export const isValidateEmail = email => {
    const matches = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.exec(
        email
    );
    if (matches === null) return false;
    else return true;
};

export const isValidNumber = number => {
    const matches = /-?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?/.exec(number);
    if (matches === null) return false;
    else return true;
};

export const handleShowModal = (modal, environment) => {
    const {[modal]: modalState} = environment.state;
    environment.setState({[modal]: !modalState});
    document.querySelector(`html`).classList.toggle(`no-scroll`);
};

export const handleHideModalAnywhere = ({target}, modal, modalContainer, environment) =>
    target === modalContainer && handleShowModal(modal, environment);

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
