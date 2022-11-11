import{Database}from'sqlite-async'
import express from'express'
import{Keccak}from'sha3'
import * as dotenv from'dotenv';dotenv.config()

const D=console.log

// sqlite
const db=await Database.open('./games.db')
await db.run('CREATE TABLE IF NOT EXISTS games(t,n PRIMARY KEY,tg,r,b,a1,a2,d,m1,m2)')//t=block timestamp,n=game id,tg=game opening time,r=rounds,b=bet amount,d=duration
async function dump(){await db.each('SELECT * FROM games',[],(err,row)=>D('row=',row))};dump()

// moralis
const topics=['Open(uint256,uint8,address)','Close(uint256,uint16)','Reveal(uint256,uint16)','Claim(uint256)','Cancel(uint256)']
const topicHashes=topics.map(s=>`0x${new Keccak(256).update(s).digest().toString('hex')}`);D('topicHashes=',topicHashes)
const app=express();app.use(express.json());app.listen(8092);app.post('/stream',async req=>{
  // D('req.body=',req.body)
  const b=req.body,l=b.logs[0];D('l=',l)
  const d=Buffer.from(l.data.slice(2),'hex')//event data
  const t=parseInt(b.block.timestamp)
  const a=[];for(let i=0;i<d.length;i+=32){a.push(d.slice(i,i+32))}//gather 32 byte event variables
  switch(topicHashes.indexOf(l.topic0)){
    case 0://Open
      await db.run('INSERT INTO games(t,n,r,a2) VALUES(?,?,?,?) ON CONFLICT DO UPDATE SET t=excluded.t, r=excluded.r, a2=excluded.a2',[
        t,a[0],a[1],a[2]
      ])
      break
    case 1://Close
      await db.run('INSERT INTO games(t,n,m2) VALUES(?,?,?) ON CONFLICT DO UPDATE SET t=excluded.t, m2=excluded.m2',[
        t,a[0],a[1]
      ])
      break
    case 2://Reveal
      await db.run('INSERT INTO games(t,n,m1) VALUES(?,?,?) ON CONFLICT DO UPDATE SET t=excluded.t, m1=excluded.m1',[
        t,a[0],a[1]
      ])
      break
    case 3://Claim
      await db.run('INSERT INTO games(t,n) VALUES(?,?) ON CONFLICT DO UPDATE SET t=excluded.t',[
        t,a[0]
      ])
      break
    case 4://Cancel
      await db.run('INSERT INTO games(t,n) VALUES(?,?) ON CONFLICT DO UPDATE SET t=excluded.t',[
        t,a[0]
      ])
      break
    case 5://Duration
      await db.run('INSERT INTO games(t,d) VALUES(?,?) ON CONFLICT DO UPDATE SET t=excluded.t, d=excluded.d',[
        t,a[0]
      ])
  }dump()
})