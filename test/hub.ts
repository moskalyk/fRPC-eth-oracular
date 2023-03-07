import {Fluence} from '@fluencelabs/fluence'
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerRegistry } from '../generated/OnionService'

(async (PEER_ID: any) => {
    const peers: any = []
    await Fluence.start({
        connectTo: krasnodar[0]
    })

    registerRegistry({
       register: async (peer, x, y) => {
            console.log(peer, x, y)
            peers.push({
                peer_id: peer,
                x: x,
                y: y
            })
            return true
        },
        get_users: async () => {
            return peers
        }
    })

    console.log('connected ', Fluence.getStatus().peerId)

})("");