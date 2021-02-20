import React, { Component } from 'react'
import { LayerConfig, PixelIndex } from 'types'

import { layerTypes } from './layers'
import ConfirmModal from './generics/ConfirmModal'

interface OptionsSelectorProps {
    name: string
    currentLayer?: LayerConfig
    selectedLayer?: number
    changedIndexes?: PixelIndex[]
    resetSelection?: () => void
    resetChangedIndexes: () => void
    deleteLayer: () => void
}

interface OptionsSelectorState {
    deletingLayer: boolean
}

export default class OptionsSelector extends Component<OptionsSelectorProps, OptionsSelectorState> {
    state = { deletingLayer: false }
    render = () => {
        let currentLayer = this.props.currentLayer
        return <div className="options">
            {currentLayer
                ? <div className="selectedLayerOptions">
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
                                this.props.resetChangedIndexes()
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
                    <div
                        className="deleteButton"
                        onClick={e => {
                            if (e.target === e.currentTarget)
                                this.setState({ deletingLayer: true })
                        }}
                    >
                        delete layer
                        <ConfirmModal
                            isOpen={this.state.deletingLayer}
                            title="delete layer"
                            message="do you want to delete this layer? this action is not reversible"
                            onClose={() => {
                                console.log(this.state.deletingLayer)
                                this.setState({ deletingLayer: false })
                            }}
                            onConfirm={async () => {
                                this.props.deleteLayer()
                                this.setState({ deletingLayer: false })
                            }}
                            destructive
                        />
                    </div>
                </div>
                : <h2>select a layer to edit</h2>}
        </div>

    }
}