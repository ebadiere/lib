import Claim from '../../lib/storage/Claim';
import IPFSAgent from '../../lib/storage/IPFSAgent';
import ClearMeWallet from '../../lib/wallet/Clear-me-wallet';

import { registry } from 'clear-me-identity';
import Resolver from "clear-me-resolver/lib/resolver";
import Web3 from 'web3';
const privateKey = process.env.PKEY; 

export function testClearmeWallets(){

    let web3 = new Web3(
        new Web3.providers.HttpProvider('https://rinkeby.infura.io/u5NRNKuCvyHptR5Jq4rj')
    );

    const clearmeMnemonic = 'fiction remind pioneer forget lamp raven daring damp warm immense pet fruit';
    const clearmePrivateKey = 'e3223bba91520d911c74941c995e84683b3bee2f31cae159113ee7b700f3ab30';
    const clearmeEthereumWalletAddress = '0xa2d050a23e3de866863cf78808b63685977fbb90';
    const clearmeWallet = new ClearMeWallet(clearmeMnemonic, clearmeEthereumWalletAddress, clearmePrivateKey, web3);

    // re run the disabled test to get more mnemonic for the next accounts.
    const cuStudentMnemonic = 'urban under ring worth song detect squeeze man divorce enforce help grant';
    const cuStudentPrivateKey = '97e9403bf0cf61020dd74e066e4bf91c651f18b8138baddb0fb6f9f63d2fb984';
    const cuStudentEthereumWalletAddress = '0x8d1f77452230737af037de5ca8c4de77d9408e64';
    const cuStudentWallet = new ClearMeWallet(cuStudentMnemonic, cuStudentEthereumWalletAddress, cuStudentPrivateKey, web3);

    const cuBoulderMnemonic = 'future also tunnel version bleak supply eternal round quick link assume risk';
    const cuBoulderPrivateKey = '58aa45786d02fdc28167f81a25c52783d6a4c4400458d0d148fb7a7fa2b6eb9e';
    const cuBoulderEthereumWalletAddress = '0xf18873367267a2bb556c81d6b1e422d1df0bd28c';
    const cuBoulderWallet = new ClearMeWallet(cuBoulderMnemonic, cuBoulderEthereumWalletAddress, cuBoulderPrivateKey, web3);

    const cuProfMnemonic = 'trim start episode much submit panda achieve jump kid come click stove';
    const cuProfPrivateKey = 'af66b9f6889c9ab8d973ebdb3688b56450e177df81a288013cc06b7c52f894b0';
    const cuProfEthereumWalletAddress = '0x50804f0a28b6e173148e81abf162c64e616c16b3';
    const cuProfWallet = new ClearMeWallet(cuProfMnemonic, cuProfEthereumWalletAddress, cuProfPrivateKey, web3);

    let wallets = {};
    wallets.clearmeWallet = clearmeWallet;
    wallets.cuStudentWallet = cuStudentWallet;
    wallets.cuBoulderWallet = cuBoulderWallet;
    wallets.cuProfsWallet = cuProfWallet;
    return wallets;
}

export async function isClaimValid(registryContract, subject, issuer, verifier, resolver, ipfsAgent) {

    const studentsHash = await registryContract.methods.getClaim(subject.wallet.address, issuer.wallet.address).call();

    const did = `did:clear:${studentsHash}`;
    const ddoDoc = await resolver.resolve(did);
    const signature = ddoDoc.signature.signatureHash;

    let claim = new Claim(ipfsAgent, verifier.wallet.web3, registryContract, subject.wallet.address, issuer.wallet.address, '');
    claim.data = ddoDoc.claim;
    console.log(`DEBUG: claim.data: ${JSON.stringify(claim.data)}`);
    console.log(`DEBUG: claim.signature: ${JSON.stringify(signature)}`);

    const isValidId = claim.verify(signature);
    return isValidId;
}

export async function setupIdentities(ipfsAgent, clearme, cuStudent, cuBoulder, cuProf, registryContract) {
    let issuerStringId = 'https://www.clear.me/';

    let studentsIdentity = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jdoe@gmail.com',
        phoneNumber: '7202338877'
    };

    studentsIdentity.claim = await assignClaim(studentsIdentity, ipfsAgent, cuStudent, clearme, registryContract, issuerStringId);
    
    let cuBoulderIdentity = {
        firstName: 'CU',
        lastName: 'Boulder',
        email: 'cuboulder@gmail.com',
        phoneNumber: '7202338878'
    };

    cuBoulderIdentity.claim = await assignClaim(cuBoulderIdentity, ipfsAgent, cuBoulder, clearme, registryContract, issuerStringId);
    
    
    let cuProfIdentity = {
        firstName: 'Social',
        lastName: 'Lite',
        email: 'sl@gmail.com',
        phoneNumber: '7202338879'
    };
    // cuProfIdentity.claim = await assignClaim(cuProfIdentity, ipfsAgent, cuProf, cuBoulder, registryContract, issuerStringId);
    

    let ids = {};
    ids.studentsIdentity = studentsIdentity;
    ids.cuBoulderIdentity = cuBoulderIdentity;
    ids.cuProfIdentity = cuProfIdentity;
    return ids;
}

export async function setupCuBoulderStudentClaim(ipfsAgent, web3, student, cuBoulder, registryContract) {

    let issuer = 'https://www.cuboulder.com/';

    let cuStudent = {
        "education": {
            "University of Colorado, Boulder": [
            {
                "student_id": "1001",
                "enrolled": "09/01/2016",
                "major": "BS, Business Administration"
            },
            {
                "emails": [
                    {
                        "email": "maildanellis@yahoo.com",
                        "valid": "true"
                    },
                    {
                        "email": "maildanellis@gmail.com",
                        "valid": "true"
                    }
                ]
            }
            ]
        }        
    }

    return await assignClaim(cuStudent, ipfsAgent, student, cuBoulder, registryContract, issuer);
}

export async function setupStudentMeritClaim(ipfsAgent, web3, studentsWallet, cuProfsWallet, registryContract) {
    let issuer = 'https://www.cuboulder.com/prof';

    let meritClaim = {
        "GPA375": "True",
        "SocialActivism": "True",
        "Merit": "True"        
    }

    return await assignClaim(meritClaim, ipfsAgent, student, cuProf, registryContract, issuer);
}

export async function assignClaim(identity, ipfsAgent, subject, issuer, registryContract, issuerStringId) {
    let claim = new Claim(ipfsAgent, issuer.wallet.web3, registryContract._address, subject.wallet.address, issuer.wallet.address, issuerStringId);

    claim.data = JSON.stringify(identity);
    let signature = await claim.sign(privateKey); 
    let claimHash = await claim.save();

    return claim;
}