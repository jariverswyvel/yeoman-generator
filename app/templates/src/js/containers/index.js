import React, {Fragment} from 'react';
import {hot} from 'react-hot-loader';
import {} from 'prop-types';
<% if (reactRouter) { %>import Routes from '../routes';<% } %>

const App = () => {
    return (
        <% if (reactRouter) { %>
            <Fragment>
                <Routes />
            </Fragment>
        <% } else { %>
            <div>Hello, App</div>
        <% } %>
    );
};

export default hot(module)(App);
