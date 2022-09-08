function L(...a){return logger.info(JSON.stringify(a))}
const M=Moralis

M.Cloud.define('gamesOpen',async()=>{
  return 'hello!'
})

M.Cloud.afterSave('updates',async(req)=>{
  const n=req.object.get('n')
  //get game
  const w=new M.Web3(new M.Web3.providers.HttpProvider('https://evm-t3.cronos.org'))
  const c=new w.eth.Contract(CONTRACT.abi,CONTRACT.address)
  const r=await c.methods.H(n).call()
  //store game
  const Game=M.Object.extend('Game')
  const Q=new M.Query(Game)
  const q=Q.equalTo('n',n)
  const gs=await q.find()
  let g=gs[0]
  if(!g)g=new Game()
  await g.save({n:n,t:r.t,b:r.b,a1:r.a1,a2:r.a2,d:r.d,m1:r.m1,m2:r.m2})
})