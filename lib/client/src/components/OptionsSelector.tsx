import React, { Component } from 'react'
import { LayerConfig, PixelIndex } from '../util'

import { layerTypes } from './layers'

interface OptionsSelectorProps {
    name: string
    currentLayer?: LayerConfig
    selectedLayer?: number
    changedIndexes?: PixelIndex[]
    resetSelection?: () => void
}

export default class OptionsSelector extends Component<OptionsSelectorProps> {
    render = () => {
        let currentLayer = this.props.currentLayer
        return <div className="options">
            {currentLayer
                ? <div style={{ width: '100%' }}>
                    <div className="selectedIndexes">
                        {this.props.changedIndexes
                            ? <h3>{`You changed the pixels affected by this layer (${this.props.changedIndexes.length})`}</h3>
                            : <h3>{`This layer affects ${currentLayer.pixelIndexes.length} pixels`} <br /> drag to select</h3>
                        }
                        <div className="doubleButton">
                            <button onClick={this.props.resetSelection} disabled={!this.props.changedIndexes}>reset</button>
                            <button className="save" disabled={!this.props.changedIndexes} onClick={async () => {
                                // Sets the new affected pixels
                                currentLayer!.pixelIndexes = this.props.changedIndexes!
                                await fetch(`/lights/${this.props.name}/layers/${this.props.selectedLayer}/indexes`, {
                                    method: 'post',
                                    headers: { 'Content-type': 'application/json' },
                                    body: JSON.stringify({ indexes: this.props.changedIndexes })
                                })
                                this.setState({ changedIndexes: undefined })
                            }}>apply</button>
                        </div>
                    </div>
                    {layerTypes[currentLayer.type].createOptionContainer(currentLayer.options, async options => {
                        currentLayer!.options = options
                        await fetch(`/lights/${this.props.name}/layers/${this.props.selectedLayer}/options`, {
                            method: 'post',
                            headers: { 'Content-type': 'application/json' },
                            body: JSON.stringify({ options })
                        })
                    })}
                </div>
                : <h2>select a layer to edit</h2>}
        </div>

    }
}