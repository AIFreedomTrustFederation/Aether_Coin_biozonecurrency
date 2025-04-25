import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import MerchPage from '../pages/MerchPage';

const AppRouter = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={HomePage} />
      <Route path="/merch" component={MerchPage} />
    </Switch>
  </Router>
);

export default AppRouter;