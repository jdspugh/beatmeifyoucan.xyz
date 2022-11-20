/** @typedef {import('./types.mjs').Key} Key */
/** @typedef {import('./types.mjs').SessionId} SessionId */
import {Player} from './player.mjs'

const D = console.log

export class Players {
  /** @type {SessionId} */ static #n = 1// session count

  /** @type {Object<Key,Player>} */ static #kp = {}// player key -> player
  /** @type {Map<SessionId,Key>} */ static sk = new Map// player session id -> player key

  /**
   * @param {Key} playerKey
   * @return {SessionId|null}
   */ 
  static getSessionId(playerKey) {
    const p = this.#kp[playerKey]
    return p?p.sessionId:null
  }

  /**
   * @return {SessionId}
   */ 
   static newSessionId() {
    return this.#n++
  }

  /**
   * @param {any} wsSession 
   * @param {Key} key 
   * @param {SessionId} sessionId 
   * @param {Player} player
   */ 
  static addPlayer(wsSession, key, sessionId, player) {
    player.wsSession = wsSession
    player.sessionId = sessionId
    this.#kp[key] = player
    this.sk.set(sessionId, key)
  }

  /**
   * @param {SessionId} playerSessionId
   * @return {Player}
   */ 
  static getPlayer(playerSessionId) {
    return this.#kp[this.sk.get(playerSessionId)]
  }

  /**
   * @callback f
   * @param {Player} player
   */
  /** 
   * @param {f} f
   */ 
  static map(f) {
    for(const p in this.#kp) f(this.#kp[p])
  }

  /**
   * @param {number} numberOfclients
   * @return {string}
   */ 
  static dump(numberOfclients) {
    let s = `\nPLAYERS (${numberOfclients} ws sessions)\nSESSION ID\tNAME\tATTACK\t\tOPPONENT\n`+'\x1b[90m'
    this.sk.forEach((key,sessionId)=>s+=this.#kp[key]+'\n')
    return s+'\x1b[0m'
  }
}