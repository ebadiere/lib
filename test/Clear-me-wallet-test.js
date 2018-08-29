// A test or temporary wallet needed to manage accounts and private keys demos and testing concepts.
import { expect } from 'chai';
import ethUtil from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import Web3 from 'web3';

import { registry } from 'clear-me-identity';

import ClearMeWallet from '../lib/wallet/Clear-me-wallet';

import { testClearmeWallets } from './util/IdentityTestUtils';

import HDWalletProvider from 'truffle-hdwallet-provider';
import WalletFactory from '../src/wallet/Wallet-factory';
import Claim from '../src/storage/Claim';

function checkSig(sig, owner, data) {
    let message = ethUtil.toBuffer(data);
    let msgHash = ethUtil.hashPersonalMessage(message);

    let publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
    let sender = ethUtil.publicToAddress(publicKey);
    let addr = ethUtil.bufferToHex(sender);
    return (web3.utils.toChecksumAddress(addr) == web3.utils.toChecksumAddress(owner));
}

describe('Clearme test wallet', function(){

    this.timeout(0);

    const clearmeMnemonic = 'fiction remind pioneer forget lamp raven daring damp warm immense pet fruit';
    const clearmePrivateKey = '0x683bed6481d026d5a313d04711ac4865ed7df3d34e0cdff7011c88895f9b4652';
    const clearmeEthereumWalletAddress = '0x973E9D98f5139777E4706a56d54f652441c73A68';

    const cuStudentMnemonic = 'urban under ring worth song detect squeeze man divorce enforce help grant';
    const cuStudentPrivateKey = '0x3b7d3590ca072efb83ee55b76d0fbcae18a9997c7f0d0d85bf74eb2a45c82a08';
    const cuStudentEthereumWalletAddress = '0x314050466d3946A0Cf36034C4b55Fa026aA8bC9c';

    const cuBoulderMnemonic = 'future also tunnel version bleak supply eternal round quick link assume risk';
    const cuBoulderPrivateKey = '58aa45786d02fdc28167f81a25c52783d6a4c4400458d0d148fb7a7fa2b6eb9e';
    const cuBoulderEthereumWalletAddress = '0xf18873367267a2bb556c81d6b1e422d1df0bd28c';
 
    const infura = 'https://rinkeby.infura.io/u5NRNKuCvyHptR5Jq4rj';

    it('Can instantiate a clear-me wallet as it will be in the demo scenarios', async()=>{
 
        let clearmeWallet = await WalletFactory.createWallet(clearmeMnemonic, clearmePrivateKey, infura);
        const balance = await clearmeWallet.web3.eth.getBalance(clearmeWallet.address);
        const registryContract = await new clearmeWallet.web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)))
            .deploy({ data: registry.bytecode, })
            .send({ gas: '1000000', from: clearmeWallet.address });
    
        // Set the registry address on the clearme Wallet
        clearmeWallet.registryAddress = registryContract._address;

        let cuStudentWallet = await WalletFactory.createWallet(cuStudentMnemonic, cuStudentPrivateKey, infura, registryContract._address);
        let cuBoulderWallet = await WalletFactory.createWallet(cuBoulderMnemonic, cuBoulderPrivateKey, infura, registryContract._address);
    
        // Clear me sets up an initial identity
        let clearmeClaim = {};
        clearmeClaim.firstName = 'John';
        clearmeClaim.lastName = 'Doe';
        clearmeClaim.email = 'jd@gmail.com';
        clearmeClaim.phoneNumber = '7202337788';
        await clearmeWallet.setClaim(cuStudentWallet.address, clearmeClaim);

        // CU student fetches the claim to give to CU Boulder
        const fetchedClaim = await cuStudentWallet.getClaim(clearmeWallet.address);
        // replace expect with validation code
        expect(clearmeClaim.firstName).to.eq(fetchedClaim.claim.firstName);
        expect(clearmeClaim.lastName).to.eq(fetchedClaim.claim.lastName);
        expect(clearmeClaim.email).to.eq(fetchedClaim.claim.email);
        expect(clearmeClaim.phoneNumber).to.eq(fetchedClaim.claim.phoneNumber);

        // now validate the signature
        const check = await clearmeWallet.verifyClaim(fetchedClaim.signature.signatureHash.signature, cuStudentWallet.address, fetchedClaim.claim);
        // Only continue if the identity claim is valid
        expect(check).to.be.true;

        const eduation = require('./data/CUBoulderStudentClaim.json');
        const eduationClaim = eduation.claim;
        await cuBoulderWallet.setClaim(cuStudentWallet.address, eduation);

        const cuStudent = await cuStudentWallet.getClaim(cuBoulderWallet.address);
        expect(cuStudent.claim.claim.education['University of Colorado, Boulder'][0].student_id).to.eq(eduation.claim.education['University of Colorado, Boulder'][0].student_id);
        // Now verify the cuStudent claim
        const cuStudentCheck = await cuBoulderWallet.verifyClaim(cuStudent.signature.signatureHash.signature, cuStudentWallet.address, cuStudent.claim);
        expect(cuStudentCheck).to.be.true;
        // Now create an awesome JWT to track a web (react app) session.
        
    })
})