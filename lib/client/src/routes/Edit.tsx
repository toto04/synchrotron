import React, { Component } from 'react'
import { RouteChildrenProps } from 'react-router-dom'

import logo from '../logo/color.svg'
export type PixelIndex = [number, number]
export interface LayerConfig {
    type: string,
    options: any,
    pixelIndexes: PixelIndex[]
}
export interface ProfileConfig {
    light: string
    name: string
    layers: LayerConfig[]
}

type EditProps = RouteChildrenProps<{ lightname: string }>
interface EditState {
    selectedProfileIndex: number
    profiles: ProfileConfig[]
    selectedLayer?: number
}
export default class Edit extends Component<EditProps, EditState> {
    state: EditState = { profiles: [], selectedProfileIndex: -1 }
    componentDidMount = async () => {
        // on component mount fetch all profiles of the light
        let res = await fetch(`/lights/${this.props.match?.params.lightname}/profiles`)
        let { profiles, selectedProfileIndex } = await res.json()
        this.setState({ profiles, selectedProfileIndex })
    }

    render = () => {
        return <div id="edit">
            <div style={{ gridArea: 'header' }}>
                <div className="header" >
                    <a href="/">
                        <img src={logo} alt="" />
                    </a>
                    <h1>{this.props.match?.params.lightname}</h1>
                    <select
                        ref={r => { if (r && this.state.selectedProfileIndex < 0) r.selectedIndex = 0 }}
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
                    if (e.target === e.currentTarget) this.setState({ selectedLayer: undefined })
                }}
            >
                {this.state.profiles[this.state.selectedProfileIndex]?.layers.map(
                    // for each layer build the layer selector
                    (layer, i) => <div
                        className={`layerSelector ${i === this.state.selectedLayer ? 'selected' : ''}`}
                        onClick={() => this.setState({ selectedLayer: i })} // on click select the layer
                        key={`layer${i}`}
                    >
                        <h1 className="index">{i}</h1>
                        <h1 className="type">{layer.type}</h1>
                    </div>
                )}
            </div>
        </div>
    }
}