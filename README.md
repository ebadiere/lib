# clear-me-lib

This library project is intended to handle all utility and 
external services.

It is currently started with an IPFS agent, but JWT handling, 
encoding and encryption will also be developed in this
project to be consumed by the resolver and any future
clearme services, portals and wallets.

**Issues**
At this time the ipfs pin rm is not working through the
infura service provider.  There seems to be some kind of
"revamp" effort around the API gateway:
https://github.com/INFURA/infura/issues/86

As a workaround the pin rm test needs a local ipfs daemon
to be running.  

**Getting Started**

1. git clone https://github.com/clear-me/clear-me-lib.git
2. cd clear-me-identity
3. npm install
4. npm test

**Basic Economic Model and Functionality**<br/>
- The claim issuer signs the claim and pays the gas costs for recording the claim to the registry.
- The wallet address with its private key and ability to sign messages is the lowest level identifier and building block for the identity system.
- The process of validating claims at its lowest level is simply verifying signatures on data or messages.
- The current registry design limits one claim for one subject per issuer, and issuer being an entity such as clearme, CU Boulder, the DMV, etc.   [EIP1056](https://github.com/ethereum/EIPs/issues/1056) may provide a more flexible and scalable design for the registry.

The Web-Of-Trust-Claims test does the following:
1. Creates a clearme identity claims signed by the clear me wallet, as part of the setup. Claims are created for the student, CU Boulder and the CU Boulder prof.
2. Validates the student's clearme identity by verifying the clearme signature and then creates a student ID claim signed by the CU Boulder wallet.
3. Assumes the student will get the CU Prof's merit claim.  Validates the student's ID claim by verifying the CU Boulder's signature, and then create's and signs the merit claim.

**Next Steps**
Create a test stepping through the authentication process running on rinkeby.  The identity (the subject's wallet address and private key) and a clearme identity claim will be validated by verifying the clearme wallet signature on the clearme identity claim.  Once validated a JWT will be created for further short term interaction.  This code will then be used in a react app representing the CU Boulder website.  Add QR code interaction.

**Key Concepts**
- Passwords are not needed as the identity is used to authenticate to a site.  Very powerful!
- Various sites may validate various claims are part of their authentication process, i.e. CU Boulder portal authentication requires a valid CU Student claim, a gambling website authentication requires a claim of age of majority signed by the DMV.  A medical marijuana purchasing facility requires a valid claim of age of majority, and a valid claim of necessarity signed by the local or state government.


**Open Issues**
- Rotation of keys as described in [ERC1056](https://github.com/ethereum/EIPs/issues/1056).  Currently this can be supported because the clearme identity contract is a simple deployed contract 
with an isOwner method.  A proxy contract can be developed to change the owner, in the case of a phone or wallet replacement.  More thought is needed.
- Not urgent, however the wallet needs to be implemented with the qr code UI.
- does the did need to be in the claim?  Security risk?

Source/References:
https://medium.com/@angellopozo/ethereum-signing-and-validating-13a2d7cb0ee3
https://hackernoon.com/never-use-passwords-again-with-ethereum-and-metamask-b61c7e409f0d
https://www.w3.org/TR/verifiable-claims-data-model/#expressing-an-entity-profile-in-json

**Building a simple wallet:**
https://medium.com/bitcraft/hd-wallets-explained-from-high-level-to-nuts-and-bolts-9a41545f5b0
https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
https://medium.com/bitcraft/so-you-want-to-build-an-ethereum-hd-wallet-cb2b7d7e4998

https://bitcoin.org/en/developer-guide#wallets
https://github.com/ethereum/EIPs/issues/84#issue-143651804

**BIP 39 values**
https://iancoleman.io/bip39/

**Demo scenario: Login into a CU Boulder portal using a CU Student ID and NOT a password**
The Clear-me-wallet-test.js

Reference: 
https://hackernoon.com/never-use-passwords-again-with-ethereum-and-metamask-b61c7e409f0d

BIP39 Address generation and validation:
https://iancoleman.io/bip39/

**Scenario actors and wallets**<br/><br/>
```
clearmeMnemonic = 'fiction remind pioneer forget lamp raven daring damp warm immense pet fruit';
clearmePrivateKey = '0x683bed6481d026d5a313d04711ac4865ed7df3d34e0cdff7011c88895f9b4652';
clearmeEthereumWalletAddress = '0x973E9D98f5139777E4706a56d54f652441c73A68';
   
cuStudentMnemonic = 'urban under ring worth song detect squeeze man divorce enforce help grant';
cuStudentPrivateKey = '0x3b7d3590ca072efb83ee55b76d0fbcae18a9997c7f0d0d85bf74eb2a45c82a08';
cuStudentEthereumWalletAddress = '0x314050466d3946A0Cf36034C4b55Fa026aA8bC9c';

cuBoulderMnemonic = 'future also tunnel version bleak supply eternal round quick link assume risk';
cuBoulderPrivateKey = '0x4b7826cd9aa1d7e88c97c8ed815922026fae9e7a9f0a1c7a31dfe80777000a15';
cuBoulderEthereumWalletAddress = '0x2c807a03a1947a96640f1670A9b4AF47010620b4';
```
 

The wallets can be thought of as identities.  At its very basic level, an indentity is a public address with a private key.
Claims are signed by an authority using its wallet's private key.

The clear-me-wallet implementation in this project is meant to be a dev tool for creating and signing claims, as well as
being a guide for the actual mobile wallet implementation.  It uses the web3-js implementation.

**Necessary identity infrastructure for scenario**
1. A clear-me idenitity, which is a clear-me identity claim issued and signed by the clear-me wallet.
2. A CU Student ID claim, issued and signed by the CU Boulder wallet.

**Detailed description of the CU Portal login process**
1. Clear-me runs a background check and confirms that this person is indeed who he says he is.
2. A claim in JSON format is issued by clear-me.  It is signed by clear-me using the clear-me wallet's private key.
3. The claim is recorded in the registry and stored on IPFS.
4. The person now applies for a CU Student ID.
5. CU asks Clear-me to verify the clear-me claim.
6. Clear-me looks up the claim in the registry, and then uses the resolver to fetch the claim from IPFS.
7. The signature on the claim is verified using the private key.  If correct the returned public address should match clear-me's public wallet address.
8. CU Boulder issues the now student, an ID claim using the same process.
9. A claim in JSON format is issued by CU Boulder.  It is signed by CU Boulder using the CU Boulder wallet's private key.
10. The claim is recorded in the registry and stored on IPFS.
11. The person/user now has two claims, that only they control.
12. Person/user now wants to log into the CU Portal.
13. The user sends his CU Identity claim to the web site.
14. On the back end the claim is verified by the CU Boulder wallet.
15. When the CU Boulder signature on the claim is verified using the CU Boulder wallet's private key, a JWT is create to track the login session.
16. The JWT can have a expiration date and time and be treated like all other JWTs.  It can be added to the susequents HTTP requests authorization header in an O-auth style, and the user is now logged into the CU Boulder website or portal.







