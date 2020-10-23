import React, { Component } from 'react'
import socketio from 'socket.io-client'

import poweron from '../logo/poweron.svg'
import poweroff from '../logo/poweroff.svg'

function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export interface LightState {
    name: string
    switchedOn: boolean
    selectedProfileIndex: number
    profiles: string[]
    pixels: number[]
}

interface LightControlState {
    switchedOn: boolean
}

export default class LightControl extends Component<LightState, LightControlState> {
    state: LightControlState = { switchedOn: false }
    pixels: HTMLDivElement[][] = []
    socket = socketio()
    componentDidMount = () => {
        this.setState({ switchedOn: this.props.switchedOn })
        this.socket.on(this.props.name, (data: ArrayBuffer) => {
            const values = buf2hex(data)
            for (let i = 0; i < this.props.pixels.length; i++) {
                const pixels = this.props.pixels[i]
                for (let j = 0; j < pixels; j++) if (this.pixels.length) {
                    let p = this.pixels[i][j]
                    if (p) p.style.backgroundColor = '#' + values.substr((i * (this.props.pixels[i - 1] ?? 0) + j) * 6, 6)
                }
            }
        })
    }

    private generatePixels = () => {
        let strips: JSX.Element[][] = []
        for (let i = 0; i < this.props.pixels.length; i++) {
            const pixels = this.props.pixels[i]
            let s: JSX.Element[] = []
            let r: HTMLDivElement[] = []
            for (let j = 0; j < pixels; j++) s.push(<div
                ref={e => { if (e) r.push(e) }}
                className="pixelPreview"
                key={`pixelprev${i}-${j}`}
            />)
            strips.push(s)
            this.pixels.push(r)
        }
        return strips
    }

    render = () => {
        return <div className="lightControl">
            <h1>{this.props.name}</h1>
            <select
                className="profileSelect"
                name="profile"
                ref={r => { if (r && this.props.selectedProfileIndex < 0) r.selectedIndex = 0 }}
                value={this.props.selectedProfileIndex}
                onChange={e => {
                    fetch(`/lights/${this.props.name}/profile`, {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ profile: e.target.value })
                    })
                }}
            >
                {this.props.selectedProfileIndex < 0 ? <option disabled>nessun profilo selezionato</option> : undefined}
                {this.props.profiles.map(p => <option value={p} key={`profile${this.props.name}-${p}`}>{p}</option>)}
            </select>
            <img
                onClick={async () => {
                    let switchedOn = !this.state.switchedOn
                    await fetch(`/lights/${this.props.name}/switch`, {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ on: switchedOn })
                    })
                    this.setState({ switchedOn })
                }}
                style={{
                    cursor: 'pointer',
                    height: 150,
                    width: 150,
                    borderRadius: '50%',
                    boxShadow: `0px 0px 25px 5px ${this.state.switchedOn ? '#3dd542' : '#fb393e'}`
                }}
                src={this.state.switchedOn ? poweron : poweroff}
                className="switch"
                alt={this.state.switchedOn ? 'on' : 'off'}
            />
            <div className="stripPreviewContainer">
                {this.generatePixels().map((s, i) => <div className="stripPreview" key={`stripprev${i}`} >
                    {s}
                </div>)}
            </div>
        </div >
    }
}