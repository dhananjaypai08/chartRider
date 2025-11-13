// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin-contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin-contracts/token/ERC721/ERC721.sol";
import {Pausable} from "@openzeppelin-contracts/utils/Pausable.sol";

contract BlockRider is ERC721, Ownable, Pausable {
    error TokenTranserBlocked();
    struct Score {
        uint256 time;
        uint256 score;
    }

    mapping(address => Score) public userScore;
    mapping(address => bool) private visitedUser;
    address[] public users;
    uint256 public tokenId;

    constructor() Ownable(msg.sender) ERC721("KatanaBlockRider", "KBR") {}

    function safeMint(uint256 time, uint256 score) external whenNotPaused {
        address to = msg.sender;
        if(balanceOf(to) == 0){
            _safeMint(to, tokenId);
            ++tokenId;
        }
        Score storage user = userScore[to];
        if (user.score < score) {
            user.score = score;
            user.time = time;
        }
        if(!visitedUser[to]){
            visitedUser[to] = true;
            users.push(to);
        }
    }

    function pause() external onlyOwner{
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _update(
        address to,
        uint256 _tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(_tokenId);
        if (from != address(0) && to != address(0)) {
            revert TokenTranserBlocked();
        }

        return super._update(to, _tokenId, auth);
    }

    function getUserScore(address user) external view returns(uint256 score, uint256 time){
        return (userScore[user].score, userScore[user].time);
    }

    function getUsers() external view returns (address[] memory) {
        return users;
    }

}
