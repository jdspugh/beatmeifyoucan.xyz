import{WebSocketServer}from'ws'

const D=console.log
const w=new WebSocketServer({host:'127.0.0.1',port:8091})

let n=0,m={}

w.on('connection',(s,q)=>{
  const u=q.url.slice(q.url.lastIndexOf('/')+1);m[u]?s.n=m[u]:(s.n=n,m[u]=n++);s.u=u// restore session from client key
  s.on('message',m=>{D('s.n=',s.n,'m=',m.toString());w.clients.forEach(c=>{D('c.n=',c.n);if(s!=c)c.send(`${s.n} ${m}`)});s.t=Date.now()})// broadcast
  setTimeout(function f(){Date.now()-s.t<3e4?setTimeout(f,1e4):(D('timeout session s.n=',s.n,'w.clients.size=',w.clients.size),delete m[s.u],s.terminate(),s=null)},36e5)// 60m timeout
})
//w.on('close',e=>console.log('close e=',e))// never triggered. ws bug?

setInterval(_=>D('m=',m,'w.clients.size=',w.clients.size),1e3)