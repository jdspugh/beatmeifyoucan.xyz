import{WebSocketServer}from'ws'

const D=console.log
const w=new WebSocketServer({host:'127.0.0.1',port:8091})

let n=0
w.on('connection',s=>{
  s.n=n++
  s.on('message',m=>w.clients.forEach(c=>{if(s!=c)c.send(`${s.n} ${m}`)}))
})
w.on('close',e=>console.log('close e=',e))