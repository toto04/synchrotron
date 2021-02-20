import React from 'react'
import Option, { OptionProps } from './Option'
import { ColorArray } from 'types'
import ColorOption from './Color'

import add from '../../logo/add.svg'
import remove from '../../logo/remove.svg'

interface ColorArrayDefaultValue {
    colors: ColorArray
}

type ColorArrayOptionState = ColorArrayDefaultValue & {
    moving: boolean
    selectedPoint?: number
}

export default class ColorArrayOption extends Option<ColorArrayDefaultValue, ColorArrayOptionState> {
    state: ColorArrayOptionState = {
        ...this.props.defaultValue,
        moving: false
    }
    gradientPreview: HTMLDivElement | undefined

    componentDidMount = () => {
        window.addEventListener('mouseup', () => {
            if (this.state.moving) this.setState({ moving: false }, () => this.props.onChange({ colors: this.state.colors }))
        })
    }
    componentDidUpdate = (prevProps: OptionProps<ColorArrayDefaultValue>) => {
        if (this.props.defaultValue.colors !== prevProps.defaultValue.colors) {
            console.log('gay')
            this.setState({
                ...this.props.defaultValue,
                selectedPoint: undefined,
                moving: false
            })
        }
    }

    handleMovement = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (this.state.moving && this.gradientPreview && this.state.selectedPoint !== undefined) {
            let rect = this.gradientPreview.getBoundingClientRect()
            let prev = this.state.colors[this.state.selectedPoint - 1]
            let next = this.state.colors[this.state.selectedPoint + 1]
            let min = prev ? prev.point + 0.01 : 0
            let max = next ? next.point - 0.01 : 1
            let point = (e.clientX - rect.left) / rect.width
            if (point < min) point = min
            if (point > max) point = max
            point = Math.round(point * 100) / 100
            let colors = this.state.colors
            colors[this.state.selectedPoint].point = point
            this.setState({ colors })
        }
    }

    render = () => {
        let colors = this.props.defaultValue.colors.length > 1
            ? this.props.defaultValue.colors
            : [this.props.defaultValue.colors[0], this.props.defaultValue.colors[0]]
        let bgColorList = colors.map(c => `rgba(${c.color.r},${c.color.g},${c.color.b},${c.color.a}) ${c.point * 100}%`).join(', ')
        let linearGradient = `linear-gradient(to right, ${bgColorList})`

        return <div onMouseMove={this.handleMovement}>
            <span className="optionName">{this.props.name}</span>
            <div className="optionCollection">
                <div
                    ref={r => { if (r) this.gradientPreview = r }}
                    className="gradientPreview"
                    style={{
                        backgroundImage: linearGradient,
                    }}
                >
                    {this.state.colors.map((colorPoint, i) => {
                        let left = (this.gradientPreview?.clientWidth ?? 0) * colorPoint.point - 4
                        return <div
                            style={{
                                left,
                                backgroundColor: `rgb(${colorPoint.color.r},${colorPoint.color.g},${colorPoint.color.b})`
                            }}
                            key={`carr-cpprev-${i}`}
                            className={'colorPointPreview' + (this.state.selectedPoint === i ? ' selected' : '')}
                            onMouseDown={() => this.setState({ moving: true, selectedPoint: i })}
                        />
                    })}
                </div>
                <div className="pointController">
                    <p>stop%</p>
                    <input
                        type="number"
                        value={this.state.selectedPoint !== undefined ? Math.round(this.state.colors[this.state.selectedPoint].point * 100) : ''}
                        disabled={this.state.selectedPoint === undefined}
                        onChange={v => {
                            let colors = this.state.colors
                            colors[this.state.selectedPoint!].point = parseInt(v.target.value) / 100
                            this.setState({ colors }, () => this.props.onChange({ colors: this.state.colors }))
                        }}
                    />
                    <img
                        src={add}
                        alt=""
                        onClick={() => {
                            let { colors } = this.state
                            let def = {
                                color: { r: 255, g: 255, b: 255, a: 1 },
                                point: 1
                            }
                            if (this.state.selectedPoint !== undefined && this.state.selectedPoint < colors.length - 1) {
                                let next = this.state.selectedPoint + 1
                                def.point = (colors[this.state.selectedPoint].point + colors[next].point) / 2
                                colors.splice(this.state.selectedPoint + 1, 0, def)
                            } else colors.push(def)
                            this.setState({ colors }, () => this.props.onChange({ colors: this.state.colors }))
                        }}
                    />
                    <img
                        className={(this.state.colors.length <= 1 || this.state.selectedPoint === undefined) ? 'disabled' : ''}
                        src={remove}
                        alt=""
                        onClick={() => {
                            if (this.state.colors.length <= 1 || this.state.selectedPoint === undefined) return
                            let { colors } = this.state
                            colors.splice(this.state.selectedPoint, 1)
                            let selectedPoint: number | undefined = this.state.selectedPoint
                            if (colors.length <= selectedPoint) selectedPoint = undefined
                            this.setState({ colors, selectedPoint }, () => this.props.onChange({ colors: this.state.colors }))
                        }}
                    />
                </div>
                {this.state.selectedPoint !== undefined ? <ColorOption
                    name="Color"
                    defaultValue={this.state.colors[this.state.selectedPoint].color}
                    onChange={color => {
                        let colors = this.state.colors
                        colors[this.state.selectedPoint!].color = color
                        this.setState({ colors }, () => this.props.onChange({ colors: this.state.colors }))
                    }}
                /> : undefined}
            </div>
        </div>
    }
}