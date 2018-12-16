pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Coordinates {
        string ra;
        string dec;
        string mag;
    }

    struct Star {
        string name;
        string story;
		    Coordinates coords;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    mapping(bytes32 => bool) public starsMap;

	  uint256 public starCount;

    function createStar(string _name, string _story, string _ra, string _dec, string _mag) public {
    		starCount++;
    		uint256 _tokenId = starCount;

    		// check contract input
    		require(keccak256(abi.encodePacked(_ra)) != keccak256(""));
    		require(keccak256(abi.encodePacked(_dec)) != keccak256(""));
    		require(keccak256(abi.encodePacked(_mag)) != keccak256(""));

    		// check token id
    		require(_tokenId != 0);
    		require(!checkIfStarExist(_ra, _dec, _mag));
    		require(keccak256(abi.encodePacked(tokenIdToStarInfo[_tokenId].coords.ra)) == keccak256(""));

    		Coordinates memory newCoords = Coordinates(_ra, _dec, _mag);
    		Star memory newStar = Star(_name, _story, newCoords);

        tokenIdToStarInfo[_tokenId] = newStar;

    		starsMap[starHash(_ra, _dec, _mag)] = true;

        mint(_tokenId);
    }

    function mint(uint256 _tokenId) public {
        super._mint(msg.sender, _tokenId);
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

	function tokenIdToStarInfo(uint256 _tokenId) public view returns(string, string, string, string, string) {
		return (tokenIdToStarInfo[_tokenId].name, tokenIdToStarInfo[_tokenId].story, tokenIdToStarInfo[_tokenId].coords.ra, tokenIdToStarInfo[_tokenId].coords.dec, tokenIdToStarInfo[_tokenId].coords.mag);
	}

	function starHash(string _ra, string _dec, string _mag) private pure returns(bytes32) {
		return keccak256(abi.encodePacked(_ra, _dec, _mag));
	}

	function checkIfStarExist(string _ra, string _dec, string _mag) public view returns(bool) {
		return starsMap[starHash(_ra, _dec, _mag)];
	}
}
