var ECIES = require('../lib/bitcore-ecies-index.js');
var bitcore = require('bitcore-lib');
var _ = require('lodash')

const bit: any = {
    ECIES: ECIES
}
console.log(ECIES)
console.log((typeof ECIES));

var PrivateKey = bitcore.PrivateKey;
var PublicKey = bitcore.PublicKey;
var Point = bitcore.crypto.Point;

(() => {
    var aliceKey = new PrivateKey('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ');
    var bobKey = new PrivateKey('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG');
    var carolKey = new PrivateKey('afb1a73ec390ca54d5ceb19f6f085c9ee97f27244a27c15aa4abbf4eba4cc6a8');

    console.log(bobKey.publicKey)
    console.log('--------')
    var deep = _.cloneDeep(bobKey.publicKey);
    const pubkey = JSON.parse(JSON.stringify(deep))
    console.log(pubkey)
    var a = new PublicKey(new Point(pubkey.x, pubkey.y));
    // console.log()
    var alice = bit.ECIES()
        .privateKey(aliceKey)
        .publicKey(a);

    var aliceCare = bit.ECIES()
        .privateKey(aliceKey)
        .publicKey(carolKey.publicKey)

    var bob = bit.ECIES()
        .privateKey(bobKey)
        .publicKey(aliceKey.publicKey);

    var carol = bit.ECIES()
        .privateKey(carolKey)
        .publicKey(aliceKey.publicKey);

    var message = JSON.stringify({lunch: 'date'});

    // starting node
    console.log('--- signer ---')

    var ciphertext = aliceCare.encrypt(message);
    console.log(ciphertext)

    var ciphertext2 = alice.encrypt(ciphertext);
    console.log(ciphertext2)

    // relay
    console.log('--- relaying ---')

    
    var ciphertextUnwrap = bob.decrypt(ciphertext2)
    console.log(ciphertextUnwrap)

    try{
    console.log(typeof JSON.parse(decrypted.toString()) == 'object')
    }catch(e){
    console.log('passing particle...')
    }

    // end node
    console.log(Buffer.isBuffer(ciphertextUnwrap) == true)

    var bufferCiphertext2 = ciphertextUnwrap.toString('hex')
    var cipherBuffer = Buffer.from(bufferCiphertext2, 'hex')

    var decrypted = carol.decrypt(cipherBuffer)
    console.log('--- decrypted ---')

    console.log(decrypted.toString() == message)
    console.log(decrypted.toString())

})();