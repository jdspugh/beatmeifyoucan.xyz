// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Combat{
    struct Game{
      uint256 b;
      address a1;
      //uint256 a2;
      uint16 m1; uint16 m2;
    }
    uint32 private count=0;
    mapping(uint32=>Game) private H;
    address private deployer;

    event Open(uint16 moves, uint256 bet) anonymous;
    event Close(uint32 n, uint16 moves) anonymous;

    error ChooseOpenGame();// 1
    error SendBetAmount();// 2

    function open(uint16 moves) external payable {
        H[count++]=Game({b:msg.value, a1:msg.sender, m1:moves, m2:65535});
        emit Open(moves, msg.value);
    }
    function close(uint32 n,uint16 moves) external payable {
        Game memory g=H[n];
        if(65535 != g.m2) revert ChooseOpenGame();
        if(g.b != msg.value) revert SendBetAmount();

        H[n].m2=moves;
        uint256 a=uint256(g.m1); uint256 b=uint256(moves);
        uint256 w=6;//w>0 p1 wins, w<0 p2 wins
        for(uint256 i=6;i>0;i--){
            uint256 c=a&0x3; uint256 d=b&0x3;
            if(c!=d)if((0==c && 2==d) || (1==c && 0==d) || (2==c && 1==d)){w++;}else{w--;}//0=R,1=P,2=S
            a>>=2; b>>=2;
        }
        if(6==w) {
            payable(g.a1).transfer(g.b); payable(msg.sender).transfer(g.b);
        } else {
            payable(w>6?g.a1:msg.sender).transfer(g.b*2);
        }
        emit Close(n, uint16(moves));
    }
    
    // // not needed:
    // function balance() external view returns(uint256) {
    //     return address(this).balance;
    // }
}