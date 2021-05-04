import React from 'react'
import Option, { OptionProps } from './Option'

interface SliderOptionState {
    value: number
}

export default class SliderOption extends Option<number, SliderOptionState, { min?: number, max?: number, step?: number }> {
    state = { value: this.props.defaultValue }
    changeTimeout: NodeJS.Timeout | undefined

    componentDidUpdate = (prevProps: OptionProps<number>) => {
        if (this.props.defaultValue !== prevProps.defaultValue) {
            this.setState({ value: this.props.defaultValue })
        }
    }

    render = () => {
        return <div>
            <span className="optionName">{this.props.name}</span>
            <div className="slider">
                <input
                    type="range"
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    value={this.state.value}
                    onChange={(v: any) => {
                        if (this.changeTimeout) clearTimeout(this.changeTimeout)
                        this.setState({ value: parseFloat(v.target.value) })
                        this.changeTimeout = setTimeout(() => {
                            // avoid spamming
                            this.props.onChange(this.state.value)
                        }, 50)
                    }}
                />
                <span>{this.state.value}</span>
            </div>
        </div>
    }
}