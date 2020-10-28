import React, { Component } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import socketio from 'socket.io-client'

import logo from '../logo/color.svg'
import { buf2hex, ProfileConfig } from '../util'
import { LightSimulation } from '../components/LightSimulation'

type EditProps = RouteChildrenProps<{ lightname: string }>
interface EditState {
    selectedProfileIndex: number
    profiles: ProfileConfig[]
    selectedLayer?: number
    dimensions?: number[]
}
export default class Edit extends Component<EditProps, EditState> {
    state: EditState = { profiles: [], selectedProfileIndex: -1 }
    socket = socketio()
    clearSelection?: () => void
    componentDidMount = async () => {
        let name = this.props.match?.params.lightname
        if (name) this.socket.on(name, (data: ArrayBuffer) => {
            const values = buf2hex(data)
            let pixels = document.querySelectorAll<HTMLDivElement>('.pixelSimulation')
            for (let i = 0; i < pixels.length; i++) {
                let p = pixels[i]
                if (p) p.style.backgroundColor = '#' + values.substr(i * 6, 6)
            }
        })
        let res = await fetch(`/lights/${name}/profiles`)
        let { profiles, selectedProfileIndex, dimensions } = await res.json()
        this.setState({ profiles, selectedProfileIndex, dimensions })
    }

    render = () => {
        let currentProfile = this.state.selectedProfileIndex < 0 ? undefined : this.state.profiles[this.state.selectedProfileIndex]
        let currentLayer = this.state.selectedLayer !== undefined ? currentProfile?.layers[this.state.selectedLayer] : undefined

        return <div id="edit">
            <div style={{ gridArea: 'header' }}>
                <div className="header" >
                    <a href="/">
                        <img src={logo} alt="" />
                    </a>
                    <h1>{this.props.match?.params.lightname}</h1>
                    <select
                        ref={r => { if (r && !currentProfile) r.selectedIndex = 0 }}
                        value={this.state.selectedProfileIndex}
                        onChange={e => {
                            this.setState({ selectedProfileIndex: e.target.selectedIndex, selectedLayer: undefined })
                        }}
                    >
                        {this.state.selectedProfileIndex < 0 ? <option disabled>nessun profilo selezionato</option> : undefined}
                        {this.state.profiles.map(p => <option value={p.name} key={'option' + p.name}>{p.name}</option>)}
                    </select>
                </div>
                <div className="separator" />
            </div>
            <div
                className="layers"
                onClick={e => {
                    // unselects layers on a click on an empty part of the container
                    if (this.clearSelection) this.clearSelection()
                    if (e.target === e.currentTarget) this.setState({ selectedLayer: undefined })
                }}
            >
                {this.state.profiles[this.state.selectedProfileIndex]?.layers.map(
                    // for each layer build the layer selector
                    (layer, i) => <div
                        className={`layerSelector ${i === this.state.selectedLayer ? 'selected' : ''}`}
                        onClick={() => {
                            if (this.state.selectedLayer === i) return
                            if (this.clearSelection) this.clearSelection()
                            this.setState({ selectedLayer: i })
                        }}
                        key={`layer${i}`}
                    >
                        <h1 className="index">{i}</h1>
                        <h1 className="type">{layer.type}</h1>
                    </div>
                )}
            </div>
            <div style={{ gridArea: 'simulation', overflow: 'auto' }}>
                {this.state.dimensions ? <LightSimulation
                    strips={this.state.dimensions}
                    disabled={this.state.selectedLayer === undefined}
                    clearSelection={c => this.clearSelection = c}
                /> : undefined}
            </div>
            <div className="options">
                {currentLayer ? undefined : <h2>select a layer to edit</h2>}
                <button className="save">save</button>
            </div>
        </div>
    }
}