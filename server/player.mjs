export class Player{
  /** @type {WsSession} */ wsSession
  /** @type {SessionId} */ sessionId

  /** @type {number} */ x
  /** @type {number} */ y
  /** @type {number} */ vx
  /** @type {number} */ vy

  /** @type {Name} */ name
  /** @type {Avatar} */ avatar

  /** @type {Player} */ opponent
  /** @type {Attack}} */ attack // 0=R, 1=P, 2=S

  toString() {
    return `${this.sessionId}\t\t${this.name}\t${this.attack}(${['Rock','Paper','Scissors'][this.attack]})\t${this.opponent?.sessionId}(${this.opponent?.name})`
  }
}