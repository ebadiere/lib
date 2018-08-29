import { expect } from 'chai';
import Claim from '../lib/storage/Claim';

import IPFSAgent from '../lib/storage/IPFSAgent';

import { registry } from 'clear-me-identity';

import Resolver from "clear-me-resolver/lib/resolver";

import Web3 from 'web3';

describe('Clearme generic claim', function(){

    let ipfsAgent;
    this.timeout(0);
    let claim;
    let web3;
    let accounts;
    let clearMeWallet;
    let trumpsWallet;
    let ethUtil = require('ethereumjs-util');
    let registryContract;
    let resolver;

    
    before('Create an ipfsAgent and instantiate a generic claim', async function(){
        // Meant to only run on ganache locally, therefore will redeploy the registry
        ipfsAgent = new IPFSAgent('ipfs.infura.io', '5001', 'https');
        resolver = new Resolver('ipfs.infura.io', '5001', 'https');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); 
        accounts = await web3.eth.getAccounts();
        clearMeWallet = accounts[0];

        trumpsWallet = accounts[1];

        registryContract = await new web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)))
        .deploy({ data: registry.bytecode})
        .send({ gas: '1000000', from: clearMeWallet });
    })

    it('Can instantiate a generic claim and validate the signature', async() =>{
        let thisBe = 'a super cool claim';
        claim = new Claim(ipfsAgent, web3, registryContract, trumpsWallet, clearMeWallet);
        claim.data = thisBe;
        let signature = await claim.sign();
    
        let message = ethUtil.toBuffer(thisBe); 
        let msgHash = ethUtil.hashPersonalMessage(message); 
        // private key from ganache
        let clearmePrivateKey = ethUtil.
            toBuffer('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
        let sig = ethUtil.ecsign(msgHash, clearmePrivateKey);
        expect (checkSig(sig, clearMeWallet, thisBe)).to.be.true;
    })

    it('Can instantiate a generic claim and validate the signature using the verify method on the claim', async() =>{
        let thisBe = 'a super cool claim';
        claim = new Claim(ipfsAgent, web3, registryContract, trumpsWallet, clearMeWallet);
        claim.data = thisBe;
        let signature = await claim.sign();
        // w3c data model: https://www.w3.org/TR/verifiable-claims-data-model/#expressing-an-entity-profile-in-json
        expect(signature).to.eq(claim.signature.signatureValue);
    
        let message = ethUtil.toBuffer(thisBe); 
        let msgHash = ethUtil.hashPersonalMessage(message); 
        // private key from ganache
        let clearmePrivateKey = ethUtil.
            toBuffer('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
        let sig = ethUtil.ecsign(msgHash, clearmePrivateKey);
        let signatureRPC = ethUtil.toRpcSig(sig.v, sig.r, sig.s)
        expect (claim.verify(signatureRPC)).to.be.true;
    })

    it('Can instantiate a generic claim and store it to the registry and IPFS', async() =>{
        let clearmeIdentity = {
            firstName: 'Donald',
            lastName: 'Trump',
            email: 'dtrump@gmail.com',
            phoneNumber: '7202338877'
        }
        let issuer = 'https://www.clear.me/';
        claim = new Claim(ipfsAgent, web3, registryContract, trumpsWallet, clearMeWallet, issuer);
        claim.data = clearmeIdentity;
        let signature = await claim.sign();
        let claimHash = await claim.save();
        const did = `did:clear:${claimHash}`;
        const ddoDoc = await resolver.resolve(did);
        console.log(`ddoDoc: ${JSON.stringify(ddoDoc)}`);
        const ddo = ddoDoc;
        expect(ddo.issuer).to.eq(issuer);
        expect(ddo.signature.signatureValue).to.eq(signature);
        expect(ddo.claim.firstName).to.eq(clearmeIdentity.firstName);
        expect(ddo.claim.lastName).to.eq(clearmeIdentity.lastName);
        expect(ddo.claim.email).to.eq(clearmeIdentity.email);
        expect(ddo.claim.phoneNumber).to.eq(clearmeIdentity.phoneNumber);
    })

    function checkSig(sig, owner, data,) {
        let message = ethUtil.toBuffer(data);
        let msgHash = ethUtil.hashPersonalMessage(message);

        let publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
        let sender = ethUtil.publicToAddress(publicKey);
        let addr = ethUtil.bufferToHex(sender);
        return (web3.utils.toChecksumAddress(addr) == web3.utils.toChecksumAddress(owner));
    }

})