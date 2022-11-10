/** @ts-ignore */
/** @type {typeof import('./types.mjs').WsSession} */
/** @ts-ignore */
import {WebSocketServer} from 'ws'
import {Player} from './player.mjs'
import {Players} from './players.mjs'
// lowercase = msg from browser
// uppercase = msg from server
//
//                          You              Server            Opponent            Not You              All
//                           |                  |                  |                  |                  |
//       {               join|--------j-------->|                  |                  |                  |
//  join {    your session id|<-------Y---------|                  |                  |                  |
//       {        all players|<-------J---------|                  |                  |                  |
//       {                   |                  |---------j-------------------------->|new player joined |
//                           v                  v                  v                  v                  v
//
//                          You              Server            Opponent            Not You              All
//                           |                  |                  |                  |                  |
//        {            attack|--------r-------->|<--------r--------|attack            |                  |
//  fight {                  |                  |---------R--------------------------------------------->|battle results
//        {                  |                  |                  |                  |                  |
//                           v                  v                  v                  v                  v
//
//                          You              Server            Opponent            Not You              All
//        {                  |                  |                  |                  |                  |
//   move {                  |------coords----->|-----coords------------------------->|                  |
//        {                  |                  |                  |                  |                  |
//                           v                  v                  v                  v                  v
//
//                          You              Server            Opponent            Not You              All
//        {                  |                  |                  |                  |                  |
//   chat {                  |--------m-------->|---------m-------------------------->|                  |
//        {                  |                  |                  |                  |                  |
//                           v                  v                  v                  v                  v
//
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
        p1.opponent = p2
        if(p1==p2.opponent && p2==p1.opponent) {
          let s=`R ${p1.sessionId} ${p1.attack} ${p2.sessionId} ${p2.attack}`
          broadcast(wsSession,s,true)
          D(s)
          p1.attack = p2.attack = p1.opponent = p2.opponent = null
        }
        break
      case 'j':
        wsSession.send(`${wsSession.playerSessionId} Y`)// let the player know their own session id
        f = d.split(' ')
        p1 = Players.getPlayer(wsSession.playerSessionId)
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
  })// broadcast
  // setTimeout(function f(){Date.now()-s.t<3e4?setTimeout(f,1e4):(D('timeout session s.n=',s.n,'w.clients.size=',w.clients.size),delete m[s.u],s.terminate(),s=null)},36e5)// 60m timeout
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
    D('broadcast() c.playerSessionId=', c.playerSessionId)
    if(includeSelf||wsSession!=c) {
      c.send(`${wsSession.playerSessionId} ${d}`)
      n++
    }
  })// broadcast
  D(`broadcast ${n}`)
}

function dump(){D(Players.dump(w.clients.size))}dump();setInterval(dump,4e3)