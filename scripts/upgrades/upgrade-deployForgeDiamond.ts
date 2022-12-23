import { run, ethers } from "hardhat";
import {
    convertFacetAndSelectorsToString,
    DeployUpgradeTaskArgs,
    FacetsAndAddSelectors,
} from "../../tasks/deployUpgrade";
import { ForgeDiamond__factory } from "../../typechain/factories/ForgeDiamond__factory";

import { gasPrice } from "../helperFunctions";

//these already deployed facets(in the aavegotchi diamond) are added to the forgeDiamond directly
const aavegotchiCutFacet = "0x4f908Fa47F10bc2254dae7c74d8B797C1749A8a6";
const aavegotchiLoupeFacet = "0x58f64b56B1e15D8C932c51287d814EDaa8d6feb9";
const aavegotchiOwnerShipFacet = "0xAE7DF9f59FEc446903c64f21a76d039Bc81712ef";

async function deployAndUpgradeWearableDiamond() {
    console.log("Deploying forge diamond");

    const Diamond = (await ethers.getContractFactory(
        "ForgeDiamond"
    )) as ForgeDiamond__factory;

    const signerAddress = await (await ethers.getSigners())[0].getAddress();

    const diamond = await Diamond.deploy(
        signerAddress,
        aavegotchiCutFacet,
        aavegotchiLoupeFacet,
        aavegotchiOwnerShipFacet,
        { gasPrice: gasPrice }
    );
    await diamond.deployed();
    console.log("Forge Diamond deployed to:", diamond.address);

    //upgrade with custom facets
    console.log("-------------------------");
    console.log("executing upgrade");

    const facets: FacetsAndAddSelectors[] = [
        {
            facetName: "ForgeFacet",
            addSelectors: [
                "function getAavegotchiSmithingLevel(uint256 gotchiId) public returns (uint256)",
                "function getSmithingLevelMultiplierBips(uint256 gotchiId) public returns (uint256)",
                "function coreTokenIdFromRsm(uint8 rarityScoreModifier) public returns (uint256 tokenId)",
                "function smeltAlloyMintAmount (uint8 rarityScoreModifier) public view returns (uint256 alloy)",
                "function smeltWearables(uint256[] calldata _itemIds, uint256[] calldata _gotchiIds) external",
                "function claimForgeQueueItems(uint256[] calldata gotchiIds) external",
                "function getAavegotchiQueueItem(uint256 gotchiId) public returns (ForgeQueueItem memory output)",
                "function getForgeQueueOfOwner(address _owner) external returns (ForgeQueueItem[] memory output)",
                "function forgeWearables(uint256[] calldata _itemIds, uint256[] calldata _gotchiIds, uint40[] calldata _gltr) external",
                "function availableToForge(uint256 itemId) public view returns(bool available)",
                "function mintEssence(address owner, uint256 gotchiId) external",
                "function adminMint(address account, uint256 id, uint256 amount) external",
                "function pause() public",
                "function unpause() public",
                "function name() external view returns (string memory)",
                "function symbol() external view returns (string memory)",
                "function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Receiver) returns (bool)",
                "function uri(uint256 tokenId) public view virtual override(ERC1155, ERC1155URIStorage) returns (string memory)"
            ],
            removeSelectors: [],
        },

        {
            facetName: "ForgeDAOFacet",
            addSelectors: [
                "function setAavegotchiDaoAddress(address daoAddress) external",
                "function setGltrAddress(address gltr) external",
                "function setForgeDiamondAddress(address diamond) external",
                "function getAlloyDaoFeeInBips() external view returns (uint256)",
                "function setAlloyDaoFeeInBips(uint256 alloyDaoFeeInBips) external",
                "function getAlloyBurnFeeInBips() external view returns (uint256)",
                "function setAlloyBurnFeeInBips(uint256 alloyBurnFeeInBips) external",
                "function setForgeAlloyCost (RarityValueIO calldata costs) external",
                "function setForgeEssenceCost (RarityValueIO calldata costs) external",
                "function setForgeTimeCostInBlocks (RarityValueIO calldata costs) external",
                "function setSkillPointsEarnedFromForge (RarityValueIO calldata points) external",
                "function setSmeltingSkillPointReductionFactorBips(uint256 bips) external",
                "function setMaxSupplyPerToken(uint256[] calldata tokenIDs, uint256[] calldata supplyAmts) external"
            ],
            removeSelectors: [],
        },
    ];

    const joined = convertFacetAndSelectorsToString(facets);

    const args: DeployUpgradeTaskArgs = {
        diamondUpgrader: signerAddress,
        diamondAddress: diamond.address,
        facetsAndAddSelectors: joined,
        useLedger: false,
        useMultisig: false,
        freshDeployment: true,
    };

    await run("deployUpgrade", args);
}

if (require.main === module) {
    deployAndUpgradeWearableDiamond()
        .then(() => process.exit(0))
        // .then(() => console.log('upgrade completed') /* process.exit(0) */)
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
