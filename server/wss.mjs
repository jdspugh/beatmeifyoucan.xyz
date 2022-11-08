/** @ts-ignore */
import {WebSocketServer} from 'ws'

import {Player} from './player.mjs'
import {Players} from './players.mjs'

const D = console.log

const w = new WebSocketServer({host:'127.0.0.1',port:8091})
w.on('connection', (wsSession,wsReq)=>{
  const k = wsReq.url.slice(wsReq.url.lastIndexOf('/')+1)//player key
  const s = Players.getSessionId(k)
  if(s) {
    wsSession.playerSessionId = s
  } else {
    const n = Players.newSessionId()
    wsSession.playerSessionId = n
    Players.addPlayer(k,n,new Player)
  }
  wsSession.playerKey = k
  // wsSession.t=Date.now()

  /** @type string */ let f
  /** @type Player */ let p
  wsSession.on('message', d=>{
    d=d.toString()
    D('wsSession.playerSessionId=', wsSession.playerSessionId, 'd=', d)
    switch(d[0]){
      case 'r':
        f = d.split(' ')
        D('Players.getPlayer(parseInt(f[1]))=', Players.getPlayer(parseInt(f[1])))
        break
      case 'j':
        f = d.split(' ')
        p = Players.getPlayer(wsSession.playerSessionId)
        p.x=parseInt(f[1]); p.y=parseInt(f[2]); p.vx=parseInt(f[3]); p.vy=parseInt(f[4]); p.name=f[5]; p.avatar=f[6]
        Players.map(p=>{D('wsSession.playerSessionId,p=',wsSession.playerSessionId,p);if(wsSession.playerSessionId!=p.sessionId)wsSession.send(`${p.sessionId} j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}`)})
        // wsSession.send(`j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}`)
        broadcast(wsSession, d)
        break;
      default:
        f = d.split(' ')
        p = Players.getPlayer(wsSession.playerSessionId)
        p.x=parseInt(f[0]); p.y=parseInt(f[1]); p.vx=parseInt(f[2]); p.vy=parseInt(f[3])
        broadcast(wsSession, d)
        // w.clients.forEach(c=>{D('c.playerSessionId=', c.playerSessionId)
        // if(wsSession!=c)c.send(`${wsSession.playerSessionId} ${d}`)})// broadcast
    }
  })// broadcast
  // setTimeout(function f(){Date.now()-s.t<3e4?setTimeout(f,1e4):(D('timeout session s.n=',s.n,'w.clients.size=',w.clients.size),delete m[s.u],s.terminate(),s=null)},36e5)// 60m timeout
})
//w.on('close',e=>console.log('close e=',e))// never triggered. ws bug?

function broadcast(wsSession,d) {
  w.clients.forEach(c=>{D('c.playerSessionId=', c.playerSessionId)
  if(wsSession!=c)c.send(`${wsSession.playerSessionId} ${d}`)})// broadcast
}

setInterval(()=>{Players.dump(), D('w.clients.size=', w.clients.size)}, 5e3)