import React, { Component } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import socketio from 'socket.io-client'
import Modal from 'react-modal'

import logo from '../logo/color.svg'
import add from '../logo/add.svg'
import { buf2hex, LayerConfig, PixelIndex, ProfileConfig } from '../util'
import LightSimulation from '../components/LightSimulation'
import OptionSelector from '../components/OptionsSelector'
import { layerTypes } from '../components/layers'

type EditProps = RouteChildrenProps<{ lightname: string }>
interface EditState {
    selectedProfileIndex: number
    profiles: ProfileConfig[]
    changedIndexes?: PixelIndex[]
    selectedLayer?: number
    dimensions?: number[]
    creatingNewLayer: boolean
    selectedNewLayerType?: string
}
export default class Edit extends Component<EditProps, EditState> {
    name: string = this.props.match?.params.lightname ?? '_'
    state: EditState = {
        profiles: [],
        selectedProfileIndex: -1,
        creatingNewLayer: false
    }
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

    renderLayerSelectors = () => this.state.profiles[this.state.selectedProfileIndex]?.layers.map(
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
    )

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
                {this.renderLayerSelectors()}
                {currentProfile ? <div className="newLayer">
                    <img src={add} alt="" onClick={() => {
                        this.setState({ creatingNewLayer: true })
                    }} />
                </div> : undefined}
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
            <OptionSelector
                name={this.name}
                selectedLayer={this.state.selectedLayer}
                currentLayer={currentLayer}
                changedIndexes={this.state.changedIndexes}
                resetSelection={this.resetSelection}
            />
            <Modal
                isOpen={this.state.creatingNewLayer}
                style={{
                    overlay: {
                        backgroundColor: '#000C'
                    }
                }}
                ariaHideApp={false}
                shouldFocusAfterRender={false}
                className="newLayerModal"
                onRequestClose={() => this.setState({ creatingNewLayer: false })}
                shouldCloseOnEsc
                shouldCloseOnOverlayClick
            >
                <h2>Add a new layer</h2>
                <div className="newLayerSelectContainer">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        function:
                        <select onChange={e => {
                            this.setState({ selectedNewLayerType: e.target.value })
                        }}>
                            {Object.keys(layerTypes).map(t => <option value={t} >{t}</option>)}
                        </select>
                    </div>
                    <p>{layerTypes[this.state.selectedNewLayerType ?? 'static'].description}</p>
                </div>
                <button className="save" onClick={() => {
                    let newLayerConfig = layerTypes[this.state.selectedNewLayerType ?? 'static'].createDefaultConfig()
                    currentProfile!.layers.push(newLayerConfig)
                    fetch(`/lights/${this.name}/layers`, {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ config: newLayerConfig })
                    })
                    this.setState({
                        selectedNewLayerType: undefined,
                        creatingNewLayer: false
                    })
                }}>create</button>
            </Modal>
        </div>
    }
}