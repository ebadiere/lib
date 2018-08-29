import { expect } from 'chai';
import Claim from '../lib/storage/Claim';
import IPFSAgent from '../lib/storage/IPFSAgent';

import { registry } from 'clear-me-identity';
import Resolver from "clear-me-resolver/lib/resolver";
import Web3 from 'web3';

import { assignClaim, isClaimValid, setupCuBoulderStudentClaim, setupIdentities, setupStudentMeritClaim} from './util/IdentityTestUtils';

describe('Clearme claims interaction in a Web of Trust', function(){
    let ipfsAgent;
    this.timeout(0);
    let claim;
    let web3;
    let accounts;
    let clearMeWallet;
    let studentsWallet;
    let cuBouldersWallet;
    let cuProfsWallet;

    let ethUtil = require('ethereumjs-util');
    let identities;
    let registryContract;
    let resolver;

    before('Setup all the actors and infrastructure in our scenario', async function(){
        let ipfsInfra = 'ipfs.infura.io';
        // Meant to only run on ganache locally, therefore will redeploy the registry
        ipfsAgent = new IPFSAgent(ipfsInfra, '5001', 'https');
        resolver = new Resolver(ipfsInfra, '5001', 'https');
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545")); 

        accounts = await web3.eth.getAccounts();
        // Our actors
        clearMeWallet = accounts[0];
        studentsWallet = accounts[1];
        cuBouldersWallet = accounts[2];
        cuProfsWallet = accounts[3];
        
        registryContract = await new web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)))
        .deploy({ data: registry.bytecode})
        .send({ gas: '1000000', from: clearMeWallet });

        identities = await setupIdentities(ipfsAgent, web3, studentsWallet, clearMeWallet, cuBouldersWallet, cuProfsWallet, registryContract);
    })  

    xit('Can validate an identity to create a CU student claim, and validate both to create a CU merit claim', async() =>{
        // Validate the student's clearme identity
        // Look up the student in the registry to get the hash for the DID
        // Current registry allows for only one claim on one subject per issuer
        // Validates that the student is a cuBoulderStudent
        // Validates that the student got the merit claim
        //  Validation is the core principle here that can be applied to other use cases such as auth.
        let isValidClaim;
        let cuBoulderStudentClaim;
        let cuMeritClaim;
        isValidClaim = await isClaimValid(registryContract, studentsWallet, clearMeWallet, resolver, ipfsAgent, web3);
        // Should be true to move on in this test
        expect(isValidClaim).to.be.true;

        // Now create the student ID claim from CU Boulder
        // Is CU Boulder claim valid
        cuBoulderStudentClaim = await setupCuBoulderStudentClaim(ipfsAgent, web3, studentsWallet, cuBouldersWallet, registryContract);
        isValidClaim = await isClaimValid(registryContract, studentsWallet, cuBouldersWallet, resolver, ipfsAgent, web3);
        // Should be true to move on in this test
        expect(isValidClaim).to.be.true;
        
        // Made it to here so claims are valid.
        // Now assume that the student gets the merit badge.
        // Assign the merit claim and validate it.
        cuMeritClaim = await setupStudentMeritClaim(ipfsAgent, web3, studentsWallet, cuProfsWallet, registryContract);
        isValidClaim = await isClaimValid(registryContract, studentsWallet, cuProfsWallet, resolver, ipfsAgent, web3);
        expect(isValidClaim).to.be.true;
    });

})