import React, { Component } from 'react'

import LightControl, { LightState } from '../components/LightControl'
import logo from '../logo/color.svg'

interface HomeState {
    lights: LightState[]
}

export default class Home extends Component<{}, HomeState> {
    state: HomeState = { lights: [] }
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