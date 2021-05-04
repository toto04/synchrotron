import React, { Component } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import Modal from 'react-modal'

import logo from '../assets/color.svg'
import add from '../assets/add.svg'
import { blob2hex } from '../util'
import { LayerConfig, PixelIndex, ProfileConfig } from 'typedefs'
import ConfirmModal from '../components/generics/ConfirmModal'
import LightSimulation from '../components/LightSimulation'
import ProfileSelector from '../components/ProfileSelector'
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
    deletingProfile: boolean
}
export default class Edit extends Component<EditProps, EditState> {
    name: string = this.props.match?.params.lightname ?? '_'
    state: EditState = {
        profiles: [],
        selectedProfileIndex: -1,
        creatingNewLayer: false,
        deletingProfile: false,
    }
    ws = new WebSocket(process.env.NODE_ENV === 'production' ? `ws://${window.location.host}` : 'ws://localhost:2077', this.name)
    clearSelection?: () => void
    resetSelection?: () => void
    selectFromLayer?: (layer: LayerConfig) => void
    componentDidMount = async () => {
        this.ws.addEventListener('message', async ev => {
            const values = await blob2hex(ev.data)
            let pixels = document.querySelectorAll<HTMLDivElement>('.pixelSimulation')
            for (let i = 0; i < pixels.length; i++) {
                let p = pixels[i]
                if (p) p.style.backgroundColor = '#' + values.substr(i * 6, 6)
            }
        })

        this.reloadConfig()
    }

    reloadConfig = async () => {
        let res = await fetch(`/lights/${this.name}/profiles`)
        let { profiles, selectedProfileIndex, dimensions } = await res.json()
        this.setState({
            profiles,
            selectedProfileIndex,
            dimensions,
            creatingNewLayer: false,
            deletingProfile: false,
            selectedLayer: undefined
        })
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
                    <ProfileSelector
                        lightName={this.name}
                        profiles={this.state.profiles.map(p => p.name)}
                        onProfileSelected={(profile, selectedProfileIndex) => {
                            this.setState({ selectedProfileIndex, selectedLayer: undefined })
                            fetch(`/lights/${this.name}/profile`, {
                                method: 'post',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify({ profile })
                            })
                        }}
                        selectedProfileIndex={this.state.selectedProfileIndex}
                    />
                </div>
                <div className="separator" />
            </div>
            <div
                className="layers"
                onClick={e => {
                    // unselects layers on a click on an empty part of the container
                    let element: any = e.target
                    if (this.clearSelection) this.clearSelection()
                    if (e.target === e.currentTarget || element.className === "newLayer") this.setState({ selectedLayer: undefined })
                }}
            >
                {this.renderLayerSelectors()}
                {currentProfile ? <div className="newLayer">
                    <img className="addImage" src={add} alt="" onClick={() => {
                        this.setState({ creatingNewLayer: true })
                    }} />
                </div> : undefined}
                {currentProfile ? <div
                    className="deleteButton"
                    onClick={e => {
                        if (e.target === e.currentTarget)
                            this.setState({ deletingProfile: true })
                    }}
                >
                    delete profile
                    <ConfirmModal
                        isOpen={this.state.deletingProfile}
                        title="delete profile"
                        message="do you want to delete this profile and all its layers? this action is not reversible"
                        onClose={() => {
                            console.log(this.state.deletingProfile)
                            this.setState({ deletingProfile: false })
                        }}
                        onConfirm={async () => {
                            await fetch(`/lights/${this.name}/profile/${currentProfile?.name}`, {
                                method: 'delete',
                                headers: { 'Content-type': 'application/json' }
                            })
                            this.reloadConfig()
                        }}
                        destructive
                    />
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
                resetChangedIndexes={() => this.setState({ changedIndexes: undefined })}
                deleteLayer={async () => {
                    await fetch(`/lights/${this.name}/layers/${this.state.selectedLayer}`, {
                        method: 'delete',
                        headers: { 'Content-type': 'application/json' }
                    })
                    this.reloadConfig()
                }}
            />
            <Modal
                isOpen={this.state.creatingNewLayer}
                style={{
                    overlay: { backgroundColor: '#000C' }
                }}
                ariaHideApp={false}
                shouldFocusAfterRender={false}
                className="modal"
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
                            {Object.keys(layerTypes).map(t => <option value={t} key={`newlayer${t}`} >{t}</option>)}
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
                        selectedLayer: currentProfile!.layers.length - 1,
                        selectedNewLayerType: undefined,
                        creatingNewLayer: false
                    })
                }}>create</button>
            </Modal>
        </div>
    }
}