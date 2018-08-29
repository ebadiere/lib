import Web3 from 'web3';
import { registry } from 'clear-me-identity';

export default class Registry {
    constructor(web3, account){
        this.account = account;
        this.registryContract = '';
        this.Web3 = web3;
    }

    async deploy(){
        this.registryContract = await new this.Web3.eth.Contract(JSON.parse(JSON.stringify(registry.abi)))
            .deploy({ data: registry.bytecode})
            .send({ gas: '1000000', from: this.account });
        return this.registryContract;
    }

    async setClaim(subject, claimHash, issuer){
        await this.registryContract.methods.setClaim(subject, claimHash).send({ 
        gas: '1000000',
        from: issuer});
    }

    async getClaim(issuer, subject){
        return await this.registryContract.methods.getClaim(issuer, subject).call();
    }
}