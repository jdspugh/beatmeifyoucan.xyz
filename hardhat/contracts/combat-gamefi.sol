//SPDX-License-Identifier: UNLICENSED
//SPDX-FileCopyrightText: 2022 Jonathan Pugh <jdspugh@gmail.com>
pragma solidity ^0.8.17;

contract Combat {
    // consts
    uint16 constant EMPTY_MOVE = 0xffff;// RRRRRR=0, PPPPPP=0x555
    //bytes32 constant EMPTY_ENCRYPTED_MOVE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    bytes16 constant EMPTY_ENCRYPTED_MOVE = 0x00000000000000000000000000000000;

    // structs
    struct Game{
        // 2 slots (64 bytes) = 24+24+16
        address a1;// p1 address (optimised)
        address a2;// p2 address <-- i.e. challenged person's address (optimised)
        bytes16 me1;// p1 encrypted moves (optimised)

        // 1 slot (max 32 bytes), 5+4+2+2+1 = 14 bytes, room for 19 more
        uint40  t;// game opening time (can move past 2038 with 40 bits)
        uint32  d;// duration in seconds (up to 136 yearas), 0=game already revealed  <-- optimise by using hours instead of seconds
        uint16  m1;// p1 moves (optimised)
        uint16  m2;// p2 moves (optimised)
        uint8   r;// number of rounds
        uint8   b;// bet amount (10**b wei)
    }// size = 24+24+16 + 3+2+2+1 = 72 bytes = 3 (2.25) slots @ 20k per slot + 1 slot for hash key
    
    // variables
    mapping(uint256 => Game) public H;
    address private immutable deployer;
    uint32 private duration = 30*60;// 30min. maximum game duration (seconds) after which it expires and players can claim their money

    // events
    // event Update(uint256 n);//TODO: make anonymous in production;
    event Open(uint256 n, uint8 r, address targetPlayer);
    event Close(uint256 n, uint16 moves);
    event Reveal(uint256 n, uint16 moves);
    event Claim(uint256 n);
    event Cancel(uint256 n);
    event Duration(uint16 d);

    // errors
    error ChooseOpenGame();
    error SendBetAmount();
    error MustBeDeployer();
    error MustBeOpener();
    error MustBePlayer();
    error EnterCorrectParameters();
    error ChallengedPlayerMustClose();
    error CloseGameFirst();
    error ChooseUnusedGameID();
    error GameAlreadyRevealed();
    error GameAlreadyClosed();
    error WinAlreadyClaimed();
    error WaitForExpirey();

    constructor() {
        deployer=msg.sender;
    }

    // set targetPlayer to address(0) to create an open game
    function open(uint256 n, bytes16 encryptedMoves, uint8 r, address targetPlayer) external payable {
        if(EMPTY_ENCRYPTED_MOVE!=H[n].me1) revert ChooseUnusedGameID();// revert sends back the money
        H[n] = Game({
            t:uint40(block.timestamp), b:log10(msg.value),
            me1:encryptedMoves,
            a1:msg.sender, a2:targetPlayer, d:duration,
            m1:EMPTY_MOVE, m2:EMPTY_MOVE, r:r
        });
        emit Open(n,r,targetPlayer);
    }

    function log10(uint256 x) private pure returns(uint8) {
      unchecked {
        uint256 r=0;
        while (true) {
          x/=10;
          if(0==x)break;
          r++;
        }
        return uint8(r);
      }
    }

    function pow10(uint8 x) private pure returns(uint256) {
      uint256 r=1;
      uint256 y=x;// use native data primative, uint256, inside loop
        while (y>0) {
          r*=10;
          unchecked { y--; }
      }
      return r;
    }

    function close(uint256 n, uint16 moves) external payable {
        if(EMPTY_MOVE != H[n].m2) revert ChooseOpenGame();
        if(address(0) != H[n].a2 && H[n].a2!=msg.sender) revert ChallengedPlayerMustClose();
        if(H[n].b != log10(msg.value)) revert SendBetAmount();

        H[n].t = uint40(block.timestamp);
        H[n].m2 = moves;
        H[n].a2 = msg.sender;
        emit Close(n,moves);
    }

    function reveal(uint256 n,uint16 moves,uint144 salt) external {
        if(0 == H[n].d) revert GameAlreadyRevealed(); H[n].d=0;// only payout once (prevent reentrancy attack)
        if(H[n].a1 != msg.sender) revert MustBeOpener();
        uint256 b=H[n].m2;
        if(EMPTY_MOVE == b) revert CloseGameFirst();
        if(H[n].me1 != bytes16(keccak256(abi.encodePacked(moves,salt)))) revert EnterCorrectParameters();
        
        H[n].m1 = moves;

        // determine winner
        uint256 w1=0;
        uint256 w2=0;
        unchecked{
          uint256 a=moves;
          for (uint256 i=H[n].r; i>0; --i) {
              uint256 c=a&0x3;
              uint256 d=b&0x3;
              if(c!=d)if(c==(d+1)%3){w2++;}else{w1++;}//0=R,1=P,2=S
              a>>=2;
              b>>=2;
          }
        }

        // distribute participation tokens
        balances[H[n].a1]++;balances[H[n].a2]++;balances[deployer]++;totalSupply+=3;

        // payout
        uint256 z = pow10(H[n].b);
        // payable(deployer).transfer(z*5/100);
        payable(address(this)).transfer(z*5/100);
        if(w1 == w2) {
            // draw
            payable(H[n].a1).transfer(z*975/1000);
            payable(H[n].a2).transfer(z*975/1000);
        } else {
            // win
            payable(w1>w2 ? H[n].a1 : H[n].a2).transfer(z*195/100);
        }
        emit Reveal(n,moves);
    }

    // closer can force a winning claim after a certain duration since their moves are revealed and P1 could be stalling
    function claim(uint32 n) external {
        if (0 == H[n].d) revert WinAlreadyClaimed();// anyone can force the claim!
        if (EMPTY_MOVE==H[n].m2) revert CloseGameFirst();
        if (block.timestamp < H[n].t + H[n].d) revert WaitForExpirey();
    
        // distribute participation tokens
        balances[H[n].a1]++;balances[H[n].a2]++;balances[deployer]++;totalSupply+=3;

        H[n].d=0;// only claim once (prevent reentrancy attack)
        uint256 z = pow10(H[n].b);
        // payable(deployer).transfer(z*5/100);
        payable(address(this)).transfer(z*5/100);
        payable(H[n].a2).transfer(z*195/100);
        emit Claim(n);
    }

    function cancel(uint256 n) external {
        address a = H[n].a1;
        if(a != msg.sender) revert MustBeOpener();
        if(EMPTY_MOVE!=H[n].m2) revert GameAlreadyClosed();

        H[n].a1 = address(0);// prevent reentrancy
        payable(a).transfer(pow10(H[n].b));
        emit Cancel(n);
    }

    function setDuration(uint16 d) external {
        if(msg.sender!=deployer) revert MustBeDeployer();
        duration=d;
        emit Duration(d);
    }

    // swap all your tokens for your share of the fees
    function swap() external {
        // burn all their tokens (before transfering eth to prevent reentrancy)
        uint256 n = balances[msg.sender];
        balances[msg.sender] = 0;
        totalSupply -= n;
        // send eth in proportion to their share
        payable(msg.sender).transfer(n/(totalSupply+n));
    }

    // ERC20 Begin ---
    // ----------
    // TOKENOMICS
    // Ethereum betting fees collect in this contract and are paid out in the proportion of the ERC20 tokens the withdrawer holds
    // Tokens are gained by playing the game (win or loose)
    // ----------
    string public constant name = "Rock Paper Scissors";
    string public constant symbol = "RPS";
    uint8 public constant decimals = 18;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address=>uint256)) private allowances;
    uint256 public totalSupply = 0;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    function balanceOf(address tokenOwner) external view returns (uint256) {
        return balances[tokenOwner];
    }
    function transfer(address receiver, uint256 amount) external returns (bool) {
        // require(amount <= balances[msg.sender]);// will underflow anyway
        balances[msg.sender] -= amount;
        unchecked{balances[receiver] += amount;}//allways less than total supply
        emit Transfer(msg.sender, receiver, amount);
        return true;
    }
    function approve(address delegate, uint256 amount) external returns (bool) {
        allowances[msg.sender][delegate] = amount;
        emit Approval(msg.sender, delegate, amount);
        return true;
    }
    function allowance(address owner, address delegate) external view returns (uint) {
        return allowances[owner][delegate];
    }
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(amount <= balances[from]);
        require(amount <= allowances[from][msg.sender]);
        balances[from] -= amount;
        allowances[from][msg.sender] -= amount;
        unchecked{balances[to] += amount;}//allways less than total supply
        emit Transfer(from, to, amount);
        return true;
    }
    // ERC20 End ---
}