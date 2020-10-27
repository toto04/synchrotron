import React, { Component } from 'react'
import { createBrowserHistory } from 'history'
import { Router, Route, Switch } from 'react-router-dom'

import Edit from './routes/Edit'
import Home from './routes/Home'

let history = createBrowserHistory()

export default class App extends Component {
    render = () => <Router history={history}>
        <Switch>
            <Route path="/edit/:lightname" component={Edit} />
            <Route exact path='/' component={Home}>
            </Route>
        </Switch>
    </Router>
}
