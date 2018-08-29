// This is simple Hierarchical Deterministic (HD) BIP32 wallet needed for the purpose of
// signing claims and illustrating the signing of claims in demos.  It is also to be
// used a tool to speed up iterative development.
// Each instance of this wallet has a single address.
// https://medium.com/bitcraft/so-you-want-to-build-an-ethereum-hd-wallet-cb2b7d7e4998
// https://github.com/ethereum/EIPs/issues/84#issue-143651804
// Updated to simply be a wrapper around the ethereumjs-wallet to handle the actors wallets and signing.
// Requirement and assumptions are that the wallet will only have one address to validate the signatures against.
// More testing will be needed!
import bip39 from 'bip39';
// import ethUtil from 'ethereumjs-util';
// import hdkey from 'ethereumjs-wallet/hdkey';
import hdkey from 'hdkey';
// import ProviderEngine from 'web3-provider-engine';
// import FiltersSubprovider from 'web3-provider-engine/subproviders/filters.js';
// import HookedSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
// import ProviderSubprovider from 'web3-provider-engine/subproviders/provider.js';
import Web3 from 'web3';
// import { Wallet } from 'ethereumjs-wallet';
import { Buffer } from 'safe-buffer';

import { registry } from 'clear-me-identity';
// import { claim } from '../storage/Claim';
import Claim from '../../lib/storage/Claim';
import IPFSAgent from '../../lib/storage/IPFSAgent';
import Resolver from "clear-me-resolver/lib/resolver";
// const Wallet = require('ethereumjs-wallet');
export default class ClearMeWallet{

    constructor(mnemonic, pKey, provider_url, registryAddress){
        this.mnemonic = mnemonic;
        this.pKey = pKey;
        this.provider_url = provider_url;
        this.registryAddress = registryAddress;
        this.ipfsAgent = new IPFSAgent('ipfs.infura.io', '5001', 'https');
        this.resolver = new Resolver('ipfs.infura.io', '5001', 'https');
        this.account = '';
        this.address = '';
        this.ethereumWallet = '';
        this.web3 = '';
    }

    async setClaim(subjectsAddress, claimData){
        this.setUpWeb3Provider();
        const issuerAddress = await this.getAddress();
        let registryInstance = await new this.web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)), this.registryAddress, {gasPrice: '12345678', from: issuerAddress});
        let claim = new Claim(this.ipfsAgent, this.web3, registryInstance._address, subjectsAddress, issuerAddress);
        claim.data = claimData;
        await claim.sign(this.pKey);
        const ipfsHash = await claim.save();
    }

    async getClaim(issuerAddress){
        const web3 = this.setUpWeb3Provider();
        const ownerAddress = await this.getAddress(); 
        let registryInstance = await new web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)), this.registryAddress, {gasPrice: '12345678', from: ownerAddress});        
        const claimHash = await registryInstance.methods.getClaim(ownerAddress, issuerAddress).call();
        const did = `did:clear:${claimHash}`;
        const ddoDoc = await this.resolver.resolve(did);
        const claim = ddoDoc;
        return claim;
    }

    async verifyClaim(signature, subjectsAddress, data){
        this.setUpWeb3Provider();
        let claim = new Claim(this.ipfsAgent, this.web3, this.registryAddress, subjectsAddress, this.address);
        claim.data = data;
        return await claim.verify(signature);
    }

    setUpWeb3Provider(){
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider_url));
        return this.web3;
    }

    async getAddress(){
        const web3 = await this.setUpWeb3Provider(); 
        this.account =  await web3.eth.accounts.wallet.add(this.pKey);  
        this.address = this.account.address;
        return this.address;  
    }

    async getBalance(){
        const web3 = this.setUpWeb3Provider(); 
        const address = await this.getAddress();
        return await this.web3.eth.getBalance(address);
    }

}