export const chainId = 0x5
export const fromBlock = 7932150
export const address = '0x34d9203E34ACAcB6a612fFc274a146CfF75a553D'
export const abi =`
[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "delegate",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "numTokens",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
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
		"inputs": [],
		"name": "ChooseUnusedGameID",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint32",
				"name": "n",
				"type": "uint32"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"internalType": "uint16",
				"name": "moves",
				"type": "uint16"
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
		"name": "GameAlreadyClosed",
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
		"name": "MustBeOpener",
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
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"internalType": "bytes16",
				"name": "encryptedMoves",
				"type": "bytes16"
			},
			{
				"internalType": "uint8",
				"name": "r",
				"type": "uint8"
			},
			{
				"internalType": "address",
				"name": "targetPlayer",
				"type": "address"
			}
		],
		"name": "open",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
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
		"name": "reveal",
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
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "numTokens",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "numTokens",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WaitForExpirey",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "WinAlreadyClaimed",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			}
		],
		"name": "Cancel",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			}
		],
		"name": "Claim",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "moves",
				"type": "uint16"
			}
		],
		"name": "Close",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "n",
				"type": "uint16"
			}
		],
		"name": "Duration",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "r",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "targetPlayer",
				"type": "address"
			}
		],
		"name": "Open",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "n",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint16",
				"name": "moves",
				"type": "uint16"
			}
		],
		"name": "Reveal",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint16",
				"name": "d",
				"type": "uint16"
			}
		],
		"name": "setDuration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "swap",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "delegate",
				"type": "address"
			}
		],
		"name": "allowance",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenOwner",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
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
				"internalType": "bytes16",
				"name": "me1",
				"type": "bytes16"
			},
			{
				"internalType": "uint40",
				"name": "t",
				"type": "uint40"
			},
			{
				"internalType": "uint32",
				"name": "d",
				"type": "uint32"
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
			},
			{
				"internalType": "uint8",
				"name": "r",
				"type": "uint8"
			},
			{
				"internalType": "uint8",
				"name": "b",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`