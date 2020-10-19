import React, { Component } from 'react'
import { } from 'react-router-dom'
import logo from './logo/color.svg'

import LightControl, { LightState } from './components/LightControl'

interface AppState {
    lights: LightState[]
}

export default class App extends Component<{}, AppState> {
    state: AppState = { lights: [] }

    componentDidMount = async () => {
        let res = await fetch('/lights')
        let lights = await res.json()
        this.setState({ lights })
    }
    render = () => <div>
        <header>
            <img src={logo} alt="" />
            <h1>synchrotron</h1>
        </header>
        <div className="lightControlContainer">
            {this.state.lights.map(l => <LightControl {...l} key={l.name} />)}
        </div>
    </div>
}
