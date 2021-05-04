interface Blob {
    // extend blob type definition
    arrayBuffer: () => Promise<ArrayBuffer>
}

export async function blob2hex(blob: Blob) {
    return Array.prototype.map.call(new Uint8Array(await blob.arrayBuffer()), x => ('00' + x.toString(16)).slice(-2)).join('');
}

export interface LightState {
    name: string
    switchedOn: boolean
    selectedProfileIndex: number
    profiles: string[]
    pixels: number[]
}