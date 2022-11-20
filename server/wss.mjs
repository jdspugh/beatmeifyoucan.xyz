/** @typedef {import('./types.mjs').WsSession} WsSession */
/** @ts-ignore */
import {WebSocketServer} from 'ws'
import {Player} from './player.mjs'
import {Players} from './players.mjs'
import {m} from './db-ethers.mjs'
// lowercase = msg from browser's data
// uppercase = msg from server's data
//
//                              You              Server            Opponent            Not You              All
//                               |                  |                  |                  |                  |
//       {                   join|--------j-------->|                  |                  |                  |    ${p.sessionId} j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}
//  join { your session id & name|<-------Y---------|                  |                  |                  |    ${wsSession.playerSessionId} Y
//       {            all players|<-------J---------|                  |                  |                  |    ${p.sessionId} J ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}
//       {                       |                  |---------j-------------------------->|new player joined |    ${p.sessionId} j ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}
//                               v                  v                  v                  v                  v
//       
//                              You              Server            Opponent            Not You              All
//                               |                  |                  |                  |                  |
//        {                attack|--------r-------->|<--------r--------|attack            |                  |    r ${o} ${e.target.innerText.codePointAt(0)-9994}`
//  fight {                      |                  |---------R--------------------------------------------->|battle results
//        {                      |                  |                  |                  |                  |    R ${p1.sessionId} ${p1.attack} ${p2.sessionId} ${p2.attack}
//                               v                  v                  v                  v                  v
//       
//                              You              Server            Opponent            Not You              All
//        {                      |                  |                  |                  |                  |
//   move {                      |------coords----->|-----coords------------------------->|                  |
//        {                      |                  |                  |                  |                  |
//                               v                  v                  v                  v                  v
//       
//                              You              Server            Opponent            Not You              All
//        {                      |                  |                  |                  |                  |
//   chat {                      |--------m-------->|---------m-------------------------->|                  |
//        {                      |                  |                  |                  |                  |
//                               v                  v                  v                  v                  v
//
const D = console.log

m.on('e',e=>{D('emitted blockchain game state e=',e)})

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
    try{
      d=d.toString()
      D('Rx d=', d)
      switch(d[0]){
        case 'r':
          f = d.split(' ')
          // attacker
          p1 = Players.getPlayer(wsSession.playerSessionId)
          p1.attack = parseInt(f[2])
          // target
          p2 = Players.getPlayer(parseInt(f[1]))
          if(!p2)break// maybe the server just booted up?
          p1.opponent = p2
          if(p1==p2.opponent && p2==p1.opponent) {
            let s=`R ${p1.sessionId} ${p1.attack} ${p2.sessionId} ${p2.attack}`
            broadcast(wsSession,s,true)
            D(s)
            p1.attack = p2.attack = p1.opponent = p2.opponent = null
          }
          break
        case 'j':
          f = d.split(' ')
          p1 = Players.getPlayer(wsSession.playerSessionId)
          D('wsSession.send(`${wsSession.playerSessionId} Y`)')
          wsSession.send(`${wsSession.playerSessionId} Y`)// let the player know their own session id
          D('p1=',p1,'f=',f)
          p1.x=parseInt(f[1]); p1.y=parseInt(f[2]); p1.vx=parseInt(f[3]); p1.vy=parseInt(f[4]); p1.name=f[5]; p1.avatar=f[6]
          Players.map(p=>{wsSession.send(`${p.sessionId} J ${p.x} ${p.y} ${p.vx} ${p.vy} ${p.name} ${p.avatar}`)})// let the player know all of the players in the world
          broadcast(wsSession, d)
          break;
        case 'm':
          broadcast(wsSession, d)
          break
        default:
          f = d.split(' ')
          p1 = Players.getPlayer(wsSession.playerSessionId)
          p1.x=parseInt(f[0]); p1.y=parseInt(f[1]); p1.vx=parseInt(f[2]); p1.vy=parseInt(f[3])
          broadcast(wsSession, d)
      }
    }catch(e){D('ws messge e=',e)}
  })// broadcast
})
//w.on('close',e=>console.log('close e=',e))// never triggered. ws bug?

/**
 * @param {any} wsSession 
 * @param {string} d 
 * @param {boolean} includeSelf 
 */
function broadcast(wsSession,d,includeSelf=false) {
  let n=0
  w.clients.forEach(c=>{
    // D('broadcast() c.playerSessionId=', c.playerSessionId)
    if(includeSelf||wsSession!=c) {
      c.send(`${wsSession.playerSessionId} ${d}`)
      n++
    }
  })// broadcast
  D(`broadcast ${n}`)
}

/**
 * Cleanup leftover player sessions
 * 
 * @returns void
 */
function clean(){
  if (w.clients.size == Players.sk) return // no cleanup needed
  // collect active session ids (from ws)
  const s=new Set
  w.clients.forEach(c=>s.add(c.playerSessionId))
  // remove player sessions that have timed out (in ws)
  D('clean() s=',s,'Players.sk=',Players.sk)
  Players.sk.forEach((_,k)=>{
    if(s.has(k))return// continue
    Players.sk.delete(k)
  })
};setInterval(clean,6e4)// repeat every 60s

function dump(){D(Players.dump(w.clients.size))}dump();setInterval(dump,4e3)// repeat every 4s