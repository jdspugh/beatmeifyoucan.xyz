/** @ts-ignore */
import {WebSocketServer} from 'ws'

import {Player} from './player.mjs'
import {Players} from './players.mjs'

const D = console.log

const w = new WebSocketServer({host:'127.0.0.1',port:8091})
w.on('connection',(
  /** @type {WsSession} */ wsSession,
  wsReq
)=>{
  const k = wsReq.url.slice(wsReq.url.lastIndexOf('/')+1)//player key
  const s = Players.getSessionId(k)
  if(s) {
    // resume session
    wsSession.playerSessionId = s
  } else {
    // new session
    const n = Players.newSessionId()
    wsSession.playerSessionId = n
    Players.addPlayer(wsSession,k,n,new Player)
  }
  wsSession.playerKey = k
  // wsSession.t=Date.now()

  /** @type string */ let f
  /** @type Player */ let p1, p2
  wsSession.on('message', d=>{
    d=d.toString()
    // D('wsSession.playerSessionId=', wsSession.playerSessionId, 'd=', d)
    switch(d[0]){
      case 'r':
        f = d.split(' ')
        // attacker
        p1 = Players.getPlayer(wsSession.playerSessionId)
        p1.attack = parseInt(f[2])
        // target
        p2 = Players.getPlayer(parseInt(f[1]))
        if(!p2)break// maybe the server just booted up?
        // p2.wsSession.send(`r ${p1.sessionId}`)// attack is cached on the server, hidden from the target
        p1.opponent = p2
        if(p1==p2.opponent && p2==p1.opponent) {
          let s=`R ${p1.sessionId} ${p1.attack} ${p2.sessionId} ${p2.attack}`
          broadcast(s)
          D(s)
          p1.attack = p2.attack = p1.opponent = p2.opponent = null
        }
        break
      case 'j':
        f = d.split(' ')
        p1 = Players.getPlayer(wsSession.playerSessionId)
        p1.x=parseInt(f[1]); p1.y=parseInt(f[2]); p1.vx=parseInt(f[3]); p1.vy=parseInt(f[4]); p1.name=f[5]; p1.avatar=f[6]
        Players.map(p=>{/*D('wsSession.playerSessionId,p=',wsSession.playerSessionId,p.toString());*/if(wsSession.playerSessionId!=p.sessionId)wsSession.send(`${p.sessionId} j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}`)})
        // wsSession.send(`j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}`)
        broadcast(wsSession, d)
        break;
      default:
        f = d.split(' ')
        p1 = Players.getPlayer(wsSession.playerSessionId)
        p1.x=parseInt(f[0]); p1.y=parseInt(f[1]); p1.vx=parseInt(f[2]); p1.vy=parseInt(f[3])
        broadcast(wsSession, d)
        // w.clients.forEach(c=>{D('c.playerSessionId=', c.playerSessionId)
        // if(wsSession!=c)c.send(`${wsSession.playerSessionId} ${d}`)})// broadcast
    }
  })// broadcast
  // setTimeout(function f(){Date.now()-s.t<3e4?setTimeout(f,1e4):(D('timeout session s.n=',s.n,'w.clients.size=',w.clients.size),delete m[s.u],s.terminate(),s=null)},36e5)// 60m timeout
})
//w.on('close',e=>console.log('close e=',e))// never triggered. ws bug?

function broadcast(wsSession,d) {
  let n=0
  w.clients.forEach(c=>{
    // D('c.playerSessionId=', c.playerSessionId)
    if(wsSession!=c) {
      c.send(`${wsSession.playerSessionId} ${d}`)
      n++
    }
  })// broadcast
  D(`broadcast ${n}`)
}

function dump(){D(Players.dump(w.clients.size))}dump();setInterval(dump,4e3)