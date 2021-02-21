// SPDX-License-Identifier: MIT
pragma solidity 0.8.1;
import {LibDiamond} from "../../shared/libraries/LibDiamond.sol";
import {LibMeta} from "../../shared/libraries/LibMeta.sol";
//import "../interfaces/IERC20.sol";
// import "hardhat/console.sol";

struct Aavegotchi {
    // This 256 bit value is broken up into 16 16-bit slots for storing wearableIds
    // See helper function that converts this value into a uint16[16] memory equipedWearables
    uint256 equippedWearables; //The currently equipped wearables of the Aavegotchi
    string name;
    uint256 randomNumber;
    // [Experience, Rarity Score, Kinship, Eye Color, Eye Shape, Brain Size, Spookiness, Aggressiveness, Energy]
    uint256 temporaryTraitBoosts;
    uint40 lastTemporaryBoost;
    uint256 numericTraits; // Sixteen 16 bit ints.  [Eye Color, Eye Shape, Brain Size, Spookiness, Aggressiveness, Energy]
    address owner;
    // uint32 batchId;
    uint16 hauntId;
    uint8 status; // 0 == portal, 1 == VRF_PENDING, 2 == open portal, 3 == Aavegotchi
    uint32 experience; //How much XP this Aavegotchi has accrued. Begins at 0.
    address collateralType;
    uint88 minimumStake; //The minimum amount of collateral that must be staked. Set upon creation.
    uint16 usedSkillPoints; //The number of skill points this aavegotchi has already used
    uint40 claimTime; //The block timestamp when this Aavegotchi was claimed
    uint40 lastInteracted; //The last time this Aavegotchi was interacted with
    uint16 interactionCount; //How many times the owner of this Aavegotchi has interacted with it.
    address escrow; //The escrow address this Aavegotchi manages.
    bool locked;
}

struct ItemType {
    string description;
    string author;
    // treated as int8s array
    // [Experience, Rarity Score, Kinship, Eye Color, Eye Shape, Brain Size, Spookiness, Aggressiveness, Energy]
    uint256 traitModifiers; //[WEARABLE ONLY] How much the wearable modifies each trait. Should not be more than +-5 total
    // this is an array of uint indexes into the collateralTypes array
    uint8[] allowedCollaterals; //[WEARABLE ONLY] The collaterals this wearable can be equipped to. An empty array is "any"
    string name; //The name of the item
    uint96 ghstPrice; //How much GHST this item costs
    uint32 svgId; //The svgId of the item
    uint32 maxQuantity; //Total number that can be minted of this item.
    uint8 rarityScoreModifier; //Number from 1-50.
    // Each bit is a slot position. 1 is true, 0 is false
    uint16 slotPositions; //[WEARABLE ONLY] The slots that this wearable can be added to.
    bool canPurchaseWithGhst;
    uint32 totalQuantity; //The total quantity of this item minted so far
    uint8 minLevel; //The minimum Aavegotchi level required to use this item. Default is 1.
    bool canBeTransferred;
    uint8 category; // 0 is wearable, 1 is badge, 2 is consumable
    int8 kinshipBonus; //[CONSUMABLE ONLY] How much this consumable boosts (or reduces) kinship score
    uint32 experienceBonus; //[CONSUMABLE ONLY]
    // SVG x,y,width,height
    uint32 dimensions;
}

struct WearableSet {
    string name;
    uint8[] allowedCollaterals;
    uint256 wearableIds; // The tokenIdS of each piece of the set
    uint256 traitsBonuses;
}

struct Haunt {
    uint24 hauntMaxSize; //The max size of the Haunt
    uint96 portalPrice;
    bytes3 bodyColor;
    uint24 totalCount;
}

struct SvgLayer {
    address svgLayersContract;
    uint16 offset;
    uint16 size;
}

struct AavegotchiCollateralTypeInfo {
    // treated as an arary of int8
    uint256 modifiers; //Trait modifiers for each collateral. Can be 2, 1, -1, or -2
    bytes3 primaryColor;
    bytes3 secondaryColor;
    bytes3 cheekColor;
    uint8 svgId;
    uint8 eyeShapeSvgId;
    uint16 conversionRate; //Current conversionRate for the price of this collateral in relation to 1 USD. Can be updated by the DAO
    bool delisted;
}

struct ERC1155Listing {
    uint256 listingId;
    address seller;
    address erc1155TokenAddress;
    uint256 erc1155TypeId;
    uint256 category; // 0 is wearable, 1 is badge, 2 is consumable, 3 is tickets
    uint256 quantity;
    uint256 priceInWei;
    uint256 timeCreated;
    uint256 timeLastPurchased;
    uint256 sourceListingId;
    bool sold;
    bool cancelled;
}

struct ERC721Listing {
    uint256 listingId;
    address seller;
    address erc721TokenAddress;
    uint256 erc721TokenId;
    uint256 category; // 0 is closed portal, 1 is vrf pending, 2 is open portal, 3 is Aavegotchi
    uint256 priceInWei;
    uint256 timeCreated;
    uint256 timePurchased;
    bool sold;
    bool cancelled;
}

struct ListingListItem {
    uint256 parentListingId;
    uint256 listingId;
    uint256 childListingId;
}

struct AppStorage {
    mapping(address => AavegotchiCollateralTypeInfo) collateralTypeInfo;
    mapping(address => uint256) collateralTypeIndexes;
    mapping(bytes32 => SvgLayer[]) svgLayers;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) nftBalances;
    mapping(address => uint256) aavegotchiBalance;
    ItemType[] itemTypes;
    WearableSet[] wearableSets;
    mapping(uint256 => Haunt) haunts;
    mapping(address => mapping(uint256 => uint256)) items;
    mapping(uint256 => uint256) tokenIdToRandomNumber;
    mapping(uint256 => Aavegotchi) aavegotchis;
    mapping(address => mapping(address => bool)) operators;
    mapping(uint256 => address) approved;
    mapping(string => bool) aavegotchiNamesUsed;
    mapping(address => uint256) metaNonces;
    uint32 totalSupply;
    uint16 currentHauntId;
    //Addresses
    address[] collateralTypes;
    address ghstContract;
    address childChainManager;
    address gameManager;
    address dao;
    address daoTreasury;
    address pixelCraft;
    address rarityFarming;
    string itemsBaseUri;
    bytes32 domainSeperator;
    // Marketplace
    uint256 nextERC1155ListingId;
    // erc1155 category => erc1155Order
    //ERC1155Order[] erc1155MarketOrders;
    mapping(uint256 => ERC1155Listing) erc1155Listings;
    // category => ("listed" or purchased => first listingId)
    //mapping(uint256 => mapping(string => bytes32[])) erc1155MarketListingIds;
    mapping(uint256 => mapping(string => uint256)) erc1155ListingHead;
    // "listed" or purchased => (listingId => ListingListItem)
    mapping(string => mapping(uint256 => ListingListItem)) erc1155ListingListItem;
    mapping(address => mapping(uint256 => mapping(string => uint256))) erc1155OwnerListingHead;
    // "listed" or purchased => (listingId => ListingListItem)
    mapping(string => mapping(uint256 => ListingListItem)) erc1155OwnerListingListItem;
    mapping(address => mapping(uint256 => mapping(address => uint256))) erc1155TokenToListingId;
    uint256 listingFeeInWei;
    // erc1155Token => (erc1155TypeId => category)
    mapping(address => mapping(uint256 => uint256)) erc1155Categories;
    uint256 nextERC721ListingId;
    //ERC1155Order[] erc1155MarketOrders;
    mapping(uint256 => ERC721Listing) erc721Listings;
    // listingId => ListingListItem
    mapping(uint256 => ListingListItem) erc721ListingListItem;
    //mapping(uint256 => mapping(string => bytes32[])) erc1155MarketListingIds;
    mapping(uint256 => mapping(string => uint256)) erc721ListingHead;
    // user address => category => sort => listingId => ListingListItem
    mapping(uint256 => ListingListItem) erc721OwnerListingListItem;
    //mapping(uint256 => mapping(string => bytes32[])) erc1155MarketListingIds;
    mapping(address => mapping(uint256 => mapping(string => uint256))) erc721OwnerListingHead;
    // erc1155Token => (erc1155TypeId => category)
    // not really in use now, for the future
    mapping(address => mapping(uint256 => uint256)) erc721Categories;
    // erc721 token address, erc721 tokenId, user address => listingId
    mapping(address => mapping(uint256 => mapping(address => uint256))) erc721TokenToListingId;
}

library LibAppStorage {
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }

    function uintToSixteenBitArray(uint256 _data) internal pure returns (uint256[16] memory array_) {
        for (uint256 i; i < 16; i++) {
            uint256 item = uint16(_data >> (16 * i));
            array_[i] = item;
        }
    }
}

contract LibAppStorageModifiers {
    AppStorage internal s;
    modifier onlyAavegotchiOwner(uint256 _tokenId) {
        require(LibMeta.msgSender() == s.aavegotchis[_tokenId].owner, "LibAppStorage: Only aavegotchi owner can call this function");
        _;
    }
    modifier onlyUnlocked(uint256 _tokenId) {
        require(s.aavegotchis[_tokenId].locked == false, "LibAppStorage: Only callable on unlocked Aavegotchis");
        _;
    }
    // modifier onlyLocked(uint256 _tokenId) {
    //     require(s.aavegotchis[_tokenId].unlockTime > block.timestamp, "Only callable on unlocked Aavegotchis");
    //     _;
    // }

    modifier onlyOwner {
        LibDiamond.enforceIsContractOwner();
        _;
    }

    modifier onlyDao {
        require(LibMeta.msgSender() == s.dao || LibMeta.msgSender() == address(this), "Only DAO can call this function");
        _;
    }

    modifier onlyDaoOrOwner {
        require(
            LibMeta.msgSender() == s.dao || LibMeta.msgSender() == LibDiamond.contractOwner() || LibMeta.msgSender() == address(this),
            "LibAppStorage: Do not have access"
        );
        _;
    }

    modifier onlyOwnerOrDaoOrGameManager {
        require(
            LibMeta.msgSender() == s.dao ||
                LibMeta.msgSender() == LibDiamond.contractOwner() ||
                LibMeta.msgSender() == address(this) ||
                LibMeta.msgSender() == s.gameManager,
            "LibAppStorage: Do not have access"
        );
        _;
    }
}
