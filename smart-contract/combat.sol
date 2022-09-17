//SPDX-License-Identifier: UNLICENSED
//SPDX-FileCopyrightText: 2022 Jonathan Pugh <jdspugh@gmail.com>
pragma solidity ^0.8.16;

// address 0x0000000000000000000000000000000000000000 <-- (20 bytes)

//   0x0000 <-- RRRRRR
// + 0x000000000000000000000000000000000000 <-- salt
// = 0x0000000000000000000000000000000000000000 <-- moves + salt
// 0x5380c7b7ae81a58eb98d9c78de4a1fd7fd9535fc953ed2be602daaa41767312a <-- keccak256(moves+salt)

//   0x0555 <-- PPPPPP
// + 0x000000000000000000000000000000000000 <-- salt
// = 0x0555000000000000000000000000000000000000 <-- moves + salt
// 0xbb632fa90c78a2a4290140edb5803ae8c03ba8cfc1a3af523b974af9e7951fd0 <-- keccak256(moves+salt)

contract Combat{
    // consts
    uint8 constant ROUNDS = 6;
    uint16 constant EMPTY_MOVE = 0xffff;
    bytes32 constant EMPTY_ENCRYPTED_MOVE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    // structs
    struct Game{
        uint256 t;//  game opening time (seconds) <-- optimise by using hours instead
        uint256 b;//  bet amount <-- optimise by mutliplying by a large factor
        bytes32 me1;// p1 encrypted moves <-- optimise by truncating generated hash
        address a1;// p1 address
        address a2;// p2 address <-- i.e. challenged person's address
        uint24  d;//  duration (max 194 days), 0=game already revealed  <-- optimise by using hours instead of seconds
        uint16  m1;// p1 moves
        uint16  m2;// p2 moves
    }// size = 32+64+20+20+3+2+2 = 143 bytes = 5 slots @ 20k per slot + 1 slot for hash key = 6*20k = 120k gas per game stored = 120k * 10gwei today = 1200k gwei ~= $1.70 at bear market ~= $17 at bull market on Ethereum
    
    // variables
    mapping(uint256 => Game) public H;
    address private deployer;
    uint24 private duration = 7*24*60*60;// 1 week. maximum game duration (seconds) after which it expires and players can claim their money

    // events
    event Update(uint256 n);

    // // debug events
    // event DebugByte32(bytes32 x);//TODO: remove in production
    // event DebugAddress(address x);//TODO: remove in production
    // event DebugUint256(uint256 x);//TODO: remove in production

    // errors
    error ChooseOpenGame();// 1
    error SendBetAmount();// 2
    error EnterCorrectParameters();// 3
    error MustBeDeployer();// 4
    error ChallengedPlayerMustClose();// 5
    error CloseGameFirst();// 6
    error MustBePlayer();// 7
    error GameAlreadyRevealed();// 8
    error WinAlreadyClaimed();// 9

    constructor() {
        deployer=msg.sender;
    }

    // set targetPlayer to address(0) to create an open game
    function open(uint256 n, bytes32 encryptedMoves, address targetPlayer) external payable {
        H[n] = Game({
            t:block.timestamp, b:msg.value,
            me1:encryptedMoves,
            a1:msg.sender, a2:targetPlayer, d:duration,
            m1:EMPTY_MOVE, m2:EMPTY_MOVE
        });
        emit Update(n);
    }

    function close(uint256 n, uint16 moves) external payable {
        if(EMPTY_MOVE != H[n].m2) revert ChooseOpenGame();
        if(address(0) != H[n].a2 && H[n].a2!=msg.sender) revert ChallengedPlayerMustClose();
        if(H[n].b != msg.value) revert SendBetAmount();

        H[n].t = block.timestamp;
        H[n].m2 = moves;
        H[n].a2 = msg.sender;
        emit Update(n);
    }

    function reveal(uint256 n,uint16 moves,uint144 salt) external {
        if(0==H[n].d) revert GameAlreadyRevealed(); H[n].d=0;// only payout once (prevent reentrancy attack)
        if(H[n].a1!=msg.sender) revert MustBePlayer();
        if(EMPTY_MOVE==H[n].m2) revert CloseGameFirst();
        if(H[n].me1!=keccak256(abi.encodePacked(moves,salt))) revert EnterCorrectParameters();
        
        H[n].m1=moves;

        // determine winner
        uint256 w=ROUNDS;
        uint256 a=H[n].m1; uint256 b=H[n].m2;
        for(uint256 i=ROUNDS; i>0; i--){
            uint256 c=a&0x3; uint256 d=b&0x3;
            if(c!=d)if(c==(d+1)%3){w++;}else{w--;}//0=R,1=P,2=S
            a>>=2; b>>=2;
        }
        
        // payout
        payable(deployer).transfer(H[n].b*5/100);
        if(ROUNDS==w) {
            // draw
            payable(H[n].a1).transfer(H[n].b*975/1000);
            payable(H[n].a2).transfer(H[n].b*975/1000);
        } else {
            // win
            payable(w>ROUNDS?H[n].a1:H[n].a2).transfer(H[n].b*195/100);
        }
        emit Update(n);
    }

    // closer can force a winning claim after a certain duration since their moves are revealed and P1 could be stalling
    function claim(uint32 n) external {
        // anyone can force the claim!
        if(0==H[n].d) revert WinAlreadyClaimed();
        if(EMPTY_MOVE!=H[n].m2 && block.timestamp-H[n].t>H[n].d) {
            H[n].d=0;// only claim once (prevent reentrancy attack)
            payable(deployer).transfer(H[n].b*5/100);
            payable(H[n].a2).transfer(H[n].b*195/100);
        }
        emit Update(n);
    }

    function cancel(uint256 n) external {
        if(H[n].a1!=msg.sender && H[n].a2!=msg.sender) revert MustBePlayer();
        if(EMPTY_MOVE==H[n].m1 && EMPTY_MOVE==H[n].m2) {
            if(address(0)!=H[n].a1) {
                address a = H[n].a1;
                H[n].a1 = address(0);// prevent reentrancy
                payable(a).transfer(H[n].b);
            }
            if(address(0)!=H[n].a2) {
                address a = H[n].a2;
                H[n].a2 = address(0);// prevent reentrancy
                payable(a).transfer(H[n].b);
            }
        }
        emit Update(n);
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