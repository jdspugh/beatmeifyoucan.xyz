export class Player{
  /** @type {number} */ sessionId

  /** @type {number} */ x
  /** @type {number} */ y
  /** @type {number} */ vx
  /** @type {number} */ vy

  /** @type {string} */ name
  /** @type {string} */ avatar

  /** @type {Object<string,number>} */ #km={}// player key -> player move  (store of players and the move underway by this player against them)

  // /**
  //  * @param name {string}
  //  * @param avatar {string}
  //  */ 
  // constructor(name, avatar) {
  //   this.#name = name
  //   this.#avatar = avatar
  // }

  /**
   * @param {string} playerKey
   */ 
  attack(playerKey,move) {

  }
}