import { v4 as uuid } from 'uuid'
const client = typeof window !== 'undefined'
const icsJson = JSON.parse(process.env.ICS_JSON || '[')
const rpc = client ? window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection || (window as any).msRTCPeerConnection : null
const peerConn = rpc ? new rpc({
    iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        ...icsJson
    ]
}) : undefined
const id = uuid()
console.log('Call create(), or join("some offer")')
export async function create(messageProcessor: (message: any) => void) {
    const PEER_ID = localStorage.getItem('peerId') || id
    localStorage.setItem('peerId', PEER_ID)
    return new Promise<[string, RTCDataChannel]>((resolve, reject) => {
        console.log('Creating ...')
        const dataChannel = peerConn?.createDataChannel(PEER_ID)
        const say = (msg: string) => dataChannel?.send(msg)
        if (!dataChannel) return console.error('No data channel')
        if (!peerConn) return console.error('No peer channel')
        const gotAnswer = (answerRaw: RTCSessionDescriptionInit) => {
            console.log('Initializing ...', answerRaw)
            const answer = typeof answerRaw === 'string' ? JSON.parse(answerRaw) : answerRaw
            peerConn.setRemoteDescription(new RTCSessionDescription(answer))
        }
        dataChannel.onopen = (e) => {
            console.log('Say things with say("hi")')
            dataChannel.send(JSON.stringify({ type: 'start' }))
        }
        dataChannel.onmessage = (e) => messageProcessor(JSON.parse(e.data))
        peerConn.createOffer({})
            .then((desc) => peerConn.setLocalDescription(desc))
            .then(() => { })
            .catch((err) => console.error(err))
        dataChannel.onclose = (e) => { messageProcessor({ type: 'close' }) }

        peerConn.onicecandidate = async (e) => {
            if (e.candidate === null) {
                console.log('Get joiners to call: ', 'join(', JSON.stringify(peerConn.localDescription), ')')
                await fetch('/api/update', {
                    method: 'POST',
                    body: JSON.stringify({ data: JSON.stringify(peerConn.localDescription), id: PEER_ID })
                })
                const timer = setInterval(async () => {
                    const gotApi = await fetch('/api/get', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: PEER_ID, from: 'create' })
                    })
                    const got = await gotApi.json()
                    const offer: string = got.answerData
                    console.log('check', PEER_ID, got)
                    if (offer) {
                        clearInterval(timer)
                        gotAnswer(JSON.parse(offer))
                    }
                }, 5000)
                resolve([PEER_ID, dataChannel])
            }
        }


    })
}

export async function join(id: string, messageProcessor: (message: any) => void) {
    // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
    return new Promise<RTCDataChannel>(async (resolve, reject) => {
        const PEER_ID = id
        console.log("Joining ...")
        if (!peerConn) return console.error('No peer channel')
        const gotApi = await fetch('/api/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: PEER_ID, from: 'join' })
        })
        const gotTxt = await gotApi.json()
        const got = gotTxt
        const offer: string = got.data

        peerConn.ondatachannel = (e) => {
            const dataChannel = e.channel
            dataChannel.onopen = (e) => {
                console.log('Say things with say("hi")')
                dataChannel.send(JSON.stringify({ type: 'startMe' }))
                resolve(dataChannel)
            }
            dataChannel.onmessage = (e) => messageProcessor(JSON.parse(e.data))
            dataChannel.onclose = (e) => { messageProcessor({ type: 'close' }) }
        }

        peerConn.onicecandidate = (e) => {
            if (e.candidate == null) {
                console.log('Get the creator to call: gotAnswer(', JSON.stringify(peerConn.localDescription), ')')
                fetch('/api/update', {
                    method: 'POST',
                    body: JSON.stringify({ answerData: JSON.stringify(peerConn.localDescription), id: PEER_ID })
                })
            }
        }
        console.log(JSON.parse(offer))
        const offerDesc = new RTCSessionDescription(JSON.parse(offer))
        peerConn.setRemoteDescription(offerDesc)
        peerConn.createAnswer({})
            .then((answerDesc) => peerConn.setLocalDescription(answerDesc))
            .catch((err) => console.warn("Couldn't create answer"))
    })
}
