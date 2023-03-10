var argv = require('minimist')(process.argv.slice(2));
const ir = require('./ir');
import {Fluence} from '@fluencelabs/fluence'
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerOnion, registerPeer, relay } from '../generated/OnionService'

var ECIES = require('../lib/bitcore-ecies-index.js');
var bitcore = require('bitcore-lib');
var _ = require('lodash')

var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Point = bitcore.crypto.Point;

console.log(argv._[0]);

(async (PEER_ID: any) => {

    await Fluence.start({
        connectTo: krasnodar[0]
    })

    registerOnion({
        relay: async (wp) => {
            console.log(wp)

            // recreate ecies with starter peer & relay
            var aliceKey = new PublicKey(new Point(wp.x, wp.y));
            var alice = ECIES()
                .privateKey(bobKey)
                .publicKey(aliceKey);
                
            // console.log(alice)
            // decrypt
            const message = alice.decrypt(Buffer.from(wp.cipher, 'hex'))
            const wrappedParticle = JSON.parse(message.toString())
            console.log('wrapped particle')
            console.log(wrappedParticle)

            // check if cipher contains an object with block number
            if(wrappedParticle['rpc_params'] !== 'undefined'){
                // call rpc
                console.log('calling RPC')
                return true
            }else {
                // relay
                let status = false
                if(wrappedParticle.peer_id == '') status = true
                const res = await relay(wp.peer_id, {cipher: wrappedParticle.cipher, x: wrappedParticle.x, y: wrappedParticle.y, status: status, peer_id: wrappedParticle.peer_id})
                console.log('post relay', res)
                return false
            }
        },
        bench: () => {
            return true
        }
    })

    console.log('connected ', ir(Fluence.getStatus().peerId))
    // register
    var bobKey = new PrivateKey(argv._[1]);
    // var bobKey = new PrivateKey('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG');

    var deep = _.cloneDeep(bobKey.publicKey);
    const pubkey = JSON.parse(JSON.stringify(deep))

    const res = await registerPeer(PEER_ID, pubkey.x, pubkey.y)
})(argv._[0]) // hub peer id