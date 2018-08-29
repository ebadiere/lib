import ClearMeWallet from './Clear-me-wallet';
export default class WalletFactory{

    static async createWallet(mnemonic, pKey, provider_url, registryAddress){
        let clearmeWallet = new ClearMeWallet(mnemonic, pKey, provider_url, registryAddress);
        let address = await clearmeWallet.getAddress();

        return clearmeWallet;
    }
}