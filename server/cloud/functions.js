function L(...a){return logger.info(JSON.stringify(a))}
const M=Moralis
const Game=M.Object.extend('Game')
const Q=new M.Query(Game)
const w=new M.Web3(new M.Web3.providers.HttpProvider('https://evm-t3.cronos.org'))//testnet
//const w=new M.Web3(new M.Web3.providers.HttpProvider('https://public-cronos.w3node.com'))//mainnet
const C=new w.eth.Contract(CONTRACT.abi,CONTRACT.address)

M.Cloud.afterSave('Update',async req=>{
  //get game blockchain
  const n=req.object.get('n')
  const r=await C.methods.H(n).call()

  //store game in db
  const g=(await Q.equalTo('n',n).find())[0]
  if(!g)g=new Game()
  await g.save({n:n,t:r.t,b:r.b,a1:r.a1.toLowerCase(),a2:r.a2.toLowerCase(),d:r.d,m1:r.m1,m2:r.m2})
})
