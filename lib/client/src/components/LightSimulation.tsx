import React, { Component } from 'react'
import { SelectableGroup, createSelectable, TSelectableItemProps } from 'react-selectable-fast'
import { PixelIndex } from 'types'

interface PixelSimulationProps {
    index: PixelIndex
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent> & { index: PixelIndex }) => void
}

class PixelSimulation extends Component<PixelSimulationProps & TSelectableItemProps> {
    render = () => {
        return <div
            onDoubleClick={e => {
                if (this.props.onDoubleClick) this.props.onDoubleClick(Object.assign({ index: this.props.index }, e))
            }}
            className={"pixelSimulation" + (this.props.isSelected ? " selected" : this.props.isSelecting ? " selecting" : '')}
            ref={this.props.selectableRef}
        />
    }
}

const PixelSimulationSelectable = createSelectable<PixelSimulationProps>(PixelSimulation)

interface LightSimulationProps {
    strips: number[]
    disabled?: boolean
    defaultIndexes?: PixelIndex[]
    selectAll?: (selectAll: () => void) => void
    clearSelection?: (clearSelection: () => void) => void
    resetSelection?: (resetSelection: () => void) => void
    onSelection?: (pixels: PixelIndex[]) => void
    onReset?: () => void
}
interface LightSimulationState {
    modifierIsPressed: boolean
}
export default class LightSimulation extends Component<LightSimulationProps, LightSimulationState> {
    state: LightSimulationState = { modifierIsPressed: false }
    selectable?: SelectableGroup
    lastIndexes?: PixelIndex[]
    componentDidUpdate = () => {
        if (this.lastIndexes !== this.props.defaultIndexes) this.resetSelection()
        this.lastIndexes = this.props.defaultIndexes
    }
    componentDidMount = () => {
        window.addEventListener('keydown', e => { if (e.ctrlKey || e.shiftKey) this.setState({ modifierIsPressed: true }) })
        window.addEventListener('keyup', e => { this.setState({ modifierIsPressed: false }) })
        if (this.props.resetSelection) this.props.resetSelection(() => this.resetSelection())
    }

    resetSelection = () => {
        this.selectable?.clearSelection()
        if (this.props.defaultIndexes) this.selectIndexes(this.props.defaultIndexes)
        if (this.props.onReset) this.props.onReset()
    }

    selectIndexes: (indexes: PixelIndex[]) => void = indexes => {
        if (!this.selectable) return
        for (const item of this.selectable.registry.values()) {
            let pixel = item as any as PixelSimulation // im sorry
            for (const index of indexes)
                if (pixel.props.index[0] === index[0] && pixel.props.index[1] === index[1]) {
                    item.setState({ isSelected: true })
                    this.selectable.selectedItems.add(item)
                    break;
                }
        }
    }

    render = () => <SelectableGroup
        ref={r => {
            this.selectable = r ?? undefined
            if (this.props.selectAll) this.props.selectAll(() => this.selectable?.selectAll())
            if (this.props.clearSelection) this.props.clearSelection(() => this.selectable?.clearSelection())
        }}
        resetOnStart={!this.state.modifierIsPressed}
        allowCtrlClick
        allowShiftClick
        disabled={this.props.disabled}
        className="lightSimulation"
        onSelectionFinish={(e: PixelSimulation[]) => {
            if (this.props.onSelection) this.props.onSelection(e.map(p => p.props.index))
        }}
    >
        {this.props.strips.map((s, i) => {
            let pixels: JSX.Element[] = []
            for (let j = 0; j < s; j++)
                pixels.push(<PixelSimulationSelectable
                    index={[i, j]}
                    onDoubleClick={this.props.disabled ? undefined : e => {
                        // this is not exactly a good practice, but it works
                        if (!this.selectable) return
                        for (const item of this.selectable.registry.values()) {
                            let pixel = item as any as PixelSimulation
                            if (pixel.props.index[0] === e.index[0]) {
                                item.setState({ isSelected: true })
                                this.selectable.selectedItems.add(item)
                            }
                        }
                        let indexes: PixelIndex[] = []
                        // Father forgive me for I have sinned
                        for (const item of this.selectable.selectedItems) indexes.push((item as any).props.index)
                        if (this.props.onSelection) this.props.onSelection(indexes)
                    }}
                    key={"pixelsim" + j}
                />)
            return <div className="stripSimulation" key={"stripsim" + i}>{pixels}</div>
        })}
    </SelectableGroup>
}
