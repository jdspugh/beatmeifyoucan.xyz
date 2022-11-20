import { provider } from './web3.mjs'
import { fromBlock, address, chainId } from './contract.mjs'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { Keccak } from 'sha3';const K=new Keccak(256)
import keypress from 'keypress'
import { EventEmitter } from 'node:events'
//
// Useage:
//   import {m} from 'db-ethers.mjs'
//   m.on('e',()=>console.log)
//
//   Events:
//     <a1> challenged <a2> with bet <b>
//     <a1> beat <a2> with bet <b> with moves <m1>,<m2>
//

const D=console.log

// --
// db
// --
const db=await open({filename:'./games.db',driver:sqlite3.Database})
const k='n',f=['t','n','tg','r','b','a1','a2','d','m1','m2']// keys,fields(t=block time,n=game number,t=game opening time,b=bet amount,d=duration)
await db.run(`CREATE TABLE IF NOT EXISTS games(${f.reduce((p,c)=>p+','+(k==c?c+' PRIMARY KEY':c))})`)
async function upsert(
  /** @type {Object} */ f,
  /** @type {string} */ k
) {
  const y=Object.keys(f)
  const s=`INSERT INTO games(${y.join()}) VALUES(${'?,'.repeat(y.length).slice(0,-1)}) ON CONFLICT(${k}) DO UPDATE SET ${y.reduce((p,c)=>p+`,${c}=excluded.${c}`,'').slice(1)}`
  // D('upsert() s=',s,'f=',f,'k=',k)
  await db.run(s,Object.values(f))
}
// --

// ------
// events
// ------
// topics
const ts=['Open(uint256,uint8,address)','Close(uint256,uint16)','Reveal(uint256,uint16)','Claim(uint256)','Cancel(uint256)','Duration(uint16)']// topic signatures
const th=ts.map(s=>`0x${new Keccak(256).update(s).digest().toString('hex')}`)// topic hashes
D('ts=',ts,'th=',th)
export const m=new EventEmitter()
async function eventProcess(e) {
  D('e=',e)
  const d=Buffer.from(e.data.slice(2),'hex'),S=n=>d.slice(n*32,n*32+32)// data
  const t=(await provider(chainId).getBlock(e.blockNumber)).timestamp
  const n=S(0)
  switch (th.indexOf(e.topics[0])) {
    case 0:await upsert({ t:t, n:n, tg:t, r:S(1), a2:S(2) },k);break//open
    case 1:await upsert({ t:t, n:n, m2:S(1) },k);break// close
    case 2:await upsert({ t:t, n:n, m1:S(1) },k)// reveal
    case 3:await upsert({ t:t, n:n },k);break// claim
    case 4:await upsert({ t:t, n:n },k);break// cancel
    case 5:await upsert({ t:t, d:n },k);break// duration
  }
  m.emit('e',await db.get('SELECT * FROM games WHERE n=?',[n]))
}

const chain = await provider(chainId)
// retrieve historical events (oldest to newest)
;(await chain.getLogs({address:address,fromBlock:fromBlock,toBlock:'latest',topics:[]})).forEach(e=>eventProcess(e))
// listen for ongoing events
chain.on({address:address,topics:[]},e=>{D('e=',e);eventProcess(e)})
// ------

// ---------
// debugging
// ---------
/**
 * @param {string} k
 * @param {bigint|number|string} v
 * @returns {bigint|number|string|Date}
 */
function F(k,v) {
  return 't'==k[0]?new Date(/**@type {number}*/(v)*1e3).toLocaleString():'Buffer'==v?.constructor.name?BigInt('0x'+/**@type {Buffer}*/(/**@type {unknown}*/(v)).toString('hex')):v
}
process.stdin.on('keypress', async(ch,key) => {
  if (key.ctrl && key.name == 'c') process.exit()
  switch (ch) {
    case '\r':case '\n':console.log();return //<--!!!
    case 'd':
      const a=await db.all('SELECT * FROM games ORDER BY n')
      // D('a=',a)
      const s=a.map(r=>{for(const k of Object.keys(r)){r[k]=F(k,r[k])};return r})
      // D('s=',s)
      console.table(s)
      break
    default:
      printInstructions()
  }
})
function printInstructions(){
  D('KEYBOARD COMMANDS: d = dump, ctrl-c = exit')
};printInstructions()
keypress(process.stdin);process.stdin.setRawMode(true)
// ---------