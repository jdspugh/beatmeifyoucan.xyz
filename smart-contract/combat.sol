//SPDX-License-Identifier: UNLICENSED
//SPDX-FileCopyrightText: 2022 Jonathan Pugh <jdspugh@gmail.com>
pragma solidity ^0.8.16;

// address 0x0000000000000000000000000000000000000000
// bytes32 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

contract Combat{
    struct Game{
        uint256 t;//  game opening time (seconds) <-- optimise by using hours instead
        uint256 b;//  bet amount <-- optimise by mutliplying by a large factor
        bytes32 m1;// p1 moves <-- optimise by truncating generated hash
        bytes32 m2;// p2 moves <-- optimise by truncating generated hash
        address a1;// p1 address
        address a2;// p2 address <-- i.e. challenged person's address
        uint24  d;//  duration
    }// size = 32(t)+32(b)+32(m1)+32(m2)+20(a1)+20(a2)+3(d) = 32*4+20*2+3 = 171bytes = 6 slots @ 20k per slot + 1 slot for hash key = 7*20k = 140k gas per game stored = 140k * 10gwei today = 1400k gwei ~= $2 at bear market ~= $20 at bull market
    
    Game[] public H;//TODO: make private
    address private deployer;
    uint24 private duration = 10*60;// maximum game duration (seconds) after which it expires

    event Open(bytes32 m1, uint256 bet, uint24 duration);//TODO: anonymous
    event Reveal(uint32 n, uint16 m1, uint16 m2);//TODO: anonymous
    event Cancel(uint32 n);//TODO: anonymous

    event DebugByte32(bytes32 x);//TODO: anonymous + remove in production
    event DebugAddress(address x);//TODO: anonymous + remove in production
    event DebugUint256(uint256 x);//TODO: anonymous + remove in production

    error ChooseOpenGame();// 1
    error SendBetAmount();// 2
    error EnterCorrectParameters();// 3
    error MustBeDeployer();// 4
    error ChallengedPlayerMustClose();// 5
    error CloseGameFirst();// 6
    error MustBePlayer();// 7

    constructor() {
        deployer=msg.sender;
    }

    // set targetPlayer to address(0) to create an open game
    function open(bytes32 encryptedMoves, address targetPlayer) external payable {
        H.push(Game({
            t:block.timestamp, b:msg.value,
            m1:encryptedMoves, m2:0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
            a1:msg.sender, a2:targetPlayer, d:duration
        }));
        emit Open(encryptedMoves, msg.value, duration);// timestamp can be gotten from block timestamp in event logs
    }

    function close(uint32 n, bytes32 encryptedMoves) external payable {
        if(bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)!=H[n].m2) revert ChooseOpenGame();
        if(address(0)!=H[n].a2 && H[n].a2!=msg.sender) revert ChallengedPlayerMustClose();
        if(H[n].b != msg.value) revert SendBetAmount();

        H[n].m2 = encryptedMoves;
        H[n].a2 = msg.sender;
    }

    function revealOpening(uint32 n,uint16 m1,uint64 salt) external {
        if(bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)==H[n].m2) revert CloseGameFirst();
        // Game memory g=H[n];
        emit DebugByte32(H[n].m1);
        emit DebugByte32(keccak256(abi.encodePacked(m1,salt)));
        //if(H[n].m1!=keccak256(abi.encodePacked(m1,salt))) revert EnterCorrectParameters();
//uint256(m1+(salt<<16))

        // uint256 a=m1; uint256 b=uint256(H[n].m2);
        // uint256 w=6;
        // for(uint256 i=6;i>0;i--){
        //     uint256 c=a&0x3; uint256 d=b&0x3;
        //     if(c!=d)if((0==c && 2==d) || (1==c && 0==d) || (2==c && 1==d)){w++;}else{w--;}//0=R,1=P,2=S
        //     a>>=2; b>>=2;
        // }
        // if(6==w) {
        //     payable(H[n].a).transfer(H[n].b); payable(msg.sender).transfer(H[n].b);
        // } else {
        //     payable(w>6?H[n].a:msg.sender).transfer(H[n].b*2);
        // }
        // emit Reveal(n, m1, uint16(H[n].m2));
    }
    
    function revealClose(uint32 n,uint16 m2,uint64 salt) external {
        if(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff==uint256(H[n].m2)) revert CloseGameFirst();
        // Game memory g=H[n];
        emit DebugByte32(H[n].m1);
        emit DebugByte32(keccak256(abi.encodePacked(m2,salt)));
        //if(H[n].m1!=keccak256(abi.encodePacked(m1,salt))) revert EnterCorrectParameters();
//uint256(m1+(salt<<16))

        // uint256 a=m1; uint256 b=uint256(H[n].m2);
        // uint256 w=6;
        // for(uint256 i=6;i>0;i--){
        //     uint256 c=a&0x3; uint256 d=b&0x3;
        //     if(c!=d)if((0==c && 2==d) || (1==c && 0==d) || (2==c && 1==d)){w++;}else{w--;}//0=R,1=P,2=S
        //     a>>=2; b>>=2;
        // }
        // if(6==w) {
        //     payable(H[n].a).transfer(H[n].b); payable(msg.sender).transfer(H[n].b);
        // } else {
        //     payable(w>6?H[n].a:msg.sender).transfer(H[n].b*2);
        // }
        // emit Reveal(n, m1, uint16(H[n].m2));
    }

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