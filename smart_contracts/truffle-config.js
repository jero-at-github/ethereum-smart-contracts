/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = 'embark clarify seven matter sauce then poet math hammer recycle business social';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {    
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
        provider: function() { 
            return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/8da2ccf1f93e4660a6a9d1fabbf4ffd0') 
        },
        network_id: 4,
        gas: 4500000,
        gasPrice: 10000000000,
    }    
  }
};
