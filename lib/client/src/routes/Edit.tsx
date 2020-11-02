import React, { Component } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import socketio from 'socket.io-client'

import logo from '../logo/color.svg'
import { buf2hex, LayerConfig, PixelIndex, ProfileConfig } from '../util'
import { LightSimulation } from '../components/LightSimulation'
import getOptionContainer from '../components/layerOptionsSelectors'

type EditProps = RouteChildrenProps<{ lightname: string }>
interface EditState {
    selectedProfileIndex: number
    profiles: ProfileConfig[]
    changedIndexes?: PixelIndex[]
    selectedLayer?: number
    dimensions?: number[]
}
export default class Edit extends Component<EditProps, EditState> {
    name: string = this.props.match?.params.lightname ?? '_'
    state: EditState = { profiles: [], selectedProfileIndex: -1 }
    socket = socketio()
    clearSelection?: () => void
    resetSelection?: () => void
    selectFromLayer?: (layer: LayerConfig) => void
    componentDidMount = async () => {
        if (this.name) this.socket.on(this.name, (data: ArrayBuffer) => {
            const values = buf2hex(data)
            let pixels = document.querySelectorAll<HTMLDivElement>('.pixelSimulation')
            for (let i = 0; i < pixels.length; i++) {
                let p = pixels[i]
                if (p) p.style.backgroundColor = '#' + values.substr(i * 6, 6)
            }
        })
        let res = await fetch(`/lights/${this.name}/profiles`)
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
                            // if (this.selectFromLayer) this.selectFromLayer(this.state.profiles[this.state.selectedProfileIndex].layers[i])
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
                    defaultIndexes={currentLayer?.pixelIndexes}
                    resetSelection={r => this.resetSelection = r}
                    onSelection={changedIndexes => this.setState({ changedIndexes })}
                    onReset={() => this.setState({ changedIndexes: undefined })}
                /> : undefined}
            </div>
            <div className="options">
                {currentLayer
                    ? <div style={{ width: '100%' }}>
                        <div className="selectedIndexes">
                            {this.state.changedIndexes
                                ? <h3>{`You changed the pixels affected by this layer (${this.state.changedIndexes.length})`}</h3>
                                : <h3>{`This layer affects ${currentLayer.pixelIndexes.length} pixels`} <br /> drag to select</h3>
                            }
                            <div className="doubleButton">
                                <button onClick={this.resetSelection} disabled={!this.state.changedIndexes}>reset</button>
                                <button className="save" disabled={!this.state.changedIndexes} onClick={async () => {
                                    // Sets the new affected pixels
                                    currentLayer!.pixelIndexes = this.state.changedIndexes!
                                    await fetch(`/lights/${this.name}/layers/${this.state.selectedLayer}/indexes`, {
                                        method: 'post',
                                        headers: { 'Content-type': 'application/json' },
                                        body: JSON.stringify({ indexes: this.state.changedIndexes })
                                    })
                                    this.setState({ changedIndexes: undefined })
                                }}>apply</button>
                            </div>
                        </div>
                        {getOptionContainer(currentLayer.type, currentLayer.options, async options => {
                            currentLayer!.options = options
                            await fetch(`/lights/${this.name}/layers/${this.state.selectedLayer}/options`, {
                                method: 'post',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify({ options })
                            })
                        })}
                    </div>
                    : <h2>select a layer to edit</h2>}
            </div>
        </div>
    }
}