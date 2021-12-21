// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;

import {LibAavegotchi, AavegotchiInfo} from "../libraries/LibAavegotchi.sol";
import {IERC721} from "../../shared/interfaces/IERC721.sol";
import {LibERC20} from "../../shared/libraries/LibERC20.sol";
import {IERC20} from "../../shared/interfaces/IERC20.sol";
import {LibMeta} from "../../shared/libraries/LibMeta.sol";
import {LibAavegotchiLending} from "../libraries/LibAavegotchiLending.sol";
import {Modifiers, AavegotchiRental} from "../libraries/LibAppStorage.sol";
import {CollateralEscrow} from "../CollateralEscrow.sol";

contract AavegotchiLendingFacet is Modifiers {
    event AavegotchiRentalAdd(
        uint256 indexed rentalId,
        address indexed originalOwner,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 amountPerDay,
        uint256 period,
        uint256 time
    );

    event ERC721ExecutedRental(
        uint256 indexed rentalId,
        address indexed originalOwner,
        address renter,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 amountPerDay,
        uint256 period,
        uint256 time
    );

    ///@notice Get an aavegotchi rental details through an identifier
    ///@dev Will throw if the rental does not exist
    ///@param _rentalId The identifier of the rental to query
    ///@return rental_ A struct containing certain details about the rental like timeCreated etc
    ///@return aavegotchiInfo_ A struct containing details about the aavegotchi
    function getAavegotchiRentalInfo(uint256 _rentalId)
        external
        view
        returns (AavegotchiRental memory rental_, AavegotchiInfo memory aavegotchiInfo_)
    {
        rental_ = s.aavegotchiRentals[_rentalId];
        require(rental_.timeCreated != 0, "AavegotchiLending: rental does not exist");
        aavegotchiInfo_ = LibAavegotchi.getAavegotchi(rental_.erc721TokenId);
    }

    ///@notice Get an ERC721 rental details through an identifier
    ///@dev Will throw if the rental does not exist
    ///@param _rentalId The identifier of the rental to query
    ///@return rental_ A struct containing certain details about the ERC721 rental like timeCreated etc
    function getAavegotchiRental(uint256 _rentalId) external view returns (AavegotchiRental memory rental_) {
        rental_ = s.aavegotchiRentals[_rentalId];
        require(rental_.timeCreated != 0, "AavegotchiLending: rental does not exist");
    }

    ///@notice Get an aavegotchi rental details through an NFT
    ///@dev Will throw if the rental does not exist
    ///@param _erc721TokenId The identifier of the NFT associated with the rental
    ///@return rental_ A struct containing certain details about the rental associated with an NFT of contract identifier `_erc721TokenId`
    function getAavegotchiRentalFromToken(uint256 _erc721TokenId) external view returns (AavegotchiRental memory rental_) {
        uint256 rentalId = s.aavegotchiRentalHead[_erc721TokenId];
        require(rentalId != 0, "AavegotchiLending: rental doesn't exist");
        rental_ = s.aavegotchiRentals[rentalId];
    }

    function isAavegotchiLent(uint256 _erc721TokenId) external view returns (bool) {
        return LibAavegotchiLending.isAavegotchiLent(_erc721TokenId);
    }

    ///@notice Allow an original aavegotchi owner to add request for rental
    ///@dev If the rental request exist, cancel it and replaces it with the new one
    ///@dev If the rental is active, unable to cancel
    ///@param _erc721TokenAddress The contract address of the NFT to rent
    ///@param _erc721TokenId The identifier of the NFT to rent
    ///@param _amountPerDay The rental fee of the aavegotchi in $GHST
    ///@param _period The rental period of the aavegotchi
    ///@param _revenueSplit The revenue split of the rental, 3 values, sum of the should be 100
    ///@param _receiver The 3rd account for receive revenue split, can be address(0)
    ///@param _whitelistId The identifier of whitelist for agree rental, if 0, allow everyone
    function addAavegotchiRental(
        address _erc721TokenAddress,
        uint256 _erc721TokenId,
        uint256 _amountPerDay,
        uint256 _period,
        uint256[3] calldata _revenueSplit,
        address _receiver,
        uint256 _whitelistId
    ) external {
        IERC721 erc721Token = IERC721(_erc721TokenAddress);
        address sender = LibMeta.msgSender();
        require(erc721Token.ownerOf(_erc721TokenId) == sender, "AavegotchiLending: Not owner of aavegotchi");
        require(
            _erc721TokenAddress == address(this) ||
                erc721Token.isApprovedForAll(sender, address(this)) ||
                erc721Token.getApproved(_erc721TokenId) == address(this),
            "AavegotchiLending: Not approved for transfer"
        );

        require(_period > 0, "AavegotchiLending: period should be larger than 0");
        //        require(_revenueSplit.length == 3, "AavegotchiLending: revenues split should consists of 3 values");
        require(_revenueSplit[0] + _revenueSplit[1] + _revenueSplit[2] == 100, "AavegotchiLending: sum of revenue split should be 100");
        if (_receiver == address(0)) {
            require(_revenueSplit[2] == 0, "AavegotchiLending: revenue split for invalid receiver should be zero");
        }
        require(_whitelistId == 0 || s.whitelistOwners[_whitelistId] == sender, "AavegotchiLending: Not owner of whitelist");

        require(s.aavegotchis[_erc721TokenId].status == LibAavegotchi.STATUS_AAVEGOTCHI, "AavegotchiLending: Only aavegotchi available");

        uint256 oldRentalId = s.aavegotchiRentalHead[_erc721TokenId];
        if (oldRentalId != 0) {
            LibAavegotchiLending.cancelAavegotchiRental(oldRentalId, sender);
        } else {
            require(s.aavegotchis[_erc721TokenId].locked == false, "AavegotchiLending: Only callable on unlocked Aavegotchis");
        }

        s.nextAavegotchiRentalId++;
        uint256 rentalId = s.nextAavegotchiRentalId;

        s.aavegotchiRentalHead[_erc721TokenId] = rentalId;
        s.aavegotchiRentals[rentalId] = AavegotchiRental({
            rentalId: rentalId,
            amountPerDay: _amountPerDay,
            period: _period,
            revenueSplit: _revenueSplit,
            originalOwner: sender,
            renter: address(0),
            receiver: _receiver,
            erc721TokenAddress: _erc721TokenAddress,
            erc721TokenId: _erc721TokenId,
            whitelistId: _whitelistId,
            timeCreated: block.timestamp,
            timeAgreed: 0,
            lastClaimed: 0,
            canceled: false,
            completed: false
        });

        emit AavegotchiRentalAdd(rentalId, sender, _erc721TokenAddress, _erc721TokenId, _amountPerDay, _period, block.timestamp);

        // Lock Aavegotchis when listing is created
        if (_erc721TokenAddress == address(this)) {
            s.aavegotchis[_erc721TokenId].locked = true;
        }
    }

    ///@notice Allow an original aavegotchi owner to cancel his NFT rental by providing the NFT contract address and identifier
    ///@param _erc721TokenId The identifier of the NFT to be delisted from rental
    function cancelAavegotchiRentalByToken(uint256 _erc721TokenId) external {
        LibAavegotchiLending.cancelAavegotchiRentalFromToken(_erc721TokenId, LibMeta.msgSender());
    }

    ///@notice Allow an original aavegotchi owner to cancel his NFT rental through the listingID
    ///@param _rentalId The identifier of the rental to be cancelled
    function cancelAavegotchiRental(uint256 _rentalId) external {
        LibAavegotchiLending.cancelAavegotchiRental(_rentalId, LibMeta.msgSender());
    }

    ///@notice Allow a renter to agree an rental for the NFT
    ///@dev Will throw if the NFT has been lent or if the rental has been canceled already
    ///@param _rentalId The identifier of the rental to agree
    function agreeAavegotchiRental(
        uint256 _rentalId,
        uint256 _erc721TokenId,
        uint256 _amountPerDay,
        uint256 _period,
        uint256[3] calldata _revenueSplit
    ) external {
        AavegotchiRental storage rental = s.aavegotchiRentals[_rentalId];
        require(rental.timeCreated != 0, "AavegotchiLending: rental not found");
        require(rental.timeAgreed == 0, "AavegotchiLending: rental already agreed");
        require(rental.canceled == false, "AavegotchiLending: rental canceled");
        require(rental.erc721TokenId == _erc721TokenId, "AavegotchiLending: Invalid token id");
        require(rental.amountPerDay == _amountPerDay, "AavegotchiLending: Invalid amount per day");
        require(rental.period == _period, "AavegotchiLending: Invalid rental period");
        for (uint256 i; i < 3; i++) {
            require(rental.revenueSplit[i] == _revenueSplit[i], "AavegotchiLending: Invalid revenue split");
        }
        address renter = LibMeta.msgSender();
        address originalOwner = rental.originalOwner;
        require(originalOwner != renter, "AavegotchiLending: renter can't be original owner");
        require(rental.whitelistId == 0 || s.isWhitelisted[rental.whitelistId][renter], "AavegotchiLending: Not whitelisted address");

        if (rental.amountPerDay > 0) {
            uint256 transferAmount = rental.amountPerDay * rental.period;
            require(IERC20(s.ghstContract).balanceOf(renter) >= transferAmount, "AavegotchiLending: not enough GHST");
            LibERC20.transferFrom(s.ghstContract, renter, originalOwner, transferAmount);
        }

        rental.renter = renter;
        rental.timeAgreed = block.timestamp;

        uint256 tokenId = rental.erc721TokenId;
        s.lentTokenIdIndexes[originalOwner][tokenId] = s.lentTokenIds[originalOwner].length;
        s.lentTokenIds[originalOwner].push(tokenId);

        if (rental.erc721TokenAddress == address(this)) {
            LibAavegotchi.transfer(originalOwner, renter, tokenId);
        } else {
            // External contracts
            IERC721(rental.erc721TokenAddress).safeTransferFrom(originalOwner, renter, tokenId);
        }

        // set original owner as pet operator
        s.petOperators[renter][originalOwner] = true;

        emit ERC721ExecutedRental(
            _rentalId,
            originalOwner,
            renter,
            rental.erc721TokenAddress,
            tokenId,
            rental.amountPerDay,
            rental.period,
            block.timestamp
        );
    }

    ///@notice Allow a original owner to claim revenue from the rental
    ///@dev Will throw if the NFT has not been lent or if the rental has been canceled already
    ///@param _tokenId The identifier of the lent aavegotchi to claim
    ///@param _revenueTokens The address array of the revenue tokens to claim; FUD, FOMO, ALPHA, KEK, then GHST
    function claimAavegotchiRental(uint256 _tokenId, address[] calldata _revenueTokens) external {
        uint256 rentalId = s.aavegotchiRentalHead[_tokenId];
        require(rentalId != 0, "AavegotchiLending: rental not found");
        AavegotchiRental storage rental = s.aavegotchiRentals[rentalId];

        address sender = LibMeta.msgSender();
        address originalOwner = rental.originalOwner;
        address renter = rental.renter;
        address receiver = rental.receiver;
        uint256 completionTime = rental.timeAgreed + rental.period * 1 days;
        if (completionTime + 1 days > block.timestamp) {
            require(originalOwner == sender, "AavegotchiLending: only owner can claim during agreement");
        }

        uint256 tokenId = rental.erc721TokenId;
        address escrow = s.aavegotchis[tokenId].escrow;
        address collateralType = s.aavegotchis[tokenId].collateralType;
        for (uint256 i; i < _revenueTokens.length; i++) {
            address revenueToken = _revenueTokens[i];
            if (escrow == address(0)) continue;
            if (collateralType == revenueToken) continue;

            uint256 balance = IERC20(revenueToken).balanceOf(escrow);
            if (balance == 0) continue;

            if (IERC20(revenueToken).allowance(escrow, address(this)) < balance) {
                CollateralEscrow(escrow).approveAavegotchiDiamond(revenueToken);
            }
            if ((completionTime + 1 days <= block.timestamp) && (sender != originalOwner)) {
                uint256 senderAmount = (balance * 3) / 100;
                LibERC20.transferFrom(revenueToken, escrow, sender, senderAmount);
                balance -= senderAmount;
            }

            uint256 ownerAmount = (balance * rental.revenueSplit[0]) / 100;
            uint256 renterAmount = (balance * rental.revenueSplit[1]) / 100;
            LibERC20.transferFrom(revenueToken, escrow, originalOwner, ownerAmount);
            LibERC20.transferFrom(revenueToken, escrow, renter, renterAmount);
            if (receiver != address(0)) {
                uint256 receiverAmount = (balance * rental.revenueSplit[2]) / 100;
                LibERC20.transferFrom(revenueToken, escrow, receiver, receiverAmount);
            }
        }

        rental.lastClaimed = block.timestamp;
        if (completionTime <= block.timestamp) {
            if (rental.erc721TokenAddress == address(this)) {
                s.aavegotchis[tokenId].locked = false;
                LibAavegotchi.transfer(renter, originalOwner, tokenId);
            } else {
                // External contracts
                IERC721(rental.erc721TokenAddress).safeTransferFrom(renter, originalOwner, tokenId);
            }

            rental.completed = true;
            s.aavegotchiRentalHead[tokenId] = 0;

            LibAavegotchiLending.removeLentAavegotchi(tokenId, originalOwner);

            // TODO: remove pet operator
        }
    }
}
