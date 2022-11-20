import { ethers } from 'ethers'
import * as dotenv from 'dotenv';dotenv.config()

const D=console.log
/** @type {Object.<number,{name:string,provider:string}>}} */ const NETWORKS = {// see https://chainlist.org
  0xa86a: { name: 'AVAX  Mainnet', provider: '' },
  0xa869: { name: 'AVAX Testnet', provider: '' },
  0x38: { name: 'BSC  Mainnet', provider: '' },
  0x61: { name: 'BSC Testnet', provider: '' },
  0x539: { name: 'Local Developer Chain', provider: '' },
  0x1: { name: 'ETH Mainnet', provider: '' },
  0x5: { name: 'ETH Goerli', provider: 'https://goerli.infura.io/v3' },
  0x89: { name: 'MATIC Mainnet', provider: 'https://rpc-mumbai.maticvigil.com' },
  0x13881: { name: 'MATIC Mumbai', provider: 'https://polygon-rpc.com' },
  0xfa: { name: 'FTM Mainnet', provider: 'https://rpc.ftm.tools' },
  0xfa2: { name: 'FTM Testnet', provider: 'https://rpc.testnet.fantom.network' }// range 88
  // 0xfa2: { name: 'FTM Testnet', provider: 'https://fantom-testnet.public.blastapi.io' }// Error 400
  // 0xfa2: { name: 'FTM Testnet', provider: 'https://rpc.ankr.com/fantom_testnet' }// range 88
}// networks
/** @type {string} */ let networkSymbol

/** 
 * @param {number} chainId
 * @returns {ethers.providers.BaseProvider}
 */
export function provider(chainId) {
  // D('process.env.INFURA=',process.env.INFURA)
  networkSymbol = NETWORKS[chainId].name.split(' ')[0]
  return ethers.getDefaultProvider(
    // NETWORKS[chainId].provider
    ethers.providers.getNetwork(chainId),
    {
      etherscan: process.env.ETHERSCAN,
      infura: process.env.INFURA,
      alchemy: process.env.ALCHEMY,// range 88
    }
  )
}

/** 
 * @param {BigInt} n
 * @returns {string}
 */
//  export function bigIntToAddress(n) { return '0x' + n.toString(16) }
export function bigIntToAddress(n) { return n.toString(16) }

/** 
 *  used by logging / tracing
 * 
 * @param {BigInt} n
 * @returns {string}
 */
const chars = 4
export function bigIntToAddressCompact(n) { return '0x' + n.toString(16).slice(0, chars) + '...' + n.toString(16).slice(-chars) }

/** 
 * @param {BigInt} n
 * @returns {string}
 */
export function bigIntToPrice(n, symbol = false) { return n + (symbol ? ' ' + networkSymbol : '') }

/**
 * @param {number} pos
 * @returns {BigInt|null}
 */
export function getBigUint256(buffer, pos=0) {
  try{
    return (buffer.readBigUint64BE(0 + pos) << 192n) + (buffer.readBigUint64BE(8 + pos) << 128n) + (buffer.readBigUint64BE(16 + pos) << 64n) + buffer.readBigUint64BE(24 + pos)
  }catch{return null}
}