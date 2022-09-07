function L(...a){return logger.info(JSON.stringify(a))}

Moralis.Cloud.define('gamesOpen',async req=>{
/*  const query=new Moralis.Query('Review')
  query.equalTo('movie', request.params.movie)
  const results=await query.find()
  let sum=0
  for(let i=0;i<results.length;++i){
    sum+=results[i].get('stars')
  }
  return sum/results.length*/
  return 'hello!'
})

Moralis.Cloud.afterSave('updates',async()=>{
  L('afterSave(updates)')
  web3 = new Moralis.Web3(new Moralis.Web3.providers.HttpProvider('https://evm-t3.cronos.org'))
  const contract = new web3.eth.Contract(CONTRACT.abi,CONTRACT.address)
  const r=await contract.methods.H(0).call().catch(e=>L('e=',e))
  L('r=',r)
})