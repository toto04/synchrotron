import React, { Component } from 'react'
import { SelectableGroup, createSelectable } from 'react-selectable-fast'
import { LayerConfig } from '../util'

const PixelSimulation = createSelectable<{
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}>(({ selectableRef, isSelected, isSelecting, onDoubleClick }) => <div
    onDoubleClick={onDoubleClick}
    className="pixelSimulation"
    ref={selectableRef}
    style={{ border: isSelected ? '1px solid #fffc' : isSelecting ? '1px solid #fff8' : '1px solid transparent' }}
/>)

interface LightSimulationProps {
    strips: number[]
    selectedLayer?: LayerConfig
    disabled?: boolean
    selectAll?: (selectAll: () => void) => void
    clearSelection?: (clearSelection: () => void) => void
}
interface LightSimulationState {
    modifierIsPressed: boolean
}
export class LightSimulation extends Component<LightSimulationProps, LightSimulationState> {
    state: LightSimulationState = { modifierIsPressed: false }
    selectable?: SelectableGroup
    componentDidMount = () => {
        window.addEventListener('keydown', e => { if (e.ctrlKey || e.shiftKey) this.setState({ modifierIsPressed: true }) })
        window.addEventListener('keyup', e => { this.setState({ modifierIsPressed: false }) })
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
    >
        {this.props.strips.map((s, j) => {
            let pixels: JSX.Element[] = []
            for (let i = 0; i < s; i++)
                pixels.push(<PixelSimulation
                    onDoubleClick={this.props.disabled ? undefined : e => {
                        // THIS IS SOME SERIUS HACKY SHIT
                        // THIS FUNCTION IS CURSED. DON'T EVENT TRY TO READ.
                        if (!this.selectable) return
                        let { top } = e.currentTarget.getBoundingClientRect()
                        let { left } = document.querySelector('.pixelSimulation')?.getBoundingClientRect() ?? { left: 0 }
                        let options = {
                            top,
                            left,
                            height: e.currentTarget.offsetHeight,
                            width: document?.querySelector('.lightSimulation')?.clientWidth ?? 0,
                            offsetHeight: e.currentTarget.offsetHeight,
                            offsetWidth: document?.querySelector('.lightSimulation')?.clientWidth ?? 0
                        }
                        // that's the hacky af part, forgive me father for I have sinned
                        this.selectable.selectItems(options)
                        this.selectable.selectingItems.forEach(item => item.setState({ isSelected: true, isSelecting: false }))
                        this.selectable.selectedItems = new Set([...this.selectable.selectedItems, ...this.selectable.selectingItems])
                        this.selectable.selectingItems.clear()
                    }}
                    key={"pixelsim" + i}
                />)
            return <div className="stripSimulation" key={"stripsim" + j}>{pixels}</div>
        })}
    </SelectableGroup>
}
