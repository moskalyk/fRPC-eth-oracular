var argv = require('minimist')(process.argv.slice(2));
const ir = require('./ir');
import {Fluence} from '@fluencelabs/fluence'
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { registerOnion, registerPeer } from '../generated/OnionService'

var ECIES = require('../lib/bitcore-ecies-index.js');
var bitcore = require('bitcore-lib');
var _ = require('lodash')

var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Point = bitcore.crypto.Point;

console.log(argv);

(async (PEER_ID: any) => {

    await Fluence.start({
        connectTo: krasnodar[0]
    })

    registerOnion({
       relay: async (wp) => {
        console.log(wp)
        
        // must use status as 
        console.log(Buffer.isBuffer(wp.cipher))
        console.log(Buffer.isBuffer(Buffer.from(wp.cipher)) == true)
        console.log(Buffer.isBuffer(Buffer.from('wp.cipher', 'hex')) == true)

        // recreate ecies with starter peer & relay
        var aliceKey = new PublicKey(new Point(wp.x, wp.y));
        var alice = ECIES()
            .privateKey(bobKey)
            .publicKey(aliceKey);
        
        // decrypt
        const message = alice.decrypt(Buffer.from(wp.cipher, 'hex'))
        console.log('message')
        console.log(message)
        
        // check if cipher contains an object with block number
        if(JSON.parse(message.toString())['rpc_params'] === 'undefined'){
            // call rpc
            return true
        }else {
            // relay
            // const res = await relay(...)
            return false
        }
    }})

    console.log('connected ', ir(Fluence.getStatus().peerId))
    // register
    var bobKey = new PrivateKey(argv.pkey);
    // var bobKey = new PrivateKey('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG');

    var deep = _.cloneDeep(bobKey.publicKey);
    const pubkey = JSON.parse(JSON.stringify(deep))

    const res = await registerPeer(PEER_ID, pubkey.x, pubkey.y)
})(argv.peer_id) // hub peer id