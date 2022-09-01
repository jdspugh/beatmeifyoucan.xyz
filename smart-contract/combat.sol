//SPDX-License-Identifier: UNLICENSED
//SPDX-FileCopyrightText: 2022 Jonathan Pugh <jdspugh@gmail.com>
pragma solidity ^0.8.16;

// 0x0000 <-- RRRRRR (2 bytes)
// 0x0000000000000000 <-- salt (8 bytes)
// 0x6bd2dd6bd408cbee33429358bf24fdc64612fbf8b1b4db604518f40ffd34b607 <-- keccak(m+salt) (32 bytes)

// address 0x0000000000000000000000000000000000000000 <-- (20 bytes)
// bytes32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff <-- (32 bytes)

contract Combat{
    // consts
    bytes32 constant MOVE_EMPTY = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    uint8 constant ROUNDS = 6;

    // structs
    struct Game{
        uint256 t;//  game opening time (seconds) <-- optimise by using hours instead
        uint256 b;//  bet amount <-- optimise by mutliplying by a large factor
        bytes32 me1;// p1 encrypted moves <-- optimise by truncating generated hash
        bytes32 me2;// p2 encrypted moves <-- optimise by truncating generated hash
        address a1;// p1 address
        address a2;// p2 address <-- i.e. challenged person's address
        uint24  d;//  duration (0=game already revealed)
        uint16  m1;// p1 moves
        uint16  m2;// p2 moves
    }// size = 32(t)+32(b)+32(m1)+32(m2)+20(a1)+20(a2)+3(d) = 32*4+20*2+3 = 171bytes = 6 slots @ 20k per slot + 1 slot for hash key = 7*20k = 140k gas per game stored = 140k * 10gwei today = 1400k gwei ~= $2 at bear market ~= $20 at bull market
    
    // variables
    Game[] public H;//TODO: make private
    address private deployer;
    uint24 private duration = 10*60;// maximum game duration (seconds) after which it expires

    // events
    event Open(bytes32 m1, uint256 bet, uint24 duration);//TODO: anonymous
    event Reveal(uint32 n, uint16 m1, uint16 m2);//TODO: anonymous
    event Cancel(uint32 n);//TODO: anonymous

    // debug events
    event DebugByte32(bytes32 x);//TODO: anonymous + remove in production
    event DebugAddress(address x);//TODO: anonymous + remove in production
    event DebugUint256(uint256 x);//TODO: anonymous + remove in production

    // errors
    error ChooseOpenGame();// 1
    error SendBetAmount();// 2
    error EnterCorrectParameters();// 3
    error MustBeDeployer();// 4
    error ChallengedPlayerMustClose();// 5
    error CloseGameFirst();// 6
    error MustBePlayer();// 7
    error GameAlreadyRevealed();// 8

    constructor() {
        deployer=msg.sender;
    }

    // set targetPlayer to address(0) to create an open game
    function open(bytes32 encryptedMoves, address targetPlayer) external payable {
        H.push(Game({
            t:block.timestamp, b:msg.value,
            me1:encryptedMoves, me2:MOVE_EMPTY,
            a1:msg.sender, a2:targetPlayer, d:duration,
            m1:0, m2:0
        }));
        emit Open(encryptedMoves, msg.value, duration);// timestamp can be gotten from block timestamp in event logs
    }

    function close(uint32 n, bytes32 encryptedMoves) external payable {
        if(MOVE_EMPTY!=H[n].me2) revert ChooseOpenGame();
        if(address(0)!=H[n].a2 && H[n].a2!=msg.sender) revert ChallengedPlayerMustClose();
        if(H[n].b != msg.value) revert SendBetAmount();

        H[n].me2 = encryptedMoves;
        H[n].a2 = msg.sender;
    }

    function revealOpening(uint32 n,uint16 moves,uint64 salt) external {
        if(MOVE_EMPTY==H[n].me2) revert CloseGameFirst();
        if(H[n].me1!=keccak256(abi.encodePacked(moves,salt))) revert EnterCorrectParameters();
        H[n].m1=moves;
        payout(n);
    }
        
    function revealClose(uint32 n,uint16 moves,uint64 salt) external {
        if(MOVE_EMPTY==H[n].me2) revert CloseGameFirst();
        if(H[n].me2!=keccak256(abi.encodePacked(moves,salt))) revert EnterCorrectParameters();
        H[n].m2=moves;
        payout(n);
    }

    function payout(uint32 n) private {
        if(0==H[n].m1 || 0==H[n].m2) return; // not all reveals revealed yet
        if(0==H[n].d) revert GameAlreadyRevealed();
        H[n].d=0; // make sure we only payout once

        uint256 w=ROUNDS;
        uint256 a=H[n].m1; uint256 b=H[n].m2;
        for(uint256 i=ROUNDS; i>0; i--){
            uint256 c=a&0x3; uint256 d=b&0x3;
            if(c!=d)if((0==c && 2==d) || (1==c && 0==d) || (2==c && 1==d)){w++;}else{w--;}//0=R,1=P,2=S
            a>>=2; b>>=2;
        }
        if(ROUNDS==w) {
            // draw
            payable(H[n].a1).transfer(H[n].b);
            payable(H[n].a2).transfer(H[n].b);
        } else {
            // win
            payable(w>ROUNDS?H[n].a1:H[n].a2).transfer(H[n].b*2);
        }
        //emit Reveal(n, m1, uint16(H[n].m2));
    }

    // if both players haven't revealed, refund them both
    // if one player only has revealed, give the money to them
    // if both have revealed, do nothing
    function cancel(uint32 n) external {
        emit DebugAddress(msg.sender);
        if(H[n].a1!=msg.sender && H[n].a2!=msg.sender) revert MustBePlayer();
        if(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff==uint256(H[n].m2)) {
            // P2 hasn't closed. Ok to send money back to P1.

            payable(H[n].a1).transfer(H[n].b);
            H[n].a1=address(0);// don't let this happen more than once
        }
        // // Claim the prize money if the other player hasn't revealed after a certain amount of time
        // //   or
        // // Return the money to the original owners
    }

    function setDuration(uint24 d) external {
        if(msg.sender!=deployer) revert MustBeDeployer();
        duration = d;
    }

    //TODO: remove in production
    function balance() external view returns(uint256) {
        return address(this).balance;
    }
}