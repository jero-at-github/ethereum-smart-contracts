pragma solidity ^0.4.23;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

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

    function createStar(string _name, string _story, string _dec, string _mag, string _cent, uint256 _tokenId) public { 

        // create instance of Start
        Star memory newStar = Star(_name, _story, _dec, _mag, _cent);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);

        // save the tokenId
        generatedTokenIds.push(_tokenId);    
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public { 
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable { 
        require(starsForSale[_tokenId] > 0);
        
        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);
        
        starOwner.transfer(starCost);

        if(msg.value > starCost) { 
            msg.sender.transfer(msg.value - starCost);
        }
    }
  
    function checkIfStarExist(string _name,  string _story, string _dec, string _mag, string _cent) view public returns(bool) {

        bool result = false;

        for (uint256 i; i < generatedTokenIds.length; i ++) {

            uint256 currentTokenId = generatedTokenIds[i];
            Star memory currentStar = tokenIdToStarInfo[currentTokenId];

            if (
                keccak256(currentStar.name)     == keccak256(_name) && 
                keccak256(currentStar.story)    == keccak256(_story) && 
                keccak256(currentStar.dec)      == keccak256(_dec) && 
                keccak256(currentStar.mag)      == keccak256(_mag) && 
                keccak256(currentStar.cent)     == keccak256(_cent) ) {
                
                result = true;
            }

        }

        return result;
    }    
    
    function approve(address _approved, uint256 _tokenId) public {
        this.approve(_approved, _tokenId);
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public { 
        this.safeTransferFrom(_from, _to, _tokenId);        
    }

    function setApprovalForAll(address _operator, bool _approved) public { 
        this.setApprovalForAll(_operator, _approved);
    }

    function getApproved(uint256 _tokenId) public view returns (address) { 
        return this.getApproved(_tokenId);
    }

    function isApprovedForAll(address _owner, address _operator) public view returns (bool) { 
        return this.isApprovedForAll(_owner, _operator);
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        return this.ownerOf(_tokenId);
    }   
}