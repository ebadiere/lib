import { expect } from 'chai';
import jwt from 'jsonwebtoken';

import Web3 from 'web3';

import Identity from '../lib/storage/Identity';
import Registry from '../lib/storage/Registry';

describe('Clearme Identity', function(){
    // Hack.  Use the same passphrase to get a number of accounts.  
    // const ganache_passphrase = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';
    let web3;
    beforeEach(function(){
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); 
    });

    it('Can create a clear-me identity contract', async function(){
        const accounts = await web3.eth.getAccounts();
        console.log(`Account from ganache: ${accounts[0]}`);
        const identity = new Identity(web3, accounts[0]);
        const id = await identity.deploy();
        const isOwner = await id.methods.isOwner(accounts[0]).call();
        console.log('In test: ');
        expect(isOwner).to.be.true;
    })

    it('Can create a clear-me registry contract', async function(){
        const accounts = await web3.eth.getAccounts();
        console.log(`Account from ganache: ${accounts[0]}`);
        const registry = new Registry(web3, accounts[0]);
        const clearmeRegistry = await registry.deploy();
        const owner = await clearmeRegistry.methods.owner().call();
        expect(owner).to.eq(accounts[0]);
    })
    
    it('Can create an identity contract and save a hash', async function(){
        const accounts = await web3.eth.getAccounts();
        const clearMeWallet = accounts[0];

        const trumpsWallet = accounts[1];

        console.log(`Clearme Account from ganache: ${clearMeWallet}`);
        const clearmeIdentity = new Identity(web3, clearMeWallet);
        const clearmeContractId = await clearmeIdentity.deploy();

        const registry = new Registry(web3, clearMeWallet);
        const clearmeRegistryContract = await registry.deploy();

        const trumpIdentity = new Identity(web3, trumpsWallet);
        const trumpIdentityContract = await trumpIdentity.deploy();        

        const claimHash = 'QmNNohUzTDLy3pxWoL2BdcZxdJTmMcaWafFLHSS8k6SCQL';
        await registry.setClaim(trumpIdentityContract.options.address, claimHash, 
            clearMeWallet);

        const retrievedClaim = await registry.getClaim(
            trumpIdentityContract.options.address,
            clearMeWallet);
        
        expect(claimHash).to.eq(retrievedClaim);
    })

})