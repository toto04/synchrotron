import { Component } from 'react'

interface OptionProps<T> {
    name: string
    defaultValue: T
    onChange: (value: T) => void
}

export default class Option<T, S = {}> extends Component<OptionProps<T>, S> { }