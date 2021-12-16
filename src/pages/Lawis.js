import React, { useEffect, useState } from 'react'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import logo from '../assets/media/logos/logo.png'
// import CryptoLoria from "../contracts/CryptoLoria.json";
// import CryptoLoriaSig from "../contracts/CryptoLoriaSig.json";
// import {getWeb3} from "../utility/getWeb3.js"
import * as anchor from '@project-serum/anchor';
import Loading from "./Loading.js";
import config from "./config.json";
import signer1 from "../contracts/signer-1.json";
import signer2 from "../contracts/signer-2.json";
import signer3 from "../contracts/signer-3.json";
import transfer_json from "../contracts/transferAccount.json";
import airdrop_json from "../contracts/airdropAccount.json";
// import Wallet from '@solana/wallet-adapter-wallets';
// import * as Web3 from '@solana/web3.js';
import {
    Program, Provider, web3
} from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

import multiSigIdl from '../contracts/idl/multi_sig.json';

require('@solana/wallet-adapter-react-ui/styles.css');

const splToken = require('@solana/spl-token');
const opts = {
    preflightCommitment: "processed"
}
// const anchor = require("@project-serum/anchor");
// const assert = require("assert");

const { SigAddress, TOKEN, OWNERS, CLUSTER, TOKEN_ACCOUNT } = config;

const TOKEN_PROGRAM_ID = splToken.TOKEN_PROGRAM_ID;
const TOKEN_MINT_ADDRESS = new web3.PublicKey(TOKEN);
const TOKEN_ACCOUNT_ADDRESS = new web3.PublicKey(TOKEN_ACCOUNT);
const MULTI_SIG_ID = new web3.PublicKey(SigAddress);
const multisigProgramID = new web3.PublicKey(multiSigIdl.metadata.address);
const Lawis = () => {


    // const [cloria, setMsdoge] = useState(null);
    // const [cloriaSig, setMsdogeSig] = useState(null);
    // const [web3, setWEB3] = useState({});
    const [tokenAddress, setTokenAddress] = useState('Loading...');
    const [ownerAddress, setOwnerAddress] = useState('Loading...');
    const [ownerBalance, setOwnerBalance] = useState('Loading...');
    const [totalSupply, setTotalSupply] = useState('Loading...');
    // const [isMultipleTransfering, setIsMultipleTranfering] = useState(false);
    // const [isMultipleDeclining, setIsMultipleDeclining] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [multisigProgram, setMultisigProgram] = useState();
    const [transferAddress, setTransferAddress] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    // const [itemRequested, setItemRequested] = useState(false);
    const [sentAmount, setSentAmount] = useState('Loading...');
    const [burnAmount, setBurnAmount] = useState('');
    // const [activeIdx, setActiveIdx] = useState(-1);
    const [requestedList, setRequestedList] = useState([]);
    const [airDropList, setAirDropList] = useState([]);
    const [transferedList, setTransferedList] = useState([]);
    // const [requestBurn, setReqeustBurn] = useState(false);
    const [endTransferRequestIdx, setEndTransferRequestIdx] = useState();
    const [airDropped, setAirDropped] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [endTransferRequest, setEndTransferRequest] = useState('');
    const [decTransferNumber, setDecTransferNumber] = useState('');
    const [endBurnRequest, setEndBurnRequest] = useState('');
    const [decBurnNumber, setDecBurnNumber] = useState('');
    const [web3Provider, setWeb3Provider] = useState(null);
    const [connection, setConnection] = useState(null);
    const [starlightToken, setStarlightToken] = useState(null);
    const signer1SecretKey = new Uint8Array(signer1);
    const signer1Keypair = web3.Keypair.fromSecretKey(signer1SecretKey);
    const fromWallet = signer1Keypair;
    const signer2SecretKey = new Uint8Array(signer2);
    const signer2Keypair = web3.Keypair.fromSecretKey(signer2SecretKey);
    const signer3SecretKey = new Uint8Array(signer3);
    const signer3Keypair = web3.Keypair.fromSecretKey(signer3SecretKey);
    const transferSecretKey = new Uint8Array(transfer_json);
    const transferKeypair = web3.Keypair.fromSecretKey(transferSecretKey);
    const airdropSecretKey = new Uint8Array(airdrop_json);
    const airdropKeypair = web3.Keypair.fromSecretKey(airdropSecretKey);
    const wallet = useWallet();

    const getProvider = async () => {
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        const network = process.env.REACT_APP_RPC_ENDPOINT;
        const _connection = new web3.Connection(network, opts.preflightCommitment);
        setConnection(_connection);

        const provider = new Provider(
            _connection, wallet, opts.preflightCommitment,
        );
        return provider;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => {
        console.log(wallet)
        setIsConnected(wallet.connected)
        if (wallet.connected) {
            setOwnerAddress(wallet.publicKey);
            const p = await getProvider();
            setWeb3Provider(p);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet.connected]);


    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => {
        if (isConnected) {
            setTokenAddress(TOKEN);
            const provider = await getProvider()
            /* create the program interface combining the idl, program ID, and provider */
            const _program = new Program(multiSigIdl, multisigProgramID, provider);
            console.log(_program)
            setMultisigProgram(_program);
            const _token = new splToken.Token(
                connection,
                TOKEN_MINT_ADDRESS,
                splToken.TOKEN_PROGRAM_ID,
                fromWallet
            );
            console.log(_token)
            setStarlightToken(_token)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(async () => {
        if (starlightToken && multisigProgram && isConnected && ownerAddress != 'Loading...') {
            console.log('changed');
            await getRequestedList();
            await initalSetting();
            // await getAirDropList();
            // await getLatestItem();
        }

    }, [starlightToken, multisigProgram])


    const getSentAmount = async () => {
        let _transferAmount = 0;
        for (const _item of transferedList) {
            _transferAmount += _item.value.toNumber()

        }
        return _transferAmount;
    }

    const initalSetting = async () => {
        // const _ownerBalance = await 
        console.log(connection)
        const _totalSupply = await connection.getTokenSupply(TOKEN_MINT_ADDRESS);
        console.log(_totalSupply)
        setTotalSupply(_totalSupply?.value?.amount * 1 / (Math.pow(10, 9)))
        console.log(starlightToken)
        const fromTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(ownerAddress);
        const _ownerBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
        console.log(_ownerBalance)
        setOwnerBalance(_ownerBalance?.value?.amount * 1 / (Math.pow(10, 9)))
        const _sentAmount = await getSentAmount();
        setSentAmount(_sentAmount)
        await getLatestItem();
    }
    const createTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        if (!transferAddress) {
            NotificationManager.warning("Please enter correct address!", "Warning");
            return;
        }

        if (transferAmount <= 0) {
            NotificationManager.warning("Please enter correct amount!", "Warning");
            return;
        }

        setIsLoading(true);
        try {
            const _transferAccount = web3.Keypair.generate();
            const provider = await getProvider()
            const fromTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                ownerAddress
            )
            // let airdropSignature = await connection.requestAirdrop(
            //     ownerAddress,
            //     web3.LAMPORTS_PER_SOL,
            // );
            // await connection.confirmTransaction(airdropSignature);

            await starlightToken.approve(
                fromTokenAccount.address,
                new web3.PublicKey(transferAddress),
                ownerAddress,
                [signer1Keypair, signer2Keypair],
                transferAmount * 1
            );
            const _value = new anchor.BN(transferAmount * 1);
            console.log(_transferAccount.publicKey.toString(),  await multisigProgram.account.requestStructList.all())
            let _transfer_list = await multisigProgram.account.requestStructList.all();
            
            console.log(_transfer_list[_transfer_list.length-1].publicKey.toString())
            
            await multisigProgram.rpc.createTransferRequest(ownerAddress, new web3.PublicKey(transferAddress), _value, {
                accounts: {
                    transferAccount: _transferAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [_transferAccount]
            });
            // if (_transfer_list.length == 0) {
            //     console.log(1)
            // } else {
            //     console.log(2)
            //     await multisigProgram.rpc.addTransferRequest(ownerAddress, new web3.PublicKey(transferAddress), _value, {
            //         accounts: {
            //             transferAccount: transferKeypair.publicKey,
            //         },
            //     });
            // }

            setTransferAddress('');
            setTransferAmount('');
            await getRequestedList();
            await getLatestItem();
            console.log("SUCCESS");
            setIsLoading(false)
            NotificationManager.info("Added successfully!", "Info");

        }
        catch (err) {
            console.log(err)
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
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        if (!endTransferRequest) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            const provider = await getProvider()

            const fromTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                endTransferRequest.createdBy
            )
            const toTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                endTransferRequest.to
            )

            // let airdropSignature = await connection.requestAirdrop(
            //     fromTokenAccount.owner,
            //     web3.LAMPORTS_PER_SOL,
            // );
            // await connection.confirmTransaction(airdropSignature);

            await multisigProgram.rpc.sendTransferRequest(provider.wallet.publicKey, new anchor.BN(endTransferRequestIdx), {
                accounts: {
                    transferAccount: transferKeypair.publicKey,
                },
            });

            let transaction = new web3.Transaction();
            transaction.add(
                splToken.Token.createTransferInstruction(
                    splToken.TOKEN_PROGRAM_ID,
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    fromTokenAccount.owner,
                    [],
                    web3.LAMPORTS_PER_SOL * endTransferRequest.value.toNumber()
                )
            );
            const signature = await web3.sendAndConfirmTransaction(
                connection,
                transaction,
                [fromWallet]
            );

            NotificationManager.success("Sent successfully!", "Success");
            setIsLoading(false);
            setEndTransferRequest(null);
            await getRequestedList();
            await getLatestItem();
            await initalSetting();
            console.log(signature);

        } catch (err) {
            console.log(err)
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const declineTransferRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        if (!endTransferRequest && !endTransferRequestIdx) {
            NotificationManager.warning("No request!", "Warning");
            return;
        }

        try {
            setIsLoading(true);
            const provider = await getProvider()

            // let airdropSignature = await connection.requestAirdrop(
            //     provider.wallet.publicKey,
            //     web3.LAMPORTS_PER_SOL,
            // );
            // await connection.confirmTransaction(airdropSignature);

            await multisigProgram.rpc.declineTransferRequest(provider.wallet.publicKey, new anchor.BN(endTransferRequestIdx), {
                accounts: {
                    transferAccount: transferKeypair.publicKey,
                },
            });
            await getRequestedList();
            NotificationManager.success("Sent successfully!", "Success");
            await getLatestItem();
            setIsLoading(false);

        } catch (err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            // await getLatestItem();
            setIsLoading(false);
        }
    }

    const getRequestedList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }
        const _list = await multisigProgram.account.requestStructList.fetch(transferKeypair.publicKey)
        const requestList = _list.list.filter(item => item.isClosed === false && item.isSent === false);
        const sentList = _list.list.filter(item => item.isSent === true);
        console.log('list=>', _list);
        console.log('requestList=>', requestList)
        console.log('sentList=>', sentList)
        if (requestList.length) {
            setEndTransferRequest(requestList[requestList.length - 1].account)
            setEndTransferRequestIdx(requestList[requestList.length - 1].publicKey)
        } else {
            setEndTransferRequest(null)
            setEndTransferRequestIdx(null)
        }
        setRequestedList(requestList);
        setTransferedList(sentList);
    }

    // const getAirDropList = async() => {
    //     if (!isConnected) {
    //         NotificationManager.warning("Phantom is not connected!", "Warning");
    //         return;
    //     }

    //     if (!cloriaSig) {
    //         return;
    //     }
    //     let list = await cloriaSig.methods.getAirDropList().call({ from : ownerAddress });
    //     list = list.filter(item => item.createdBy == ownerAddress)
    //     setAirDropped(list);
    // }

    const approveRequestList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        let sendMultiple = [];
        if (!requestedList.length) {
            NotificationManager.warning("No requests!", "Warning");
            return;
        }
        try {
            setIsLoading(true);
            const provider = await getProvider()
            let transaction = new web3.Transaction();
            for (let i = 0; i < requestedList.length; i++) {
                const fromTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                    requestedList[i].createdBy
                )
                const toTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                    requestedList[i].to
                )
                transaction.add(
                    splToken.Token.createTransferInstruction(
                        splToken.TOKEN_PROGRAM_ID,
                        fromTokenAccount.address,
                        toTokenAccount.address,
                        fromTokenAccount.owner,
                        [],
                        web3.LAMPORTS_PER_SOL * requestedList[i].value.toNumber()
                    )
                );
                sendMultiple[i] = requestedList[i].index;
            }
            await multisigProgram.rpc.sendTransferListRequest(provider.wallet.publicKey, sendMultiple, {
                accounts: {
                    transferAccount: transferKeypair.publicKey,
                },
            })

            const signature = await web3.sendAndConfirmTransaction(
                connection,
                transaction,
                [fromWallet]
            );

            NotificationManager.success("Sent successfully!", "Success");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
            console.log(signature)

        } catch (err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const declineRequestList = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        let sendMultiple = [];
        if (!requestedList.length) {
            NotificationManager.warning("No requests!", "Warning");
            return;
        }
        for (let i = 0; i < requestedList.length; i++) {
            sendMultiple[i] = new anchor.BN(requestedList[i]['index']);
        }

        try {
            setIsLoading(true);
            const provider = await getProvider()

            await multisigProgram.rpc.declineTransferListRequest(provider.wallet.publicKey, sendMultiple, {
                accounts: {
                    transferAccount: transferKeypair.publicKey,
                },
            })

            NotificationManager.success("Sent successfully!", "Success");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        } catch (err) {
            NotificationManager.error("Transaction is failed!", "Failed");
            await getRequestedList();
            await getLatestItem();
            setIsLoading(false);
        }
    }

    const importAirDropList = (e) => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = function (e) {
            const text = e.target.result;
            processCSV(text)
        }

        reader.readAsText(file);
    }

    const processCSV = (str, delim = ',') => {
        const headers = str.slice(0, str.indexOf('\n') - 1).split(delim);
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

    const createBurnRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        if (!burnAmount) {
            NotificationManager.warning("Please input amount", "Warning");
            return;
        }

        //     const requestItem = await cloriaSig.methods.getBurnRequest().call();
        //     if (requestItem.isActive) {
        //         NotificationManager.warning("Already requested", "Warning");
        //         return;
        //     }

        setBurnAmount('');
        setIsLoading(true);

        try {
            //         await cloria.methods.approve(SigAddress, web3.utils.toWei(burnAmount.toString(), "mwei")).
            //         send({ from : ownerAddress })
            //         .on('receipt', async(receipt) => {
            //             await cloriaSig.methods.newBurnRequest(web3.utils.toWei(burnAmount.toString(),"mwei"))
            //             .send({ from: ownerAddress })
            //             .on('receipt', (res) => {
            //             });
            //         })
            const provider = await getProvider()
            const fromTokenAccount = await starlightToken.getOrCreateAssociatedAccountInfo(
                ownerAddress
            )
            let airdropSignature = await connection.requestAirdrop(
                ownerAddress,
                web3.LAMPORTS_PER_SOL,
            );
            await connection.confirmTransaction(airdropSignature);

            await starlightToken.burn(
                fromTokenAccount.address,
                ownerAddress,
                [signer1Keypair, signer2Keypair],
                web3.LAMPORTS_PER_SOL * burnAmount * 1
            );
            NotificationManager.success("Requested successfully", "Success");
            // setReqeustBurn(false);
            setIsLoading(false);
        } catch (err) {
            console.log(err);
            if (err) {
                // setReqeustBurn(false);
                NotificationManager.error("Request failed", "Failed");
                setIsLoading(false);
            }
        }

    }

    const approveBurnRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }
        setIsLoading(true);

        try {
            //         await cloriaSig.methods.approveBurnRequest()
            //         .send({ from: ownerAddress })
            //         .on('receipt', receipt => {
            NotificationManager.success("Burned successfully", "Success");
            // setReqeustBurn(false);
            setIsLoading(false);
            //         })
        } catch (err) {
            if (err) {
                //             setReqeustBurn(false);
                setIsLoading(false);
                NotificationManager.error("Burn failed", "Failed");
            }
        }
    }

    const declineBurnRequest = async () => {
        if (!isConnected) {
            NotificationManager.warning("No requested", "Warning");
            return;
        }

        setIsLoading(true);

        try {
            //         console.log(web3.utils.toWei(burnAmount.toString(),"mwei"), ownerAddress);

            //         await cloriaSig.methods.declineBurnRequest()
            //         .send({ from: ownerAddress })
            //         .on('receipt', (res) => {
            NotificationManager.success("Declined successfully", "Success");
            //             setReqeustBurn(false);
            setIsLoading(false);
            //         }).catch(err => {
            //             console.log(err);
            //         })
        } catch (err) {
            console.log(err);
            if (err) {
                //             setReqeustBurn(false);
                NotificationManager.error("Declined failed", "Failed");
                setIsLoading(false);
            }
        }
    }

    const AirDrop = async () => {
        if (!isConnected) {
            NotificationManager.warning("Phantom is not connected!", "Warning");
            return;
        }

        if (!airDropList.length) {
            NotificationManager.warning("No air drop list", "Warning");
            return;
        }

        //     let chunkList = [];
        //     let totalBalance = 0;
        setIsLoading(true);
        //     console.log(airDropList);
        try {
            //         for (let i = 0; i < airDropList.length; i ++) {
            //             chunkList[i] = {};
            //             totalBalance += Number(airDropList[i].balances);
            //             chunkList[i]["addresses"] = airDropList[i].addresses;
            //             chunkList[i]["balances"] = web3.utils.toWei(airDropList[i].balances, 'mwei');
            //         }

            //         const ownerBalance = await cloria.methods.balanceOf(ownerAddress).call();
            //         if (ownerBalance <= totalBalance) {
            //             NotificationManager.warning("Balance is not enough", "Warning");
            //             return;
            //         }
            //         totalBalance = Math.ceil(totalBalance);
            //         await cloria.methods.approve(SigAddress, web3.utils.toWei(totalBalance.toString(), "mwei"))
            //         .send({ from: ownerAddress })
            //         .on('receipt', async(res) => {                
            //             await cloriaSig.methods.airDrop(chunkList)
            //             .send({ from : ownerAddress })
            //             .on('receipt', res => {
            NotificationManager.success("Airdropped successfully!", "Success");
            setIsLoading(false);
            setAirDropList([]);
            //             })
            //             .catch(err => console.log)
            //         })
        } catch (err) {
            console.log(err);
            if (err) {
                NotificationManager.error("Airdropped failed!", "Failed");
                setIsLoading(false);
                setAirDropList([]);
            }
        }
    }

    const walletConnect = async () => {
        if (!web3Provider) {
            const p = await getProvider();
            const walletConnection = await p.connect();
            setWeb3Provider(p);
            const addr = walletConnection.publicKey.toString();
            if (addr) {
                setIsConnected(true)
                setOwnerAddress(addr);
            }
            const _connection = new web3.Connection(
                web3.clusterApiUrl(CLUSTER),
                'confirmed',
            );
            setConnection(_connection);
        }
        // if (web3) {
        //     if (!window.ethereum) {
        //         NotificationManager.warning("Phantom is not installed", "Warning");
        //         return;
        //     }
        //     else {
        //         const res = await window.ethereum.enable();
        //         if (res.length) {
        //             setIsConnected(true);
        //             setOwnerAddress(res[0]);
        //         }
        //     }
        // }
    }

    const getLatestItem = async () => {
        const transfer = await multisigProgram.account.requestStructList.fetch(transferKeypair.publicKey);
        const requestList = transfer.list.filter(item => item.isClosed === false && item.isSent === false);
        if (requestList.length) {
            setEndTransferRequest(requestList[requestList.length - 1]);
            console.log("endRequest=>", requestList[requestList.length - 1])
            setEndTransferRequestIdx(requestList[requestList.length - 1].index);
        } else {
            setEndTransferRequest(null);
            setEndTransferRequestIdx(null);
        }
        // const burn = await cloriaSig.methods.getBurnRequest().call();
        // console.log(burn);
        // if (burn.item.isActive) {
        //     setEndBurnRequest(burn.item);
        //     setDecBurnNumber(burn.cancel);
        // }
    }
    return (
        <>
            <NotificationContainer />
            {isLoading && <Loading />}
            <div className="container d-flex justify-content-end pt-3">
                <WalletMultiButton />
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
                                    {ownerAddress.toString()}
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
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                        />
                                    </div>

                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onClick={() => createTransferRequest()}>Create</button>
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
                                            value={endTransferRequest ? endTransferRequest.to.toString() : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Tokens (without decimals)</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={endTransferRequest ? endTransferRequest.value.toNumber() : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={endTransferRequest ? endTransferRequest.createdBy.toString() : ''}
                                            readOnly
                                        />
                                    </div>
                                    {/* <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={endTransferRequest ? decTransferNumber : ''}
                                            readOnly
                                        />
                                    </div> */}
                                </fieldset>

                            </div>
                        </div>
                    </div>
                    <div className="col-2">
                        <div className="card">
                            <div className="card-body">
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton"
                                    onClick={() => approveTransferRequest()}>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onClick={() => declineTransferRequest()}>Cancel</button>
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
                                            id="createTransferToAddress" value={burnAmount} onChange={(e) => setBurnAmount(e.target.value)} />
                                    </div>
                                    <button type="button" className="btn btn-success w-100 mb-1" id="transferCreateButton"
                                        onClick={() => createBurnRequest()}>Create</button>
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
                                            value={endBurnRequest ? web3.utils.fromWei(endBurnRequest.value, 'mwei') : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Created By</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={endBurnRequest ? endBurnRequest.createdBy : ''}
                                            readOnly
                                        />
                                    </div>
                                    <label htmlFor="createTransferTokens">Number of Cancellations</label>
                                    <div className="input-group mb-3">
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="createTransferTokens"
                                            value={endBurnRequest ? decBurnNumber : ''}
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
                                    onClick={() => approveBurnRequest()}>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton"
                                    onClick={() => declineBurnRequest()}>Cancel</button>
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
                                            <td>{item.to.toString()}</td>
                                            <td>{item.value.toNumber()}</td>
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
                                <button type="button" className="btn btn-success w-100 mb-1" id="transferApproveButton" onClick={() => approveRequestList()} disabled={!requestedList.length && true}>Approve</button>
                                <button type="button" className="btn btn-light w-100" id="transferDeclineButton" onClick={() => declineRequestList()}>Cancel</button>
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
                                            <td>{item.createdBy.toString().substr(0, 6) + ' . . . ' + item.createdBy.toString().substr(-5)}</td>
                                            <td>{item.to.toString().substr(0, 6) + ' . . . ' + item.to.toString().substr(-5)}</td>
                                            <td>{item.dealedBy.toString().substr(0, 6) + ' . . . ' + item.dealedBy.toString().substr(-5)}</td>
                                            <td>{item.value.toNumber()}</td>
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
                                            <td>{ownerAddress.toString()}</td>
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
