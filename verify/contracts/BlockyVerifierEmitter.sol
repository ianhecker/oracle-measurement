// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStorkVerifierContract {
    function verifyStorkSignatureV1(
        address storkPubKey,
        bytes32 id,
        uint256 recvTime,
        int256 quantizedValue,
        bytes32 publisherMerkleRoot,
        bytes32 valueComputeAlgHash,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) external view returns (bool);
}

contract BlockyVerifierEmitter {
    IStorkVerifierContract private storkVerifierContract;

    event Verified(bool verified);

    constructor(address _storkVerifierContractAddress) {
        storkVerifierContract = IStorkVerifierContract(
            _storkVerifierContractAddress
        );
    }

    function verifyStorkSignatureV1(
        address storkPubKey,
        bytes32 id,
        uint256 recvTime,
        int256 quantizedValue,
        bytes32 publisherMerkleRoot,
        bytes32 valueComputeAlgHash,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) public returns (bool) {
        bool verified = storkVerifierContract.verifyStorkSignatureV1(
            storkPubKey,
            id,
            recvTime,
            quantizedValue,
            publisherMerkleRoot,
            valueComputeAlgHash,
            r,
            s,
            v
        );

        emit Verified(verified);

        return verified;
    }
}
