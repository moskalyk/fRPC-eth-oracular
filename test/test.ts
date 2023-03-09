import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { getOnionPeers, getRelayTime, relay } from '../generated/OnionService'

var ECIES = require('../lib/bitcore-ecies-index.js');
var bitcore = require('bitcore-lib');
var _ = require('lodash')

var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Point = bitcore.crypto.Point;

(async (PEER_ID: any) => {

    await Fluence.start({
        connectTo: krasnodar[0]
    })

    // register peer with public key
    var aliceKey = new PrivateKey('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ');
    const res = await getOnionPeers(PEER_ID)
    console.log(res)

    // get randomness from space
    const res1 = await getRelayTime(krasnodar[0].peerId)
    console.log(res1)

    // encrypt with other peer
    const pubkey = new PublicKey(new Point(res[0].x, res[0].y))
    var alice = ECIES()
        .privateKey(aliceKey)
        .publicKey(pubkey);

    // encrypt block for now, must be rpc call params
    var message = JSON.stringify({ rpc_params: {call: 'eth_blockNumber', params: {} }});
    var ciphertext = alice.encrypt(message);
    console.log(ciphertext)

    // encrypt a second time, with other peer
    const pubkey2 = new PublicKey(new Point(res[1].x, res[1].y))
    var alice2 = ECIES()
        .privateKey(aliceKey)
        .publicKey(pubkey2);

    var ciphertext = alice2.encrypt(JSON.stringify({
        cipher: message,
        x: res[0].x,
        y: res[0].y
    }));

    console.log(ciphertext)

    // get pub key x,y
    var deep = _.cloneDeep(aliceKey.publicKey);
    const pubkeyAlice = JSON.parse(JSON.stringify(deep))

    // const res2 = await relay(res[0].peer_id, { cipher: ciphertext.toString('hex'), x: pubkeyAlice.x, y: pubkeyAlice.y, status: false })
    // console.log(res2)

})('12D3KooWPPy2YW231ftVFW4cw9NcwWEgaTxSQdoowuEv8G84GhL5') // hub peer id