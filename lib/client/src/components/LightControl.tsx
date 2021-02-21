import React, { Component } from 'react'

import ProfileSelector from './ProfileSelector'
import poweron from '../logo/poweron.svg'
import poweroff from '../logo/poweroff.svg'
import { blob2hex, LightState } from '../util'

interface LightControlState {
    switchedOn: boolean
}

export default class LightControl extends Component<LightState, LightControlState> {
    state: LightControlState = { switchedOn: false }
    pixels: HTMLDivElement[][] = []
    ws = new WebSocket(process.env.NODE_ENV === 'production' ? `ws://${window.location.host}` : 'ws://localhost:2078', this.props.name)
    componentDidMount = () => {
        this.setState({ switchedOn: this.props.switchedOn })
        this.ws.addEventListener('message', async ev => {
            const values = await blob2hex(ev.data)
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
            <ProfileSelector
                lightName={this.props.name}
                className="profileSelect"
                profiles={this.props.profiles}
                selectedProfileIndex={this.props.selectedProfileIndex}
                onProfileSelected={profile => {
                    fetch(`/lights/${this.props.name}/profile`, {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({ profile })
                    })
                }}
            />
            <a href={`/edit/${this.props.name}`}>edit</a>
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
                    boxShadow: `0px 0px 25px 0px ${this.state.switchedOn ? '#3dd542aa' : '#fb393eaa'}`
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