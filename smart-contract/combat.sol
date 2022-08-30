//SPDX-License-Identifier: UNLICENSED
//SPDX-FileCopyrightText: 2022 Jonathan Pugh <jdspugh@gmail.com>
pragma solidity ^0.8.16;

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
    Game[] private H;
    address private deployer;
    uint24 private duration = 10*60;// maximum game duration (seconds) after which it expires

    event Open(bytes32 m1, uint256 bet, uint24 duration) anonymous;
    event Reveal(uint32 n, uint16 m1, uint16 m2) anonymous;
    event Cancel(uint32 n) anonymous;
    event Debug(bytes32 a, bytes32 b) anonymous;//remove!!!

    error ChooseOpenGame();// 1
    error SendBetAmount();// 2
    error EnterCorrectParameters();//3

    // NOTE: need new salt for every move
    function open(bytes32 m1) external payable {
        this.challenge(m1,address(0));
    }

    function challenge(bytes32 m1, address a2) external payable {
        H.push(Game({
            t:block.timestamp,
            b:msg.value,
            m1:m1, m2:0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff,
            a1:msg.sender, a2:a2, d:duration
        }));
        emit Open(m1, msg.value, duration);// timestamp can be gotten from block timestamp in event logs
    }

    function close(uint32 n,bytes32 m2) external payable {
        if(bytes32(0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) != H[n].m2) revert ChooseOpenGame();
        if(H[n].b != msg.value) revert SendBetAmount();

        H[n].m2=m2;
    }

    // // cancel opening and return funds
    // function cancel(uint32 n) external {
    //     H[n].m2=0;
    //     payable(H[n].a).transfer(H[n].b);//reentrancy vulnerability?
    //     H[n].b=0;
    //     emit Cancel(n);
    // }

    function revealOpening(uint32 n,uint16 m1,uint64 salt) external {
        // Game memory g=H[n];
        emit Debug(H[n].m1,keccak256(abi.encodePacked(m1,salt)));
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
    
    function revealClose(uint32 n,uint16 m1,uint64 salt) external {
        // Game memory g=H[n];
        emit Debug(H[n].m1,keccak256(abi.encodePacked(m1,salt)));
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

    function cancel() external {
        // Claim the prize money if the other player hasn't revealed after a certain amount of time
        //   or
        // Return the money to the original owners
    }

    function setDuration(uint24 d) external {
        duration = d;
    }

    // // not needed:
    // function balance() external view returns(uint256) {
    //     return address(this).balance;
    // }
}