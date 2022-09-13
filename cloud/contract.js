export const CONTRACT={
  address:'0xBB12203De4dc2Df6CD99315E177a445b854F2796',
  abi:[
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "n",
          "type": "uint32"
        }
      ],
      "name": "cancel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "ChallengedPlayerMustClose",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ChooseOpenGame",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "n",
          "type": "uint32"
        },
        {
          "internalType": "bytes32",
          "name": "encryptedMoves",
          "type": "bytes32"
        }
      ],
      "name": "close",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "CloseGameFirst",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnterCorrectParameters",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GameAlreadyRevealed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MustBeDeployer",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MustBePlayer",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "encryptedMoves",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "targetPlayer",
          "type": "address"
        }
      ],
      "name": "open",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "n",
          "type": "uint32"
        },
        {
          "internalType": "uint16",
          "name": "moves",
          "type": "uint16"
        },
        {
          "internalType": "uint144",
          "name": "salt",
          "type": "uint144"
        }
      ],
      "name": "revealClose",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "n",
          "type": "uint32"
        },
        {
          "internalType": "uint16",
          "name": "moves",
          "type": "uint16"
        },
        {
          "internalType": "uint144",
          "name": "salt",
          "type": "uint144"
        }
      ],
      "name": "revealOpening",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "SendBetAmount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint24",
          "name": "d",
          "type": "uint24"
        }
      ],
      "name": "setDuration",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "n",
          "type": "uint32"
        }
      ],
      "name": "Update",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "balance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "count",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "H",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "t",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "b",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "me1",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "me2",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "a1",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "a2",
          "type": "address"
        },
        {
          "internalType": "uint24",
          "name": "d",
          "type": "uint24"
        },
        {
          "internalType": "uint16",
          "name": "m1",
          "type": "uint16"
        },
        {
          "internalType": "uint16",
          "name": "m2",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}