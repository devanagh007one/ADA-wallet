import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [balance, setBalance] = useState(null);
    const [conversionRate, setConversionRate] = useState(null);
    const [billAmount, setBillAmount] = useState('');
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchConversionRate = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
                const data = await response.json();
                setConversionRate(data.cardano.usd);
            } catch (error) {
                console.error('Error fetching conversion rate:', error);
                setError('Error fetching conversion rate');
            }
        };

        fetchConversionRate();
    }, []);

    const fetchBalance = async () => {
        try {
            setError(null);
            const response = await fetch(`http://localhost:4000/api/ada/balance/${walletAddress}`);
            const data = await response.json();
            setBalance(data.balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
            setError('Error fetching balance');
        }
    };

    const handleBillAmountChange = (e) => {
        setBillAmount(e.target.value);
    };

    const calculateAdaAmount = () => {
        if (!conversionRate || !billAmount) return 0;
        return (parseFloat(billAmount) / conversionRate).toFixed(4);
    };

    const totalPayableAmount = () => {
        const adaAmount = parseFloat(calculateAdaAmount());
        return (adaAmount + 5).toFixed(2);
    };

    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log('Connected MetaMask accounts:', accounts);
                setWalletAddress(accounts[0]);
            } catch (error) {
                if (error.code === 4001) {
                    console.error('User rejected the connection request:', error);
                    setError('User rejected the connection request');
                } else {
                    console.error('Error connecting to MetaMask:', error);
                    setError('Error connecting to MetaMask');
                }
            }
        } else {
            alert('MetaMask is not installed. Please install MetaMask and try again.');
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="container">
            <h1>USD - ADA - USD</h1>
            <h2>USD to ADA: 1$ : {conversionRate ? `${(1 / conversionRate).toFixed(4)} ADA` : 'Fetching...'}</h2>
            <h2>ADA to USD: 1 ADA : {conversionRate ? `${conversionRate.toFixed(4)} $` : 'Fetching...'}</h2>

            <div className="billInputContainer">
                <h1>Input Bill Amount</h1>
                <input 
                    type='text' 
                    placeholder='Enter your bill in USD' 
                    value={billAmount}
                    onChange={handleBillAmountChange}
                    className="input"
                    required 
                />
            </div>

            <h3>Bill Amount in ADA: {calculateAdaAmount()} ADA</h3>
            <h4>Payment Processing ADA Blocked: 5 ADA</h4>
            <h3>Total Payable Amount: {calculateAdaAmount()} ADA + 5 ADA = {totalPayableAmount()} ADA</h3>

            <div className="buttonContainer">
                <button className="button" onClick={openModal}>Approve Payment</button>
                <button className="button">Reject Payment</button>
            </div>

            {isModalOpen && (
                <div className="modal">
                    <div className="modalContent">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h3>Next Page</h3>
                        <div className="walletInputContainer">
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="Enter Wallet Address to connect eternal wallet"
                                className="input"
                            />
                            <button onClick={fetchBalance} className="button">Connect</button>
                        </div>
                        {balance !== null && <p>Balance: {balance} ADA</p>}
                        {error && <p className="error">{error}</p>}
                        <h3>Wallet Balance: {balance !== null ? balance : 'Fetching...'} ADA</h3>
                        <button className="button" onClick={connectMetaMask}>Pay {calculateAdaAmount()} ADA</button>
                    </div>
                </div>
            )}

            <footer className="footer">
                <p>Powered by Brand Kiln</p>
                <img src="/brandkiln_logo.png" alt="Brand Kiln Pvt Ltd Logo" className="footer-logo" />
            </footer>
        </div>
    );
};

export default App;
