import { Component } from 'react'

export type OptionProps<T, P = {}> = {
    name?: string
    defaultValue: T
    onChange: (value: T) => void
} & P

export default class Option<T, S = T, P = {}> extends Component<OptionProps<T, P>, S> { }