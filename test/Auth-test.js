import { expect } from 'chai';
import Claim from '../lib/storage/Claim';
import IPFSAgent from '../lib/storage/IPFSAgent';

import { registry } from 'clear-me-identity';
import Resolver from "clear-me-resolver/lib/resolver";
import Web3 from 'web3';

import { sign } from 'jsonwebtoken';

import ethereumjsWallet from 'ethereumjs-wallet';
import ProviderEngine from 'web3-provider-engine'; 
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet.js'; 

import { assignClaim, isClaimValid, setupCuBoulderStudentClaim, setupIdentities, setupStudentMeritClaim, testClearmeWallets } from './util/IdentityTestUtils';

describe('Claims used to authenticate', function(){
    let ipfsAgent;
    this.timeout(0);
    let claim;

    // let ethUtil = require('ethereumjs-util');
    let identities;
    let registryContract;
    let resolver;

    // entities
    let clearme = {};
    let cuBoulder = {};
    let cuProf = {};
    let cuStudent = {};

    const RPC_SERVER = 'https://rinkeby.infura.io/u5NRNKuCvyHptR5Jq4rj'; 
    

    async function createUsersIdentities() {
        const wallets = testClearmeWallets();
        clearme.wallet = wallets.clearmeWallet;
        cuStudent.wallet = wallets.cuStudentWallet;
        cuBoulder.wallet = wallets.cuBoulderWallet;
        cuProf.wallet = wallets.cuProfsWallet;  
    };
    
    before('Setup all the actors and infrastructure in our scenario', async function(){
        let ipfsInfra = 'ipfs.infura.io';
        // Meant to only run on ganache locally, therefore will redeploy the registry
        ipfsAgent = new IPFSAgent(ipfsInfra, '5001', 'https');
        resolver = new Resolver(ipfsInfra, '5001', 'https');

        // Our actors
        createUsersIdentities();
        console.log(`DEBUG: before deploying registry address: ${clearme.wallet.address}`);
        const web3 = clearme.wallet.web3;
        registryContract = await new web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)))
            .deploy({ data: registry.bytecode})
            .send({ gas: '1000000', from: clearme.wallet.address })
            .on('error', function(error){ console.log(`DEBUG: deploy error: ${error}`)});
        
        console.log(`DEBUG: after deploying registry`);    

        let clearmeAddress = clearme.wallet.address;
        identities = await setupIdentities(
                ipfsAgent, 
                clearme,
                cuStudent, 
                cuBoulder, 
                cuProf, 
                registryContract, 
                clearmeAddress);

        identities.studentsIdentity.claim = await setupCuBoulderStudentClaim(ipfsAgent, cuBoulder.wallet.web3, cuStudent, cuBoulder, registryContract);
    })  
    
    after('Shutting things down', async function(){
        // engine.stop();
    })

    // Assume a public key and signed claims are coming into the initial authentication request.
    it('Can run through the steps to authenticate to a CU Portal using an identity instead of password', async() =>{
        let isValidClaim;
        
        // cuBoulder will verify the clearme ID
        // isValidClaim = await isClaimValid(registryContract, cuStudent, clearme, cuBoulder, resolver, ipfsAgent);
        // // Should be true to move on in this test
        // expect(isValidClaim).to.be.true;

        console.log(`DEBUG: clearme wallet address: ${clearme.wallet.address}`);
        isValidClaim = await isClaimValid(registryContract, cuStudent, cuBoulder, cuBoulder, resolver, ipfsAgent);
        console.log(`DEBUG: isValid: ${isValidClaim}`);
        // // Should be true to move on in this test
        // expect(isValidClaim).to.be.true;
        // Two valid claims.  Valid Clearme Identity claim and valid CU Boulder student claim.  Authorize by setting a JWT
        // token to last for one day.  The payload will be the first name, last name and student ID for now.
    
        // let cuClaim = JSON.parse(cuBoulderStudentClaim.data);
     
        // let payload = {};
        // payload.firstName = identities.studentsIdentity.firstName;
        // payload.lastName = identities.studentsIdentity.lastName;
        // payload.studentId = cuClaim.education['University of Colorado, Boulder'][0].student_id;
        // let token = sign(payload, 'clearmeSecret', { expiresIn: '1d' });
        // console.log(`Token to send back to the client to auth: ${token}`);
        // expect(token).to.not.be.null;
     
    })
    
})