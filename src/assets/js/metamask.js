window.addEventListener('load', function () {
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    web3js = new Web3(web3.currentProvider);
  } else {
    console.log('No web3? You should consider trying MetaMask!');
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //return a message that metamask is not present!!
  }

  initElements();
  startApp();

  setTimeout(function (params) {
    getCurrentPauseStatus();
  }, 2000);
});


var transferTokenPart;
var mintTokenPart;
var burnTokenPart;
var lockTokenPart;
var tokenLockedStatus;
var ownerBalance;

//const TOKEN_ADDRESS = "0x137c25640b4c302416749919d07e26a4a82c6b17";
//const MULTISIG_ADDRESS = "0x53b448654f4855899eb32033f679cbac4b503f7d";
// const TOKEN_ADDRESS = "0x094e6787e569a199970f0714d104e9f766e3d412";
// const MULTISIG_ADDRESS = "0x1ea1b41dffe0ad0de47d60cffb075f5627ce6126";
const TOKEN_ADDRESS = "0xd26d54f1f36e98bb4a395f924f9b80196556d81b";
const MULTISIG_ADDRESS = "0xe2ab7ea61a3eeda00ef32f992ddc70665fdb3bc2";

const DECIMALS = 18;

function initElements() {

  lockTokenPart = {
    createFieldset: document.querySelector('#createLockFieldset'),
    createToAddress: null,
    createTokens: null,

    currentFieldset: document.querySelector('#currentLockFieldset'),
    currentToAddress: null,
    currentTokens: null,


    createButton: document.querySelector('#lockCreateButton'),
    approveButton: document.querySelector('#lockApproveButton'),
    declineButton: document.querySelector('#lockDeclineButton')
  }

  transferTokenPart = {
    createFieldset: document.querySelector('#createTransferFieldset'),
    createToAddress: document.querySelector('#createTransferToAddress'),
    createTokens: document.querySelector('#createTransferTokens'),

    currentFieldset: document.querySelector('#currentFieldset'),
    currentToAddress: document.querySelector('#currentTransferToAddress'),
    currentTokens: document.querySelector('#currentTransferTokens'),

    createButton: document.querySelector('#transferCreateButton'),
    approveButton: document.querySelector('#transferApproveButton'),
    declineButton: document.querySelector('#transferDeclineButton')
  }

  mintTokenPart = {
    createFieldset: document.querySelector('#createMintFieldset'),
    createToAddress: document.querySelector('#createMintToAddress'),
    createTokens: document.querySelector('#createMintTokens'),

    currentFieldset: document.querySelector('#currentMintFieldset'),
    currentToAddress: document.querySelector('#currentMintToAddress'),
    currentTokens: document.querySelector('#currentMintTokens'),

    createButton: document.querySelector('#mintCreateButton'),
    approveButton: document.querySelector('#mintApproveButton'),
    declineButton: document.querySelector('#mintDeclineButton')
  }

  burnTokenPart = {
    createFieldset: document.querySelector('#createBurnFieldset'),
    createTokens: document.querySelector('#createBurnTokens'),

    currentFieldset: document.querySelector('#currentBurnFieldset'),
    currentTokens: document.querySelector('#currentBurnTokens'),

    createButton: document.querySelector('#burnCreateButton'),
    approveButton: document.querySelector('#burnApproveButton'),
    declineButton: document.querySelector('#burnDeclineButton')
  }

  airdropRequestPart = {
    createFieldset: null,
    createTokens: null,

    currentFieldset: null,
    currentTokens: null,

    createButton: null,
    approveButton: document.querySelector('#airdropApproveButton'),
    declineButton: document.querySelector('#airdropDeclineButton')
  }

  document.querySelector('#createBurnTokens').addEventListener('input', onBurnInput)

}

function onBurnInput(event) {
  var value = Number(event.target.value);
  if (value && value <= ownerBalance) {
    burnTokenPart.createButton.removeAttribute('disabled');
    return;
  }
  burnTokenPart.createButton.setAttribute('disabled', '');
}

async function startApp() {
  //checking Main net 
  web3.version.getNetwork(function (err, netId) {
    // console.log(netId);
    if (netId !== "1") {
      //net ID must be 1; Show any message
    }
  });

  // var ethAddr = web3js.eth.defaultAccount;

  if (web3js.eth.defaultAccount === undefined) {
    // $('#metamaskCheck').css('display', 'block');
    // Metamask is not active. Show any message
  }

  ethereum.enable()

  TokenContract = web3js.eth.contract(tokenAbi);
  TokenInstance = TokenContract.at(TOKEN_ADDRESS);

  MultisigContract = web3js.eth.contract(multisigAbi);
  MultisigInstance = MultisigContract.at(MULTISIG_ADDRESS);//PUT YOUR ADDRESS

  document.querySelector('#tokenAddress').innerHTML = TOKEN_ADDRESS;
  document.querySelector('#ownerAddress').innerHTML = MULTISIG_ADDRESS;
  getTotalSupply();
  getOwnerBalance();

  getCurrentTransferRequest();
  getCurrentMintRequest();
  getCurrentBurnRequest();

  calcucateTransferredTokens();
  getCurrentPauseRequest();
  getLastTransfers();

  getCurrentAirdropRequest()
}

var tokenAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "sender",
        "type": "address"
      },
      {
        "name": "recipient",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burnFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOwner",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "recipient",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "ownerAddress",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  }
]

var multisigAbi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "name": "owners",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "approveTransferRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "declineAirdropRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "setTokenAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "declineBurnRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "burnRequest",
    "outputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      },
      {
        "name": "approvals",
        "type": "uint8"
      },
      {
        "name": "declines",
        "type": "uint8"
      },
      {
        "name": "createdBy",
        "type": "address"
      },
      {
        "name": "isActive",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "transferRequest",
    "outputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      },
      {
        "name": "approvals",
        "type": "uint8"
      },
      {
        "name": "declines",
        "type": "uint8"
      },
      {
        "name": "createdBy",
        "type": "address"
      },
      {
        "name": "isActive",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "airdropRequest",
    "outputs": [
      {
        "name": "approvals",
        "type": "uint8"
      },
      {
        "name": "declines",
        "type": "uint8"
      },
      {
        "name": "createdBy",
        "type": "address"
      },
      {
        "name": "airdropLength",
        "type": "uint256"
      },
      {
        "name": "isActive",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "newBurnRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "approveBurnRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "declineTransferRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addresses",
        "type": "address[]"
      },
      {
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "airdrop",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "mintRequest",
    "outputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      },
      {
        "name": "approvals",
        "type": "uint8"
      },
      {
        "name": "declines",
        "type": "uint8"
      },
      {
        "name": "createdBy",
        "type": "address"
      },
      {
        "name": "isActive",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "airdropRequestData",
    "outputs": [
      {
        "name": "addresses",
        "type": "address"
      },
      {
        "name": "values",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "newChangePauseStatusRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "pauseRequest",
    "outputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      },
      {
        "name": "approvals",
        "type": "uint8"
      },
      {
        "name": "declines",
        "type": "uint8"
      },
      {
        "name": "createdBy",
        "type": "address"
      },
      {
        "name": "isActive",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "approveMintRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "approveChangePauseStatusRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "confirmAirdropRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "declineMintRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "newTransferRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "addresses",
        "type": "address[]"
      },
      {
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "newAirdropRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "declineChangePauseStatusRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "newMintRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ownArray",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "token",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "_owners",
        "type": "address[]"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
]

function getTotalSupply() {
  TokenInstance.totalSupply(function (err, result) {
    if (!err) {
      document.querySelector('#tokenSupply').innerHTML = CommaFormatted(result.toString() / Math.pow(10, DECIMALS))
    }
    else
      console.log(err)
  })
}

function getOwnerBalance() {
  TokenInstance.balanceOf(MULTISIG_ADDRESS, function (err, result) {
    if (!err) {
      ownerBalance = result.toString() / Math.pow(10, DECIMALS);
      document.querySelector('#ownerBalance').innerHTML = CommaFormatted(result.toString() / Math.pow(10, DECIMALS))
    }
    else
      console.log(err)
  })
}

// Transfer part
function createTransferRequest() {
  let to = document.querySelector('#createTransferToAddress').value
  let value = document.querySelector('#createTransferTokens').value * Math.pow(10, DECIMALS)

  MultisigInstance.newTransferRequest(to, value, function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function getCurrentTransferRequest() {
  MultisigInstance.transferRequest(function (err, result) {
    if (!err) {
      if (!result[5]) {
        // need to make current block grey
        toggleCurrent(transferTokenPart, false);
        toggleCreate(transferTokenPart, true);

      } else {
        // need to make create block grey
        toggleCurrent(transferTokenPart, true);
        toggleCreate(transferTokenPart, false);
        document.querySelector('#currentTransferToAddress').innerHTML = result[0]
        document.querySelector('#currentTransferTokens').innerHTML = CommaFormatted(result[1] / Math.pow(10, DECIMALS))
        document.querySelector('#currentTransferCreatedByLabel').innerHTML = result[4]
        document.querySelector('#currentTransferDeclinesLabel').innerHTML = result[3]
      }
    } else {
      console.log(err)
    }
  })
}

function approveTransferRequest() {
  MultisigInstance.approveTransferRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function declineTransferRequest() {
  MultisigInstance.declineTransferRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

// Mint part
function createMintRequest() {
  let value = document.querySelector('#createMintTokens').value * Math.pow(10, DECIMALS)

  MultisigInstance.newMintRequest(MULTISIG_ADDRESS, value, function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function getCurrentMintRequest() {
  MultisigInstance.mintRequest(function (err, result) {
    if (!err) {
      if (!result[5]) {
        // need to make current block grey
        toggleCurrent(mintTokenPart, false);
        toggleCreate(mintTokenPart, true);
      } else {
        // need to make create block grey
        toggleCurrent(mintTokenPart, true);
        toggleCreate(mintTokenPart, false);

        document.querySelector('#currentMintToAddress').innerHTML = result[0]
        document.querySelector('#currentMintTokens').innerHTML = CommaFormatted(result[1] / Math.pow(10, DECIMALS))
        document.querySelector('#currentMintCreatedByLabel').innerHTML = result[4]
        document.querySelector('#currentMintDeclinesLabel').innerHTML = result[3]
      }
    } else {
      console.log(err)
    }
  })
}

function approveMintRequest() {
  MultisigInstance.approveMintRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function declineMintRequest() {
  MultisigInstance.declineMintRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

//burn part 

function createBurnRequest() {

  let value = document.querySelector('#createBurnTokens').value * Math.pow(10, DECIMALS)

  MultisigInstance.newBurnRequest(value, function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function getCurrentBurnRequest() {
  MultisigInstance.burnRequest(function (err, result) {
    if (!err) {
      if (!result[5]) {
        // need to make current block grey
        toggleCurrent(burnTokenPart, false);
        toggleCreate(burnTokenPart, true);
      } else {
        // need to make create block grey
        toggleCurrent(burnTokenPart, true);
        toggleCreate(burnTokenPart, false);
        document.querySelector('#currentBurnTokens').innerHTML = CommaFormatted(result[1] / Math.pow(10, DECIMALS))
        document.querySelector('#currentBurnCreatedByLabel').innerHTML = result[4]
        document.querySelector('#currentBurnDeclinesLabel').innerHTML = result[3]
      }
    } else {
      console.log(err)
    }
  })
}

function approveBurnRequest() {
  MultisigInstance.approveBurnRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function declineBurnRequest() {
  MultisigInstance.declineBurnRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

// pause part

function createChangePauseRequest() {
  MultisigInstance.newChangePauseStatusRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function getCurrentPauseRequest() {
  MultisigInstance.pauseRequest(function (err, result) {
    if (!err) {
      if (!result[5]) {
        // need to make current block grey
        document.querySelector('#currentLockFieldsetLabel').innerHTML = "No Request Made"
        toggleCurrent(lockTokenPart, false);
        toggleCreate(lockTokenPart, true);
      } else {
        // need to make create block grey
        document.querySelector('#currentLockFieldsetLabel').innerHTML = "created"
        document.querySelector('#currentLockCreatedByLabel').innerHTML = result[4]
        document.querySelector('#currentLockDeclinesLabel').innerHTML = result[3]
        toggleCurrent(lockTokenPart, true);
        toggleCreate(lockTokenPart, false);
      }
    } else {
      console.log(err)
    }
  })
}

async function getCurrentPauseStatus() {
  TokenInstance.paused(function (err, result) {
    if (!err) {

      console.log(result);
      if (result) {
        document.querySelector('#lockStatus').innerHTML = "locked";
        setTokenLockedStatus(result);
      } else {
        document.querySelector('#lockStatus').innerHTML = "unlocked"
      }

    } else {
      console.log(err)
    }
  })
}

function approvePauseRequest() {
  MultisigInstance.approveChangePauseStatusRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function declinePauseRequest() {
  MultisigInstance.declineChangePauseStatusRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function calcucateTransferredTokens() {
  var ts, ownb
  TokenInstance.totalSupply(function (err, result) {
    if (!err) {
      ts = result.toString()
      TokenInstance.balanceOf(MULTISIG_ADDRESS, function (err, result) {
        if (!err) {
          ownb = result.toString()
          document.querySelector('#tokensTransfered').innerHTML = CommaFormatted((ts - ownb) / Math.pow(10, DECIMALS))
        }
        else
          console.log(err)
      })
    }
    else
      console.log(err)
  })


}

function getLastTransfers() {
  var arr = []

  TokenInstance.Transfer({}, { fromBlock: 0, toBlock: 'latest' }).get((error, eventResult) => {
    if (error)
      console.log('Error in myEvent event handler: ' + error);
    else {
      for (i = 0; i < eventResult.length; i++) {
        arr.push(eventResult[i].args)
        arr[arr.length - 1].value = CommaFormatted(arr[arr.length - 1].value / Math.pow(10, DECIMALS))
      }
    }
    fillTable(arr)
  });
}

// Airdrop part
function createAirdropRequest(addresses, values) {
  MultisigInstance.newAirdropRequest(addresses, values, function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}


function getCurrentAirdropRequest() {
  MultisigInstance.airdropRequest(async function (err, result) {
    if (!err) {
      if (!result[4]) {
        // need to make current block grey
        togglePart(airdropRequestPart, true);
      } else {
        // need to make create block grey
        togglePart(airdropRequestPart, false);
        let arr = await getCurrentAirdropRequestData(result[3].toString())
        await fillAirdropTable(arr)
      }
    } else {
      console.log(err)
    }
  })

}

function getCurrentAirdropRequestData(lastIndex) {
  var promises = [];
  for (let index = 0; index < lastIndex; index++) {
    promises.push(airdropRequestData(index));
  }
  return Promise.all(promises);
}

function airdropRequestData(index) {
  return new Promise(function (resolve, reject) {
    MultisigInstance.airdropRequestData(index, function (err, result) {
      if (!err) {
        var airdropResult = { to: result[0], value: CommaFormatted(result[1].toString() / Math.pow(10, DECIMALS)) };
        resolve(airdropResult)
      } else {
        reject(err);
      }
    })
  });


}

function approveAirdropRequest() {
  MultisigInstance.confirmAirdropRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

function declineAirdropRequest() {
  MultisigInstance.declineAirdropRequest(function (err, result) {
    if (!err) {
      console.log(result)
    } else {
      console.log(err)
    }
  })
}

// end airdrop part

function toggleCurrent(part, enabled) {
  if (enabled) {
    part.currentFieldset.removeAttribute('disabled');
    part.approveButton.removeAttribute('disabled');
    part.declineButton.removeAttribute('disabled');
    return;
  }

  part.currentFieldset.setAttribute('disabled', '');
  part.approveButton.setAttribute('disabled', '');
  part.declineButton.setAttribute('disabled', '');


}

function toggleCreate(part, enabled) {
  if (enabled) {
    part.createFieldset.removeAttribute('disabled');
    return;
  }
  part.createFieldset.setAttribute('disabled', '');
}

function fillTable(data) {
  data = data.reverse();
  var table = document.getElementById('upload-table');
  var tbody = table.querySelector('tbody');

  tbody.innerHTML = '';

  data.forEach(function (rowData, index) {
    var row = createRow(rowData, data.length - index);
    tbody.appendChild(row);
  })
}

async function fillAirdropTable(data) {
  var table = document.querySelector('#airdrop-table');
  var tableBody = table.querySelector('tbody');
  tableBody.innerHTML = null;


  data.forEach(function (row, index) {
    var tableRow = createAirdropRow(row, index);
    tableBody.appendChild(tableRow);
  })
}


function createAirdropRow(data, index) {
  var tr = document.createElement('tr');
  var indexCell = document.createElement('td');
  var to = document.createElement('td');
  var value = document.createElement('td');
  indexCell.innerHTML = index;
  to.innerHTML = data.to;
  value.innerHTML = data.value;
  tr.appendChild(indexCell);
  tr.appendChild(to);
  tr.appendChild(value);
  return tr;
}

function createRow(data, index) {
  var tr = document.createElement('tr');
  var indexCell = document.createElement('td');
  var from = document.createElement('td');
  var to = document.createElement('td');
  var value = document.createElement('td');
  indexCell.innerHTML = index;
  from.innerHTML = data.from;
  to.innerHTML = data.to;
  value.innerHTML = data.value;
  tr.appendChild(indexCell);
  tr.appendChild(from);
  tr.appendChild(to);
  tr.appendChild(value);
  return tr;
}

function CommaFormatted(x) {
  return x.toLocaleString()
}

function setTokenLockedStatus(status) {
  if (status) {
    toggleCreate(transferTokenPart, !status);
    toggleCreate(mintTokenPart, !status);
    toggleCreate(burnTokenPart, !status);
    toggleUploadButton(status);
    togglePart(transferTokenPart, status);
    togglePart(mintTokenPart, status);
    togglePart(burnTokenPart, status);
    togglePart(airdropRequestPart, status);
  }

}

function togglePart(part, disabled) {
  if (disabled) {
    part.createFieldse ? part.createFieldset.setAttribute('disabled', '') : null;
    part.createFieldse ? part.currentFieldset.setAttribute('disabled', '') : null;
    part.approveButton ? part.approveButton.setAttribute('disabled', '') : null;
    part.declineButton ? part.declineButton.setAttribute('disabled', '') : null;
    return;
  }

  part.createFieldse ? part.createFieldset.removeAttribute('disabled') : null;
  part.createFieldse ? part.currentFieldset.removeAttribute('disabled') : null;
  part.approveButton ? part.approveButton.removeAttribute('disabled') : null;
  part.declineButton ? part.declineButton.removeAttribute('disabled') : null;

}

function toggleUploadButton(disabled) {
  var section = document.querySelector('.upload-file-button');
  var input = section.querySelector('input');
  var label = section.querySelector('label');

  if (disabled) {
    input.setAttribute('disabled', '');
    label.classList.add('disabled');
    return;
  }

  input.removeAttribute('disabled');
  label.classList.remove('disabled');

}
