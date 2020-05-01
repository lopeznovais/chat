import React from 'react'

import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom"

import Join from "./components/Join/Join";
import Chat from "./components/Chat/Chat";

const Routes = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={Join}/>
            <Route path="/chat" component={Chat}/>
        </Switch>
    </BrowserRouter>
)

export default Routes