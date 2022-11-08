import {Player} from './player.mjs'

const D = console.log

export class Players {
  /** @type {number} */ static #n = 1// session count

  /** @type {Object<string,Player>} */ static #kp = {}// player key -> player
  /** @type {Map<number,string>} */ static #sk = new Map// player session id -> player key

  /**
   * @param {string} playerKey
   * @return {number|null}
   */ 
  static getSessionId(playerKey) {
    const p = this.#kp[playerKey]
    return p?p.sessionId:null
  }

  /**
   * @return {number}
   */ 
   static newSessionId() {
    return this.#n++
  }

  /**
   * @param {string} key 
   * @param {number} sessionId 
   * @param {Player} player
   */ 
  static addPlayer(key, sessionId, player) {
    player.sessionId = sessionId
    this.#kp[key] = player
    this.#sk.set(sessionId, key)
  }

  /**
   * @param {number} playerSessionId
   * @return {Player}
   */ 
  static getPlayer(playerSessionId) {
    return this.#kp[this.#sk.get(playerSessionId)]
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
   * @return {void}
   */ 
  static dump() {
    D('Players.dump() n=',this.#n,'sk=',this.#sk,'kp=',this.#kp)
  }
}