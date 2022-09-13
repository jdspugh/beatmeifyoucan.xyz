function L(...a){return logger.info(JSON.stringify(a))}
const M=Moralis
const Game=M.Object.extend('Game')
const Q=new M.Query(Game)

M.Cloud.afterSave('Update',async req=>{
  L('Update req=',req)
  const n=req.object.get('n')
  //get game
  const w=new M.Web3(new M.Web3.providers.HttpProvider('https://evm-t3.cronos.org'))//testnet
  //const w=new M.Web3(new M.Web3.providers.HttpProvider('https://public-cronos.w3node.com'))//rockx mainnet
  L('w=')
  const c=new w.eth.Contract(CONTRACT.abi,CONTRACT.address)
  L('c=',c)
  const r=await c.methods.H(n).call()
  L('r=',r)
  //store game
  const q=Q.equalTo('n',n)
  const gs=await q.find()
  let g=gs[0]
  L('g=',g)
  if(!g)g=new Game()
  await g.save({n:n,t:r.t,b:r.b,a1:r.a1,a2:r.a2,d:r.d,m1:r.m1,m2:r.m2})
})