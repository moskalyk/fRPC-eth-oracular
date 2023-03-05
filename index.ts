import express from "express";
import bodyParser from "body-parser";
import {JSONRPCServer} from "json-rpc-2.0";
import Web3 from 'web3';

const server = new JSONRPCServer();

export const methods = [
    'eth_blockNumber',
    'eth_sendRawTransaction'
]

const app = express();
app.use(bodyParser.json());

async function methodHandler(reqRaw: any, method: any) {
    // switch on rpcMeowthed
    console.log(reqRaw)
    console.log(method)
    return {g: 1}
}

function addMethod(op: any) {
    server.addMethod(op, async (req) => methodHandler(req, op));
}

// register all eth methods
methods.forEach((m) => {
    addMethod(m);
})

// register JSON-RPC handler
app.post('/', (req: any, res: any) => {
    const jsonRPCRequest = req.body;
    server.receive(jsonRPCRequest).then((jsonRPCResponse: any) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            res.sendStatus(204);
        }
    });
});

app.listen(3000);

console.log("Server was started on port " + 3000);