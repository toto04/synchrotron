import { Component } from 'react'

type LayerOptionSelectorProps<T, P> = {
    defaultOptions: T
    onChange: (values: T) => void
} & P

export default class LayerOptionSelector<T = any, P = {}> extends Component<LayerOptionSelectorProps<T, P>, T> {
    onChange = () => this.props.onChange(this.state)
}