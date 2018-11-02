import 'whatwg-fetch';
import '@babel/polyfill';
import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './containers';

const init = () =>
    render(
        <Router>
            <App />
        </Router>,
        document.querySelector(`.react-mount`)
    );

init();
