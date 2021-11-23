import React, { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import logo from '../assets/media/logos/logo.png'
import CryptoLoria from "../contracts/CryptoLoria.json";
import CryptoLoriaSig from "../contracts/CryptoLoriaSig.json";
import {getWeb3} from "../utility/getWeb3.js"
import Loading from "./Loading.js";
import config from "./config.json";

const Lawis = () => {
    
    const { SigAddress, TOKEN, OWNERS } = config;

    const [cloria, setMsdoge] = useState(null);
    const [cloriaSig, setMsdogeSig] = useState(null);
    const [web3, setWEB3] = useState({});
    const [tokenAddress, setTokenAddress] = useState('Loading...');
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [ownerBalance, setOwnerBalance] = useState('Loading...');
    const [totalSupply,  setTotalSupply ] = useState('Loading...');
    const [isMultipleTransfering, setIsMultipleTranfering] = useState(false);
    const [isMultipleDeclining, setIsMultipleDeclining] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [transferAddress, setTransferAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [itemRequested, setItemRequested] = useState(false);
    const [sentAmount, setSentAmount] = useState('Loading...');
    const [burnAmount, setBurnAmount] = useState('');
    const [activeIdx, setActiveIdx] = useState(-1);
    const [requestedList, setRequestedList] = useState([]);
    const [airDropList, setAirDropList] = useState([]);
    const [transferedList, setTransferedList] = useState([]);
    const [requestBurn, setReqeustBurn] = useState(false);
    const [airDropped, setAirDropped] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [endTransferRequest, setEndTransferRequest] = useState('');
    const [decTransferNumber, setDecTransferNumber] = useState('');
    const [endBurnRequest, setEndBurnRequest] = useState('');
    const [decBurnNumber, setDecBurnNumber] = useState('');

    
    useEffect(async() => {
        
        const _web3 = await getWeb3();
        if (_web3) {
            const _CLoria = new _web3.eth.Contract(CryptoLoria, TOKEN);
            const _CLoriaSig = new _web3.eth.Contract(CryptoLoriaSig, SigAddress);
            setWEB3(_web3);
            setMsdoge(_CLoria);
            setMsdogeSig(_CLoriaSig);
            setTokenAddress(TOKEN);
            const _owner = await _web3.eth.getAccounts();
            if (_owner.length) {
                if (OWNERS.indexOf(_owner[0]) > -1) {
                    setIsConnected(true);
                    setOwnerAddress(_owner[0]);
                }
            }
        }
    }, [])

    useEffect(async() => {
        if (cloriaSig && isConnected && ownerAddress != 'Loading...') {
        console.log('changed');
            await initalSetting();
            await getRequestedList();
            await getAirDropList();
            await getLatestItem();
        }

    }, [cloriaSig, isConnected, ownerAddress])

    useEffect(async() => {
        if (isMultipleTransfering) {
            await approveTransferRequest(0)
        }
    },[isMultipleTransfering]);

    useEffect(async() => {
        if (isMultipleDeclining) {
            await declineTransferRequest(0)
        }
    },[isMultipleDeclining]);

    const initalSetting = async () => {
        const _ownerBalance = await cloria.methods.balanceOf(ownerAddress).call();
        setOwnerBalance(_ownerBalance / (Math.pow(10, 9)));
        const _totalSupply = await cloria.methods.totalSupply().call();
        setTotalSupply(_totalSupply / (2 * Math.pow(10, 9)));
        const _sentAmount = await cloriaSig.methods.getTransferedAmount().call({ from: ownerAddress });
        setSentAmount(_sentAmount / (Math.pow(10, 9)));
    }
    const createTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!web3.utils.isAddress(transferAddress)) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (transferAmount <= 0) {
            NotificationManager.warning("Please enter correct amount!", "Warning");
            return;
        }

        setIsLoading(true);
        try{
            await cloria.methods.approve(SigAddress, web3.utils.toWei(transferAmount.toString(), "mwei")).
            send({ from : ownerAddress })
            .on('receipt', async(receipt) => {
                await cloriaSig.methods.newTransferRequest(transferAddress, web3.utils.toWei(transferAmount.toString(), "mwei"))
                .send({ from: ownerAddress })
                .on('receipt', async(res) => {
                    NotificationManager.info("Added successfully!", "Info");
                    const len = await cloriaSig.methods.getRequestLength().call();
                    const item = await cloriaSig.methods.getTransferItem(len - 1).call();
                    setActiveIdx(item.index - 1);
                    await getRequestedList();
                    setIsLoading(false);
                    setTransferAddress('');
                    setTransferAmount('');
                });
            })
        }
        catch(err) {
            if (err) {
                setIsLoading(false);
                NotificationManager.error("Request is failed!", "Failed");
                setTransferAddress('');
                setTransferAmount('');
            }
        }
    }

    const approveTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        
        if (!endTransferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await cloriaSig.methods.approveTransferRequest(endTransferRequest.index)
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
                await getRequestedList();
                await getLatestItem();
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
            })
            
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const declineTransferRequest = async (idx) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!endTransferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            await cloriaSig.methods.declineTransferRequest(endTransferRequest.index)
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
                await getRequestedList();
                await getLatestItem();
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
            })
            
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);

        }
    }
    
    const getRequestedList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!cloriaSig) {
            return;
        }
        let list = await cloriaSig.methods.getRequestList().call({ from: ownerAddress });
        const requestList = list.filter(item => item.isClosed == false && item.isSent == false);
        const sentList = list.filter(item => item.isSent == true);
        console.log('list=>', list);
        setRequestedList(requestList);
        setTransferedList(sentList);
    }

    const getAirDropList = async() => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!cloriaSig) {
            return;
        }
        let list = await cloriaSig.methods.getAirDropList().call({ from : ownerAddress });
        list = list.filter(item => item.createdBy == ownerAddress)
        setAirDropped(list);
    }

    const approveRequestList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        let sendMultiple = [];

        for (let i = 0; i < requestedList.length; i ++) {
            sendMultiple[i] = requestedList[i]['index'];
        }

        try {
            setIsLoading(true);
            await cloriaSig.methods.approveTransferListRequest(sendMultiple)
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
                await getRequestedList();
                await getLatestItem();
                setIsLoading(false);
            })
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const declineRequestList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        let sendMultiple = [];

        for (let i = 0; i < requestedList.length; i ++) {
            sendMultiple[i] = requestedList[i]['index'];
        }

        try {
            setIsLoading(true);
            await cloriaSig.methods.approveTransferListRequest(sendMultiple)
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {
                NotificationManager.success("Sent successfully!", "Success");
                await getRequestedList();
                await getLatestItem();
                setIsLoading(false);
            })
        } catch(err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const importAirDropList = (e) => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = function(e) {
            const text = e.target.result;
            processCSV(text)
        }

        reader.readAsText(file);
    }

    const processCSV = (str, delim = ',') => {
        const headers = str.slice(0,str.indexOf('\n') - 1 ).split(delim);
        const rows = str.slice(str.indexOf('\n') + 1, str.length - 1).split('\n');
        const newArray = rows.map(row => {
            row = row.slice(0, row.indexOf('\r'));
            const values = row.split(delim);
            const eachObject = headers.reduce((obj, header, i) => {
                obj[header] = values[i];
                return obj;
            }, {})
            return eachObject;
        })
        const dropList = newArray.slice(0, 1);
        setAirDropList(dropList)
    }
    
    const createBurnRequest = async() => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!burnAmount) {
            NotificationManager.warning("Please input amount", "Warning");
            return;
        }

        const requestItem = await cloriaSig.methods.getBurnRequest().call();
        if (requestItem.isActive) {
            NotificationManager.warning("Already requested", "Warning");
            return;
        }

        setBurnAmount('');
        setIsLoading(true);
        
        try {
            await cloria.methods.approve(SigAddress, web3.utils.toWei(burnAmount.toString(), "mwei")).
            send({ from : ownerAddress })
            .on('receipt', async(receipt) => {
                await cloriaSig.methods.newBurnRequest(web3.utils.toWei(burnAmount.toString(),"mwei"))
                .send({ from: ownerAddress })
                .on('receipt', (res) => {
                    NotificationManager.success("Requested successfully", "Success");
                    setReqeustBurn(false);
                    setIsLoading(false);
                });
            })
        } catch(err) {
            console.log(err);
            if (err) {
                setReqeustBurn(false);
                NotificationManager.error("Request failed", "Failed");
                setIsLoading(false);
            }
        }
        
    }

    const approveBurnRequest = async() => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }
        setIsLoading(true);

        try {
            await cloriaSig.methods.approveBurnRequest()
            .send({ from: ownerAddress })
            .on('receipt', receipt => {
                NotificationManager.success("Burned successfully", "Success");
                setReqeustBurn(false);
                setIsLoading(false);
            })
        } catch(err) {
            if (err) {
                setReqeustBurn(false);
                setIsLoading(false);
                NotificationManager.error("Burn failed", "Failed");
            }
        }
    }

    const declineBurnRequest = async() => {
        if (!isConnected) {
            NotificationManager.warning("No requested", "Warning");
            return;
        }

        setIsLoading(true);
        
        try {
            console.log(web3.utils.toWei(burnAmount.toString(),"mwei"), ownerAddress);

            await cloriaSig.methods.declineBurnRequest()
            .send({ from: ownerAddress })
            .on('receipt', (res) => {
                NotificationManager.success("Declined successfully", "Success");
                setReqeustBurn(false);
                setIsLoading(false);
            }).catch(err => {
                console.log(err);
            })
        } catch(err) {
            console.log(err);
            if (err) {
                setReqeustBurn(false);
                NotificationManager.error("Declined failed", "Failed");
                setIsLoading(false);
            }
        }
    }

    const AirDrop = async() => {
        if (!isConnected) {
            NotificationManager.warning("Metamask is not connected!", "Warning");
            return;
        }

        if (!airDropList.length) {
            NotificationManager.warning("No air drop list", "Warning");
            return;
        }

        let chunkList = [];
        let totalBalance = 0;
        setIsLoading(true);
        console.log(airDropList);
        try {
            for (let i = 0; i < airDropList.length; i ++) {
                chunkList[i] = {};
                totalBalance += Number(airDropList[i].balances);
                chunkList[i]["addresses"] = airDropList[i].addresses;
                chunkList[i]["balances"] = web3.utils.toWei(airDropList[i].balances, 'mwei');
            }

            const ownerBalance = await cloria.methods.balanceOf(ownerAddress).call();
            if (ownerBalance <= totalBalance) {
                NotificationManager.warning("Balance is not enough", "Warning");
                return;
            }
            totalBalance = Math.ceil(totalBalance);
            await cloria.methods.approve(SigAddress, web3.utils.toWei(totalBalance.toString(), "mwei"))
            .send({ from: ownerAddress })
            .on('receipt', async(res) => {                
                await cloriaSig.methods.airDrop(chunkList)
                .send({ from : ownerAddress })
                .on('receipt', res => {
                    NotificationManager.success("Airdropped successfully!", "Success");
                    setIsLoading(false);
                    setAirDropList([]);
                })
                .catch(err => console.log)
            })
        } catch(err) {
            console.log(err);
            if (err) {
                NotificationManager.error("Airdropped failed!", "Failed");
                setIsLoading(false);
                setAirDropList([]);
            }
        }
    }

    const walletConnect = async() => {
        if (web3) {
            if (!window.ethereum) {
                NotificationManager.warning("Metamask is not installed", "Warning");
                return;
            }
            else {
                const res = await window.ethereum.enable();
                if (res.length) {
                    setIsConnected(true);
                    setOwnerAddress(res[0]);
                }
            }
        }
    }

    const getLatestItem = async() => {
        const transfer = await cloriaSig.methods.getLatestTransferRequest().call({ from: ownerAddress });
        if (transfer.item.isActive) {
            setEndTransferRequest(transfer.item);
            setDecTransferNumber(transfer.cancel);
        }

        const burn = await cloriaSig.methods.getBurnRequest().call();
        console.log(burn);
        if (burn.item.isActive) {
            setEndBurnRequest(burn.item);
            setDecBurnNumber(burn.cancel);
        }
    }
    return (
        <>
            <NotificationContainer/>
            { isLoading && <Loading/> }
            <div className="container d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-success mb-1" id="wallet-connect" onClick={walletConnect}>
                    {
                        isConnected
                            ? ownerAddress.substr(0, 6) + '...' + ownerAddress.substr(-4)
                            : "Connect Wallet"
                    }
                </button>
            </div>
            <div className="container d-flex justify-content-center">
                <div className="col image-wrapper logo">
                    <img src={logo}
                        alt="" />
                </div>
            </div>

            <div className="container mt-5">
                <div className="row">
                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Token address
                                </h5>
                                <div className="card-text" id="tokenAddress">
                                    {tokenAddress}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="col-sm-6 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Owner address
                                </h5>
                                <div className="card-text" id="ownerAddress">
                                    {ownerAddress}
                                </div>

                            </div>

                        </div>
                    </div>
                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Token supply
                                </h5>
                                <div className="card-text" id="tokenSupply">
                                    {totalSupply}
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Tokens transfered
                                </h5>
                                <div className="card-text" id="tokensTransfered">
                                    {sentAmount}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Owner balance
                                </h5>
                                <div className="card-text" id="ownerBalance">
                                    {ownerBalance}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="col-sm-3 mb-4">
                        <div className="card">

                            <div className="card-body">
                                <h5 className="card-title">
                                    Lock status
                                </h5>
                                <div className="card-text" id="lockStatus">
                                    false
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </div>


            <div className="container">

                <div className="row">
                    <h2 className="mt-5 mb-3 col-7"><strong>Transfer Coins</strong></h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Create transfer request</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Send tokens to new address</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Address"
                                            aria-label="Address"
                                            id="createTransferToAddress"
                                            value={transferAddress}
                                            onChange={(e) => setTransferAddress(e.target.value)}
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Tokens"
                                            aria-label="Tokens"
                                            id="createTransferTokens"
                                            value={ transferAmount }
                                            onChange = { (e) => setTransferAmount(e.target.value) }
                                        />
                                    </div>

                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onClick={ () => createTransferRequest() }>Create</button>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Current transfer request</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Send tokens to new address</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferToAddress"
                                            value={endTransferRequest ? endTransferRequest.to : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? web3.utils.fromWei(endTransferRequest.value, 'mwei') : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? endTransferRequest.createdBy : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endTransferRequest ? decTransferNumber : '' }
                                            readOnly
                                        />
                                    </div>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton"
                                    onClick={ () =>approveTransferRequest() }>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onClick={ () =>declineTransferRequest() }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="container">

                <div className="row">
                    <h2 className="mt-5 mb-3 col-7"><strong>Burn Coins</strong></h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Create  a Request to Burn Coins</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferToAddress">Tokens (without decimals</label>
                                    <div className="input-group mb-3">
                                        <input type="number" className="form-control" placeholder="Tokens" aria-label="Address"
                                            id="createTransferToAddress" value={burnAmount} onChange={(e) => setBurnAmount(e.target.value) } />
                                    </div>
                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onClick={ () => createBurnRequest() }>Create</button>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>Current transfer request</strong>
                                </h5>
                                <fieldset id="createTransferFieldset">
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endBurnRequest ? web3.utils.fromWei(endBurnRequest.value, 'mwei') : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endBurnRequest ? endBurnRequest.createdBy : '' }
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={ endBurnRequest ? decBurnNumber : '' }
                                            readOnly
                                        />
                                    </div>
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton"
                                    onClick={ () => approveBurnRequest() }>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onClick={ () => declineBurnRequest() }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="table-upload-wrapper mt-5">
                <div className="container">
                    <h2 className="mt-5 mb-3">
                        <strong>Current Batch Transfer Request</strong>
                    </h2>
                </div>
                <div className="container mb-5 mt-1">
                    <table className="table upload-data">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                requestedList.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.to}</td>
                                            <td>{web3.utils.fromWei(item.value, 'mwei')}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !requestedList.length && 
                                <tr>
                                    <td colSpan={3} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                    <div className="row">
                        <div className="col-2">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton" onClick={ () =>approveRequestList() } disabled={!requestedList.length && true}>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton" onClick={ () =>declineRequestList() }>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="container">
                    <h2 className="mt-5 mb-3">
                        <strong>Create a Batch Transfer of Coins</strong>
                    </h2>
                </div>
                <div className="container controls-section">
                    <div className="upload-file-button">
                        <div className="file-indicator">
                            Chose file to upload
                        </div>
                        <label htmlFor="file-upload" className="custom-file-upload btn  btn-success">
                            Browse
                        </label>
                        <input id="file-upload" type="file" onChange={importAirDropList} />
                    </div>

                    <button id="uploadBtn" className="btn btn-success" onClick={AirDrop}>AirDrop</button>

                    <div className="filler"></div>
                </div>

                <div className="container mb-5 mt-5">
                    <table className="table upload-data">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>Addresses</th>
                                <th>Balances</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                airDropList.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.addresses}</td>
                                            <td>{item.balances}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !airDropList.length && 
                                <tr>
                                    <td colSpan={3} className="text-center">No rows</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>


                <div className="container mb-5 mt-10">
                    <h2 className="mt-5 mb-3">
                        <strong>Previous Transfers</strong>
                    </h2>
                    <table id="upload-table" className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Dealer</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                transferedList.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.createdBy}</td>
                                            <td>{item.to}</td>
                                            <td>{item.dealedBy}</td>
                                            <td>{web3.utils.fromWei(item.value, "mwei")}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !transferedList.length && 
                                <tr>
                                    <td colSpan={4} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>

                </div>

                <div className="container mb-5 mt-10">
                    <h2 className="mt-5 mb-3">
                        <strong>Previous Airdrop</strong>
                    </h2>
                    <table id="upload-table" className="table">
                        <thead className='thead-dark'>
                            <tr>
                                <th>#</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                airDropped.map((item, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{ownerAddress}</td>
                                            <td>{item.addresses}</td>
                                            <td>{web3.utils.fromWei(item.balances, "mwei")}</td>
                                        </tr>
                                    )
                                })
                            }
                            {
                                !airDropped.length && 
                                <tr>
                                    <td colSpan={4} className="text-center">No requested</td>
                                </tr>
                            }
                        </tbody>
                    </table>

                </div>
            </div>
        </>
    )
}

export default Lawis
