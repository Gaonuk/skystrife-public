// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {System} from "@latticexyz/world/src/System.sol";

import {Player, PlayerVote, Position, PositionData, SpawnPoint, MatchReady, MatchConfig} from "../codegen/index.sol";

import {playerFromAddress} from "../libraries/LibUtils.sol";

contract VoteSystem is System {
    function vote(bytes32 matchEntity, bytes32 playerSelected) public {
        bytes32 player = playerFromAddress(matchEntity, _msgSender());
        require(Player.get(matchEntity, player) > 0, "you are not registered");

        if (PlayerVote.get(matchEntity, player) == bytes32(0)) {
            PlayerVote.set(matchEntity, player, playerSelected);
        } else if (PlayerVote.get(matchEntity, player) == playerSelected) {
            // If the player has already voted, delete the vote
            PlayerVote.deleteRecord(matchEntity, player);
        } else {
            PlayerVote.set(matchEntity, player, playerSelected);
        }
    }
}
