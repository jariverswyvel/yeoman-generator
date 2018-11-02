import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Home from '../views/Home';
import ErrorPage from '../views/Error';

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/" component={Home} />
            <Route component={ErrorPage} />
        </Switch>
    );
};

Routes.propTypes = {};

export default Routes;
