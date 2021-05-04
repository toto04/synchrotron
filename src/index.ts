import { createServer } from 'http'
import { createSocket } from 'dgram'
import WebSocket from 'ws'
import { configureLights, config } from './persist'
import { getApi } from './api'
import { Light } from './lights'

let { port } = config

configureLights().then((lights) => {
    lights[0].start()
    let api = getApi(lights)
    let server = createServer(api)

    // the connected clients are stored in sets in a map with the light name as key
    let wsClients = initializeWsClientMap(lights)

    const wss = new WebSocket.Server({ server })
    wss.on('connection', (ws) => {
        wsClients.get(ws.protocol)?.add(ws)

        // remove the client from the set on disconnect
        ws.on('close', () => wsClients.get(ws.protocol)?.delete(ws))
    })

    bindUDPbeacon()
    server.listen(port)
    console.log(`[Synchrotron API] Server initialized on port ${port}!`)
})

let initializeWsClientMap = (lights: Light[]) => {
    let wsClients: Map<String, Set<WebSocket>> = new Map()
    for (const light of lights) {
        // builds the map
        wsClients.set(light.name, new Set())
        light.on('advance', buffer => {
            wsClients.get(light.name)?.forEach(ws => {
                ws.send(buffer)
            })
        })
    }
    return wsClients
}

let bindUDPbeacon = () => {
    let udpSocket = createSocket('udp4')
    udpSocket.on('message', (msg, rinfo) => {
        if (msg.toString() !== "SYNCHROTRON CONNECT") return
        let portbuff = Buffer.alloc(2)
        portbuff.writeUInt16BE(port)
        udpSocket.send(portbuff, port, rinfo.address)
    })
    udpSocket.bind(port)
}