import Web3 from "web3";

export const getWeb3 = () => {
    let web3;
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    }
    else if (window.web3) {
        web3 = new Web3(window.web3);
    }
    return web3;
}