import Web3 from 'web3';

const web3 = new Web3("http://localhost:3000");

(async () => {

    // test #1: block number
    const bn = await web3.eth.getBlockNumber()
    console.log(bn)

    // test #2: https://web3js.readthedocs.io/en/v1.2.0/web3-eth.html#signtransaction
    
})(); 