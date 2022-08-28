// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Combat{
    struct Game{
      uint256 b;//  bet amount
      address a;//  p1 address
      uint256 m1;// p1 moves
      uint16 m2;//  p2 moves
    }
    uint32 private count=0;
    mapping(uint32=>Game) private H;
    address private deployer;

    event Open(uint256 moves, uint256 bet) anonymous;
    event Close(uint32 n, uint16 moves) anonymous;

    error ChooseOpenGame();// 1
    error SendBetAmount();// 2
    error EnterCorrectParameters();//3

    // NOTE: need new salt for everry move
    function open(uint256 m1) external payable {
        H[count++]=Game({b:msg.value, a:msg.sender, m1:m1, m2:65535});
        emit Open(moves, msg.value);
    }
    function close(uint32 n,uint16 m2) external payable {
        Game memory g=H[n];
        if(65535 != g.m2) revert ChooseOpenGame();
        if(g.b != msg.value) revert SendBetAmount();

        H[n].m2=m2;
        uint256 a=uint256(g.m1); uint256 b=uint256(m2);
        uint256 w=6;//w>0 p1 wins, w<0 p2 wins
        for(uint256 i=6;i>0;i--){
            uint256 c=a&0x3; uint256 d=b&0x3;
            if(c!=d)if((0==c && 2==d) || (1==c && 0==d) || (2==c && 1==d)){w++;}else{w--;}//0=R,1=P,2=S
            a>>=2; b>>=2;
        }
        if(6==w) {
            payable(g.a).transfer(g.b); payable(msg.sender).transfer(g.b);
        } else {
            payable(w>6?g.a:msg.sender).transfer(g.b*2);
        }
        emit Close(n, uint16(m2));
    }
    function reveal(uint32 n,uint16 m1,uint64 salt) external {
        Game memory g=H[n];
        if(g.m1!=keccak256(m1+salt)) revert EnterCorrectParameters();
    }
    
    // // not needed:
    // function balance() external view returns(uint256) {
    //     return address(this).balance;
    // }
}