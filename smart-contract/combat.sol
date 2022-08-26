// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Combat{
    struct Game{
      uint256 b;
      int16 m1;
      int16 m2;
    }
    uint32 public count=0;
    mapping(uint32=>Game) public H;

    function open(int16 moves,uint256 bet)external{
        H[count++]=Game({b:bet,m1:moves,m2:-1});
    }
    function close(uint32 n,int16 moves)external payable{
        if(-1 == H[n].m2){
            H[n].m2=moves;
        }
    }
}