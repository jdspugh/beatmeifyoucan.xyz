import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
// import * as hre from 'hardhat'

describe('Combat contract', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function fixture() {
    const [deployer, a1, a2, a3] = await ethers.getSigners()
    const Combat = await ethers.getContractFactory('Combat')
    //@ts-ignore
    const combat = new GasTracker(await Combat.deploy(),{logAfterTx:true})
    return { combat, deployer, a1, a2, a3 }
  }

  describe('Game', async function () {
    const n=1, mEmpty=0xffff
    const mRRRRRR=0b000000000000, mPPPPPP=0b010101010101, mR=0b00, mP=0x01
    const targetAnyPlayer='0x0000000000000000000000000000000000000000'
    const salt='0x000000000000000000000000000000000000'
    const meRRRRRR=ethers.utils.keccak256('0x'+mRRRRRR.toString(16).padStart(4,'0')+salt.slice(2)).slice(0,-32)
    const mePPPPPP=ethers.utils.keccak256('0x'+mPPPPPP.toString(16).padStart(4,'0')+salt.slice(2)).slice(0,-32)
    const meR=ethers.utils.keccak256('0x'+mR.toString(16).padStart(4,'0')+salt.slice(2)).slice(0,-32)
    const meP=ethers.utils.keccak256('0x'+mP.toString(16).padStart(4,'0')+salt.slice(2)).slice(0,-32)
    console.log('meRRRRRR=',meRRRRRR,'mePPPPPP=',mePPPPPP,'meR=',meR,'meP=',meP)
    const fee={n:195,d:200}

    it('duplicate game', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)
      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      // a1 opens
      await expect( combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})).to.revertedWithCustomError(combat,'ChooseUnusedGameID')
    })

    it('Open(a1), Close(a2), Reveal(a1), Draw', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // check initial balances
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await a3.getBalance() ).to.equal( ethers.utils.parseEther('1000') )

      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await combat.provider.getBalance(combat.address) ).to.equal( ethers.utils.parseEther('10') )
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 bet too low (zero)
      await expect( combat.connect(a2).close(n,mRRRRRR) ).to.be.revertedWithCustomError(combat,'SendBetAmount')
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1000') )

      // a2 bet too high
      await expect( combat.connect(a2).close(n,mRRRRRR,{value:ethers.utils.parseEther('100')}) ).to.revertedWithCustomError(combat,'SendBetAmount')

      // a1 reveal (close game first)
      await expect( combat.connect(a1).reveal(n,mRRRRRR,salt) ).to.be.revertedWithCustomError(combat,'CloseGameFirst')

      // a2 close
      await expect( combat.connect(a2).close(n,mRRRRRR,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)
      await expect( combat.connect(a2).close(n,mRRRRRR,{value:ethers.utils.parseEther('10')}) ).to.revertedWithCustomError(combat,'ChooseOpenGame')

      // a2 tries to reveal
      await expect( combat.connect(a2).reveal(n,mRRRRRR,salt) ).to.be.revertedWithCustomError(combat,'MustBeOpener')

      // reveal draw
      await expect( combat.connect(a1).reveal(n,mPPPPPP,salt) ).to.be.revertedWithCustomError(combat,'EnterCorrectParameters')
      await combat.connect(a1).reveal(n,mRRRRRR,salt)
      await expect( combat.connect(a1).reveal(n,mRRRRRR,salt) ).to.be.revertedWithCustomError(combat,'GameAlreadyRevealed')
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('999.75') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('999.75') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('targetPlayer a2', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // check initial balances
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await a3.getBalance() ).to.equal( ethers.utils.parseEther('1000') )

      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,a2.address,{value:ethers.utils.parseEther('10')})
      await expect( await combat.provider.getBalance(combat.address) ).to.equal( ethers.utils.parseEther('10') )
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a3 close
      await expect( combat.connect(a3).close(n,mRRRRRR,{value:ethers.utils.parseEther('10')}) ).to.revertedWithCustomError(combat,'ChallengedPlayerMustClose')

      // a2 close
      await expect( combat.connect(a2).close(n,mRRRRRR,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)

      // a2 tries to reveal
      await expect( combat.connect(a2).reveal(n,mRRRRRR,salt) ).to.be.revertedWithCustomError(combat,'MustBeOpener')

      // reveal draw
      await combat.connect(a1).reveal(n,mRRRRRR,salt)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('999.75') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('999.75') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('Open(a1), Close(a2), Reveal(a1), a1 Wins', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await combat.provider.getBalance(combat.address) ).to.equal( ethers.utils.parseEther('10') )
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 close
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)

      // reveal a1 wins
      await combat.connect(a1).reveal(n,mRRRRRR,salt)
      // console.log('combat.H(n)=',await combat.H(n))
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('Open(a1), Close(a2), Reveal(a1), a2 Wins', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,mePPPPPP,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await combat.provider.getBalance(combat.address) ).to.equal( ethers.utils.parseEther('10') )
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 close
      await expect( combat.connect(a2).close(n,mRRRRRR,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)

      // reveal a2 wins
      await combat.connect(a1).reveal(n,mPPPPPP,salt)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('Open(a1), Close(a2), Reveal(a1), a1 Wins', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await combat.provider.getBalance(combat.address) ).to.equal( ethers.utils.parseEther('10') )
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 close
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)

      // reveal a1 wins
      await combat.connect(a1).reveal(n,mRRRRRR,salt)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('Open(a1), Cancel(a1), Cancel(a1)', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,mePPPPPP,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a1 cancels
      await expect( combat.connect(a1).cancel(n) ).to.emit(combat,'Update').withArgs(n)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000') )

      // a1 cancels
      await expect( combat.connect(a1).cancel(n) ).to.revertedWithCustomError(combat,'MustBeOpener')
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
    })

    it('Open(a1), Cancel(a2)', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,mePPPPPP,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 cancels
      await expect( combat.connect(a2).cancel(n) ).to.revertedWithCustomError(combat,'MustBeOpener')
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
    })

    it('Open(a1), Close(a2), Cancel(a1)', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)

      // a1 opens
      await combat.connect(a1).open(n,mePPPPPP,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )

      // a2 close
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)

      // a1 cancels
      await expect( combat.connect(a1).cancel(n) ).to.be.revertedWithCustomError(combat,'GameAlreadyClosed')
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000') )
    })

    it('Open(a1), Close(a2), Reveal(a1), Cancel(a1)', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)
      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      // a2 close
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)
      // reveal a1 wins
      await combat.connect(a1).reveal(n,mRRRRRR,salt)
      // a1 cancels
      await expect( combat.connect(a1).cancel(n) ).to.be.revertedWithCustomError(combat,'GameAlreadyClosed')
    })

    it('Open(a1) Close(a2) Claim(a2) (expired)', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)
      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      // a2 close
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'CloseGameFirst')
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)
      // a2 claims
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'WaitForExpirey')
      // a2 claims
      await ethers.provider.send("evm_increaseTime", [7*24*60*60-1000])// one week in seconds
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'WaitForExpirey')
      // jump forwards in time
      await ethers.provider.send("evm_increaseTime", [7*24*60*60])// one week in seconds
      // a2 claims
      await combat.connect(a2).claim(n)
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'WinAlreadyClaimed')
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('setDuration', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)
      const d = 3600// = 1h
      let t
      // setDuration
      // await expect( combat.connect(a1).setDuration(d) ).to.be.revertedWithCustomError(combat,'MustBeDeployer')
      await combat.connect(deployer).setDuration(d)
      // a1 opens
      await combat.connect(a1).open(n,meRRRRRR,6,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      // a2 close
      await expect( combat.connect(a2).close(n,mPPPPPP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)
      // a2 claims
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'WaitForExpirey')
      // a2 claims
      await time.increase(3600-10)
      await expect( combat.connect(a2).claim(n) ).to.be.revertedWithCustomError(combat,'WaitForExpirey')
      // a2 claims
      await time.increase(3600+10)
      await combat.connect(a2).claim(n)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )
    })

    it('rounds', async function () {
      const { combat, deployer, a1, a2, a3 } = await loadFixture(fixture)
      // a1 opens
      await combat.connect(a1).open(n,meR,1,targetAnyPlayer,{value:ethers.utils.parseEther('10')})
      // a2 close
      await expect( combat.connect(a2).close(n,mP,{value:ethers.utils.parseEther('10')}) ).to.emit(combat,'Update').withArgs(n)
      // reveal a1 wins
      await combat.connect(a1).reveal(n,mR,salt)
      await expect( await a1.getBalance() ).to.equal( ethers.utils.parseEther('1009.5') )
      await expect( await a2.getBalance() ).to.equal( ethers.utils.parseEther('990') )
      await expect( await deployer.getBalance() ).to.equal( ethers.utils.parseEther('1000.5') )      
    })
  })
})