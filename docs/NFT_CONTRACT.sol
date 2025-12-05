// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title FUN Planet Achievement NFT
 * @dev ERC721 contract for minting achievement NFTs
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://remix.ethereum.org
 * 2. Create a new file and paste this contract
 * 3. Compile with Solidity 0.8.20
 * 4. Deploy to Polygon Mumbai (testnet) or Polygon Mainnet
 * 5. Set the baseTokenURI to your edge function URL
 * 
 * After deployment, update the NFT_CONTRACT_ADDRESS in:
 * - src/components/profile/AchievementNFTMinter.tsx
 */
contract FunPlanetAchievementNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    string public baseTokenURI;
    
    // Mapping from achievement type to whether it's allowed
    mapping(string => bool) public allowedAchievements;
    
    // Mapping from user address to achievement type to whether they've minted it
    mapping(address => mapping(string => bool)) public hasMinted;
    
    // Events
    event AchievementMinted(address indexed to, uint256 indexed tokenId, string achievementType);
    event BaseURIUpdated(string newBaseURI);
    event AchievementTypeAdded(string achievementType);
    event AchievementTypeRemoved(string achievementType);

    constructor(
        string memory _baseTokenURI
    ) ERC721("FUN Planet Achievement", "FUNACH") Ownable(msg.sender) {
        baseTokenURI = _baseTokenURI;
        
        // Initialize allowed achievement types
        allowedAchievements["first_game"] = true;
        allowedAchievements["play_10_games"] = true;
        allowedAchievements["play_50_games"] = true;
        allowedAchievements["play_100_games"] = true;
        allowedAchievements["first_friend"] = true;
        allowedAchievements["friends_10"] = true;
        allowedAchievements["friends_50"] = true;
        allowedAchievements["combo_master"] = true;
    }

    /**
     * @dev Mint a new achievement NFT
     * @param achievementType The type of achievement being minted
     */
    function mint(string memory achievementType) public returns (uint256) {
        require(allowedAchievements[achievementType], "Invalid achievement type");
        require(!hasMinted[msg.sender][achievementType], "Already minted this achievement");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        // Set token URI to point to our metadata endpoint
        string memory tokenURI = string(abi.encodePacked(
            baseTokenURI,
            "?tokenId=",
            _toString(tokenId)
        ));
        _setTokenURI(tokenId, tokenURI);
        
        hasMinted[msg.sender][achievementType] = true;
        
        emit AchievementMinted(msg.sender, tokenId, achievementType);
        
        return tokenId;
    }

    /**
     * @dev Admin function to mint achievement for a specific user
     * @param to The address to mint to
     * @param achievementType The type of achievement
     */
    function adminMint(address to, string memory achievementType) public onlyOwner returns (uint256) {
        require(allowedAchievements[achievementType], "Invalid achievement type");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        
        string memory tokenURI = string(abi.encodePacked(
            baseTokenURI,
            "?tokenId=",
            _toString(tokenId)
        ));
        _setTokenURI(tokenId, tokenURI);
        
        hasMinted[to][achievementType] = true;
        
        emit AchievementMinted(to, tokenId, achievementType);
        
        return tokenId;
    }

    /**
     * @dev Update the base token URI
     * @param _newBaseURI The new base URI
     */
    function setBaseTokenURI(string memory _newBaseURI) public onlyOwner {
        baseTokenURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    /**
     * @dev Add a new achievement type
     * @param achievementType The achievement type to add
     */
    function addAchievementType(string memory achievementType) public onlyOwner {
        allowedAchievements[achievementType] = true;
        emit AchievementTypeAdded(achievementType);
    }

    /**
     * @dev Remove an achievement type
     * @param achievementType The achievement type to remove
     */
    function removeAchievementType(string memory achievementType) public onlyOwner {
        allowedAchievements[achievementType] = false;
        emit AchievementTypeRemoved(achievementType);
    }

    /**
     * @dev Check if an address can mint a specific achievement
     * @param user The address to check
     * @param achievementType The achievement type to check
     */
    function canMint(address user, string memory achievementType) public view returns (bool) {
        return allowedAchievements[achievementType] && !hasMinted[user][achievementType];
    }

    /**
     * @dev Get the current token ID counter
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Helper function to convert uint to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Required overrides for ERC721URIStorage and ERC721Enumerable
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
