pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 { 

    struct Star { 
        string name;
        string story;
        string dec;
        string mag;
        string cent;                
    }

    mapping(uint256 => Star) public tokenIdToStarInfo; 
    mapping(uint256 => uint256) public starsForSale;
    uint256[] generatedTokenIds;   

    event PutForSell(
        uint256 indexed _tokenId,
        uint256 indexed _price
    );

    /**
     Create a new star
     */
    function createStar(string _name, string _story, string _dec, string _mag, string _cent, uint256 _tokenId) public { 

        // ensure the star doesn't exist already (coordinate check)
        require(checkIfStarExist(_dec, _mag, _cent) == false, "This star was already claimed!");
        
        Star memory newStar = Star(_name, _story, _dec, _mag, _cent);   // create instance of Start
        tokenIdToStarInfo[_tokenId] = newStar;                          // save the newStar object in the tokenIdToStarInfo hash table
        _mint(msg.sender, _tokenId);                                    // mint the new star        
        generatedTokenIds.push(_tokenId);                               // save the tokenId in the generatedTokenIds array
    }           

    /**
     Put a star for sale
     */
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 

        require(this.ownerOf(_tokenId) == msg.sender, "You can't sell a star which doesn't belong to you");
        starsForSale[_tokenId] = _price;
        emit PutForSell(_tokenId, _price);         
    }

    /**
     Buy a star
     */
    function buyStar(uint256 _tokenId) public payable { 

        require(starsForSale[_tokenId] > 0, "The star you try to buy is not for sale");
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost, "Your price doesn't fit with the star price");

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }

    /**
     Utilizing star coordinates, this function will check if the coordinates have already been claimed
     */
    function checkIfStarExist(string _dec, string _mag, string _cent) public view returns(bool) {

        bool result = false;

        for (uint256 i; i < generatedTokenIds.length; i ++) {

            uint256 currentTokenId = generatedTokenIds[i];
            Star memory currentStar = tokenIdToStarInfo[currentTokenId];

            if (
                keccak256(currentStar.dec) == keccak256(_dec) &&
                keccak256(currentStar.mag) == keccak256(_mag) &&
                keccak256(currentStar.cent) == keccak256(_cent) ) {
                
                result = true;
            }

        }

        return result;
    }     

    /**
        EXTENDED ERC721 functions
     */

    function ownerOfStar(uint256 tokenId) public view returns (address) {

        return ownerOf(tokenId);
    }

    function safeStarTransferFrom(address from, address to, uint256 tokenId) public {
                                        
        safeTransferFrom(from, to, tokenId);                
    }    

    function mintStar(address to, uint256 tokenId) internal {

        _mint(to, tokenId);
    }

    function approveStar(address to, uint256 tokenId) public { // expects sender account

        approve(to, tokenId);       
    }

    function setStarApprovalForAll(address to, bool approved) public { // expects sender account

        setApprovalForAll(to, approved);
    }

    function getStarApproved(uint256 tokenId) public view returns (address) {

        return getApproved(tokenId);
    }

    function isStarApprovedForAll(address owner, address operator) public view returns (bool) {

        return isApprovedForAll(owner, operator);
    }
    
}