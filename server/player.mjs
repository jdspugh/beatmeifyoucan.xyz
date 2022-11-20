/** @typedef {import('./types.mjs').WsSession} WsSession */
/** @typedef {import('./types.mjs').SessionId} SessionId */
/** @typedef {import('./types.mjs').Name} Name */
/** @typedef {import('./types.mjs').Avatar} Avatar */
/** @typedef {import('./types.mjs').Attack} Attack */

export class Player{
  // user data is cached in this object, but the user's localstorage override what's here

  /** @type {WsSession} */ wsSession
  /** @type {SessionId} */ sessionId

  /** @type {number} */ x
  /** @type {number} */ y
  /** @type {number} */ vx
  /** @type {number} */ vy

  /** @type {Name} */ name
  /** @type {Avatar} */ avatar

  /** @type {Player|null} */ opponent
  /** @type {Attack|null}} */ attack // 0=R, 1=P, 2=S

  toString() {
    return `${this.sessionId}\t\t${this.name}\t${this.attack}(${this.attack?['Rock','Paper','Scissors'][this.attack]:'-'})\t${this.opponent?.sessionId}(${this.opponent?.name})`
  }
}