// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Combat{
    struct Game{
      uint256 b;
      address a1;
      //uint256 a2;
      int16 m1;
      int16 m2;
    }
    uint32 public count=0;
    mapping(uint32=>Game) public H;

    event Open(int16 moves, uint256 bet) anonymous;
    event Close(uint32 n, int16 moves) anonymous;

    error ChooseOpenGame();// 1
    error SendBetAmount();// 2

    function open(int16 moves) external payable {
        H[count++]=Game({b:msg.value, a1:msg.sender, m1:moves, m2:-1});
        emit Open(moves, msg.value);
    }
    function close(uint32 n,int16 moves) external payable {
        Game memory g=H[n];
        if(-1 != g.m2) revert ChooseOpenGame();
        if(g.b != msg.value) revert SendBetAmount();

        H[n].m2=moves;
        if(g.m1 != g.m2) {
            if(g.m1>g.m2) {
                payable(g.a1).transfer(g.b*2);
            } else {
                payable(msg.sender).transfer(g.b);
            }
        }
        emit Close(n, moves);
    }
    // function balance() external view returns(uint256){
    //     return address(this).balance;
    // }
}