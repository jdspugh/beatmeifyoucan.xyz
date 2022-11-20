import{HardhatUserConfig}from'hardhat/config'
import * as dotenv from'dotenv';dotenv.config()
import'@nomicfoundation/hardhat-toolbox'
import'hardhat-gas-reporter'
import'hardhat-watcher'
import'solidity-coverage'
import'hardhat-tracer'
import'hardhat-gas-trackooor'

const config: HardhatUserConfig = {  
  watcher: {
    all: {
      files: ['contracts/*','test/*'],
      tasks: ['coverage','test'],
      verbose: true
    },
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'USD',
    gasPrice: 80
  },
  networks: {
    hardhat: {
      accounts:{accountsBalance:'1000000000000000000000'},
      initialBaseFeePerGas: 0,
      gasPrice: 0,
    }
  },
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      }
    }
  }
}

export default config;
