import { provider, getBigUint256 } from './web3.mjs'
import { fromBlock, address, chainId } from './contract.mjs'
import sqlite from 'sqlite3'
import { Keccak } from 'sha3';const K=new Keccak(256)

const D=console.log
const db=new sqlite.Database('./games.db',sqlite.OPEN_READWRITE,console.error)
const topicSignatures=['Open(uint256,uint8,address)','Close(uint256,uint16)','Reveal(uint256,uint16)','Claim(uint256)','Cancel(uint256)','Duration(uint16)']
const topicHashes=topicSignatures.map(s=>`0x${K.update(s).digest().toString('hex')}`)

db.run('CREATE TABLE IF NOT EXISTS games(n,t,b,a1,a2,d,m1,m2)')//n=game number,t=game opening time,b=bet amount,d=duration

function eventProcess(event) {
  D('event=', event)
  const d=Buffer.from(event.data.slice(2),'hex')// data
  switch (topicHashes.indexOf(event.topics[0])) {
    case 0:// open
      const [n,r,targetPlayer] = [getBigUint256(d,0),getBigUint256(d,256),getBigUint256(d,512)]
      D('n,r,targetPlayer=',n,r,targetPlayer)
    // const owner = BigInt(event.topics[1])
      // const remixOf = parseInt(event.topics[2])
      // const codeLength = data.readUInt32BE(32 * 3 - 4)
      // const code = data.slice(32 * 3, 32 * 3 + codeLength).toString()
      // D('Minted id=', id, 'price=', bigIntToPrice(price), 'owner=', bigIntToAddress(owner))
      // pieces.set(id, { price: price, owner: owner, remixOf: remixOf, code: code, creator: owner })
      // // D('holdings.get(owner)=', holdings.get(owner))
      // // D('before holdings=', holdings)
      // if (holdings.get(owner)) { holdings.get(owner).add(id) } else holdings.set(owner, new Set([id]))
      // // D('after holdings=', holdings)
      break
    case 2:
      // // bought
      // const buyer = BigInt(event.topics[1])
      // D('Bought id=', id, 'price=', bigIntToPrice(price), 'buyer=', bigIntToAddress(buyer))
      // const p = pieces.get(id)
      // p.price = price

      // if (p.owner == buyer) break // nothing to do if buyer=seller

      // // add to new holder's stash
      // const buyerHoldings = holdings.get(buyer)
      // if (buyerHoldings) { holdings.get(buyer).add(id) } else holdings.set(buyer, new Set([id]))

      // // delete from old holder's stash
      // holdings.get(p.owner).delete(id)

      // // set piece's new owner
      // p.owner = buyer
      break
    case 1:
      // // priced
      // D('Priced id=', id, 'price=', bigIntToPrice(price))
      // pieces.get(id).price = price
  }// switch
}

// returned from oldest to newest
D('------------')
D('transactions')
D('------------')
const chain = await provider(chainId)
;(await chain.getLogs({
  address: address,
  fromBlock: fromBlock,
  toBlock: 'latest',
  topics: []
})).forEach(ev => eventProcess(ev))
D('------------')
D()
// piecesDump(pieces)
// holdingsDump(holdings)

chain.on({
  address: address,
  topics: []
}, ev => {
  D('ev=', ev)
  eventProcess(ev)
})