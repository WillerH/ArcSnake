// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract SnakeNFT is ERC1155, Ownable {
    uint256 public constant MAX_SNAKES = 4;

    uint256[4] public maxSupply;
    uint256[4] public minted;
    uint256[4] public multiplier; // 1x = 100, 1.5x = 150, etc.
    uint256[4] public prices;

    event SnakePurchased(address indexed buyer, uint256 indexed id, uint256 amount, uint256 totalPrice);

    constructor(string memory baseUri, uint256[4] memory _prices) ERC1155(baseUri) Ownable(msg.sender) {
        maxSupply = [uint256(5000), uint256(3000), uint256(1500), uint256(500)];
        multiplier = [uint256(100), uint256(150), uint256(200), uint256(300)];
        prices = _prices;
    }

    function buy(uint256 id, uint256 amount) external payable {
        require(id < MAX_SNAKES, "Invalid id");
        require(amount > 0, "Amount is zero");
        for (uint256 i = 0; i < id; i++) {
            require(balanceOf(msg.sender, i) > 0, "Missing previous rarity");
        }
        uint256 newMinted = minted[id] + amount;
        require(newMinted <= maxSupply[id], "Not enough supply");
        uint256 totalPrice = prices[id] * amount;
        require(msg.value == totalPrice, "Incorrect payment");

        minted[id] = newMinted;
        _mint(msg.sender, id, amount, "");

        emit SnakePurchased(msg.sender, id, amount, totalPrice);
    }

    function setPrice(uint256 id, uint256 newPrice) external onlyOwner {
        require(id < MAX_SNAKES, "Invalid id");
        prices[id] = newPrice;
    }

    function setBaseURI(string calldata newUri) external onlyOwner {
        _setURI(newUri);
    }

    function withdraw(address payable to) external onlyOwner {
        require(to != address(0), "Zero address");
        to.transfer(address(this).balance);
    }
}


