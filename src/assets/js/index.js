(function name(params) {

    //top bar
    var tokenAddress;
    var tokenSupply;
    var ownerAddress;
    var ownerBalance;
    var tokensTransfered;
    var tokenLockedStatus;
    var changeTokenLockStatusButton;

    var transferTokenPart;
    var mintTokenPart;
    var burnTokenPart;

    document.addEventListener("DOMContentLoaded", function (event) {
        tokenAddress = document.querySelector('#tokenAddress');
        tokenSupply = document.querySelector('#tokenSupply');
        ownerAddress = document.querySelector('#ownerAddress');
        ownerBalance = document.querySelector('#ownerBalance');
        tokensTransfered = document.querySelector('#tokensTransfered');

        tokenLockedStatus = document.querySelector('#tokenLockedStatus');
        //changeTokenLockStatusButton = document.querySelector('#changeTokenLockStatusButton');

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



        init();
    });




    function init() {
        setTokenAddress('TokenAddress');
        setTokenSupply('Token supply');
        setOwnerAddress('ownerAddress');
        setOwnerBalance('ownerBalance');
        setTokensTransfered('tokensTransfered');
        //setTokenLockedStatus(false);

        transferTokenPart.createButton.addEventListener('click', onTransferCreate);
        transferTokenPart.approveButton.addEventListener('click', onTransferApprove);
        transferTokenPart.declineButton.addEventListener('click', onTransferDecline);

        mintTokenPart.createButton.addEventListener('click', onMintCreate);
        mintTokenPart.approveButton.addEventListener('click', onMintApprove);
        mintTokenPart.declineButton.addEventListener('click', onMintDecline);

        burnTokenPart.createButton.addEventListener('click', onBurnCreate);
        burnTokenPart.approveButton.addEventListener('click', onBurnApprove);
        burnTokenPart.declineButton.addEventListener('click', onBurnDecline);


        //changeTokenLockStatusButton.addEventListener('click', onChangeTokenLockStatusClick)


    }

    function onTransferCreate() {
        var data = getPartData(transferTokenPart);
        console.log('transfer create');
        console.log(data);
    }

    
    function onMintCreate() {
        var data = getPartData(mintTokenPart);
        console.log('mint create');
        console.log(data);
    }

    
    function onBurnCreate() {
        var data = getPartData(burnTokenPart);
        console.log('burn create');
        console.log(data);
    }

    function togglePart(part, disabled) {
        if (disabled) {
            part.createFieldset.setAttribute('disabled', '');
            part.currentFieldset.setAttribute('disabled', '');
            part.approveButton.setAttribute('disabled', '');
            part.declineButton.setAttribute('disabled', '');
            return;
        }

        part.createFieldset.removeAttribute('disabled');
        part.currentFieldset.removeAttribute('disabled');
        part.approveButton.removeAttribute('disabled');
        part.declineButton.removeAttribute('disabled');
    }

    function onChangeTokenLockStatusClick(params) {
        var currentLockStatus = tokenLockedStatus.innerHTML === 'true';
        console.log('prev status');
        console.log(currentLockStatus);

        // if (currentLockStatus) {
        //     setTokenLockedStatus(false);
        // } else {
        //     setTokenLockedStatus(true);
        // }
    }

    function setTokenLockedStatus(status) {
        tokenLockedStatus.innerHTML = status;

        togglePart(transferTokenPart, status);
        togglePart(mintTokenPart, status);
        togglePart(burnTokenPart, status);
    }

    function onTransferApprove() {
        var data = getPartData(transferTokenPart);
        console.log('transfer approve');
        console.log(data);
    }

    function onMintApprove() {
        var data = getPartData(mintTokenPart);
        console.log('mint approve');
        console.log(data);
    }

    function onBurnApprove() {
        var data = getPartData(burnTokenPart);
        console.log('burn approve');
        console.log(data);
    }


    function onTransferDecline() {
        var data = getPartData(transferTokenPart);
        console.log('transfer decline');
        console.log(data);
    }

    function onMintDecline() {
        var data = getPartData(mintTokenPart);
        console.log('mint decline');
        console.log(data);
    }

    function onBurnDecline() {
        var data = getPartData(burnTokenPart);
        console.log('burn decline');
        console.log(data);
    }

    function getPartData(part) {
        var data = {
            create: {
                address: part.createToAddress ? part.createToAddress.value : null,
                tokens: Number(part.createTokens.value)
            },
            current: {
                address: part.currentToAddress ? part.currentToAddress.value : null,
                tokens: Number(part.currentTokens.value)
            }
        }
        return data;
    }


  
    function setTokensTransfered(tokens) {
        tokensTransfered.innerHTML = tokens;
    }

    function setTokenAddress(address) {
        tokenAddress.innerHTML = address;
    }

    function setTokenSupply(supply) {
        tokenSupply.innerHTML = supply;
    }

    function setOwnerAddress(address) {
        ownerAddress.innerHTML = address;
    }

    function setOwnerBalance(balance) {
        ownerBalance.innerHTML = balance;
    }
})();