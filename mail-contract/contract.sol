// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundTransfer {
    address public owner;
    
    event FundsReceived(address indexed from, uint256 amount);
    event FundsTransferred(address indexed to, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Function to receive Ether on Base network
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    // Function to transfer a specific amount to a given address
    function transferFunds(address payable _to, uint256 _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient balance in the contract");
        _to.transfer(_amount);
        emit FundsTransferred(_to, _amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to withdraw all funds from the contract (only owner)
    function withdrawAll() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
        emit FundsTransferred(owner, balance);
    }
}