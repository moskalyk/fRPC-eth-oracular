var argv = require('minimist')(process.argv.slice(2));
import { Fluence } from '@fluencelabs/fluence';
import { krasnodar } from '@fluencelabs/fluence-network-environment';
import { getOnionPeers, getRelayTime, getRelayTimes, relay, benchTest } from '../generated/OnionService'

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

    console.time('Full Onion Circuit');
    // register peer with public key
    var aliceKey = new PrivateKey('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ');
    const res = await getOnionPeers(PEER_ID)
    console.log(res)

    // get randomness from space
    const resBunch = await getRelayTimes(
        [
            krasnodar[0].peerId,
            krasnodar[1].peerId,
            krasnodar[2].peerId,
            krasnodar[3].peerId,
            krasnodar[4].peerId,
            krasnodar[5].peerId,
            krasnodar[6].peerId,
            krasnodar[7].peerId
        ]
    )
    console.log(resBunch)

    const res1 = resBunch[resBunch[4] % resBunch.length]
    const res4 = resBunch[resBunch[7] % resBunch.length]
    console.log(res1)
    console.log(res4)


    // encrypt with other peer
    const pubkey = new PublicKey(new Point(res[res1 % res.length].x, res[res1 % res.length].y))
    var alice = ECIES()
        .privateKey(aliceKey)
        .publicKey(pubkey);

    // encrypt block for now, must be rpc call params
    var message = JSON.stringify({ rpc_params: {call: 'eth_blockNumber', params: {} }});
    var ciphertext = alice.encrypt(message);
    console.log(ciphertext)

    // encrypt a second time, with other peer
    const pubkey2 = new PublicKey(new Point(res[res4 % res.length].x, res[res4 % res.length].y))
    var alice2 = ECIES()
        .privateKey(aliceKey)
        .publicKey(pubkey2);

    var ciphertext2 = alice2.encrypt(JSON.stringify({
        cipher: ciphertext.toString('hex'),
        x: res[res4 % res.length].x,
        y: res[res4 % res.length].y,
        peer_id: ''
    }));

    console.log(ciphertext)

    // get pub key x,y
    var deep = _.cloneDeep(aliceKey.publicKey);
    const pubkeyAlice = JSON.parse(JSON.stringify(deep))

    console.time('1-Hop Onion');
    const res2 = await relay(res[res4 % res.length].peer_id, { cipher: ciphertext2.toString('hex'), x: pubkeyAlice.x, y: pubkeyAlice.y, status: false, peer_id: res[res1 % res.length].peer_id }, {ttl: 20000})
    console.timeEnd('1-Hop Onion')
    console.timeEnd('Full Onion Circuit');
    console.log(res2)

    console.time('Simple Aqua Call');
    const res3 = await benchTest(res[res4 % res.length].peer_id)
    console.timeEnd('Simple Aqua Call')

})(argv._[0]) // hub peer id
