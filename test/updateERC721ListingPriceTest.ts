/* global describe it before ethers network */
/* eslint prefer-const: "off" */

//@ts-ignore
import { ethers, network } from "hardhat";
import { upgrade } from "../scripts/upgrades/upgrade-updateERC721ListingPrice";
import { ERC721MarketplaceFacet, IERC20 } from "../typechain";
import {
  aavegotchiDiamondAddressMatic,
  ghstAddress,
} from "../helpers/constants";
import { expect } from "chai";
import { impersonate } from "../scripts/helperFunctions";

let ghst: IERC20;

describe("Testing update ERC721 listing price", async function () {
  this.timeout(300000);

  const diamondAddress = aavegotchiDiamondAddressMatic;
  const erc721ListingId = 251720;
  const newListingPrice = "1";
  let erc721MarketplaceFacet: ERC721MarketplaceFacet;
  const ghstHolderAddress = "0x3721546e51258065bfdb9746b2e442C7671B0298"; // Should be GHST holder
  let erc721MarketWithBuyer: ERC721MarketplaceFacet;
  let snapshot: any;

  before(async function () {
    await upgrade();

    erc721MarketplaceFacet = (await ethers.getContractAt(
      "ERC721MarketplaceFacet",
      diamondAddress
    )) as ERC721MarketplaceFacet;

    // get seller of listing
    const listing = await erc721MarketplaceFacet.getERC721Listing(
      erc721ListingId
    );
    const sellerAddress = listing.seller;

    erc721MarketplaceFacet = await impersonate(
      sellerAddress,
      erc721MarketplaceFacet,
      ethers,
      network
    );
    erc721MarketWithBuyer = await impersonate(
      ghstHolderAddress,
      erc721MarketplaceFacet,
      ethers,
      network
    );

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ghstHolderAddress],
    });
    const ghstHolder = await ethers.getSigner(ghstHolderAddress);
    ghst = (await ethers.getContractAt(
      "contracts/shared/interfaces/IERC20.sol:IERC20",
      ghstAddress,
      ghstHolder
    )) as IERC20;
    await ghst.approve(diamondAddress, ethers.utils.parseEther("100000000"));

    snapshot = await ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async function () {
    // rollback
    await ethers.provider.send("evm_revert", [snapshot]);
    snapshot = await ethers.provider.send("evm_snapshot", []);
  });

  describe("updateERC721ListingPrice", async function () {
    it("Should revert if invalid erc721 listing id", async function () {
      await expect(
        erc721MarketplaceFacet.updateERC721ListingPrice(
          erc721ListingId + 100000,
          ethers.utils.parseEther(newListingPrice)
        )
      ).to.be.revertedWith("ERC721Marketplace: listing not found");
    });
    it("Should revert if erc721 listing already sold", async function () {
      await (
        await erc721MarketWithBuyer.executeERC721Listing(erc721ListingId)
      ).wait();
      await expect(
        erc721MarketplaceFacet.updateERC721ListingPrice(
          erc721ListingId,
          ethers.utils.parseEther(newListingPrice)
        )
      ).to.be.revertedWith("ERC721Marketplace: listing already sold");
    });
    it("Should revert if erc721 listing already canceled", async function () {
      await (
        await erc721MarketplaceFacet.cancelERC721Listing(erc721ListingId)
      ).wait();
      await expect(
        erc721MarketplaceFacet.updateERC721ListingPrice(
          erc721ListingId,
          ethers.utils.parseEther(newListingPrice)
        )
      ).to.be.revertedWith("ERC721Marketplace: listing already cancelled");
    });
    it("Should revert if invalid price", async function () {
      await expect(
        erc721MarketplaceFacet.updateERC721ListingPrice(
          erc721ListingId,
          ethers.utils.parseEther("0.5")
        )
      ).to.be.revertedWith(
        "ERC721Marketplace: price should be 1 GHST or larger"
      );
    });
    it("Should revert if not seller of ERC721 listing", async function () {
      await expect(
        erc721MarketWithBuyer.updateERC721ListingPrice(
          erc721ListingId,
          ethers.utils.parseEther(newListingPrice)
        )
      ).to.be.revertedWith("ERC721Marketplace: Not seller of ERC721 listing");
    });
    it("Should success if all parameters are valid", async function () {
      const receipt = await (
        await erc721MarketplaceFacet.updateERC721ListingPrice(
          erc721ListingId,
          ethers.utils.parseEther(newListingPrice)
        )
      ).wait();
      const event = receipt!.events!.find(
        (event) => event.event === "ERC721ListingPriceUpdate"
      );
      expect(event!.args!.listingId).to.equal(erc721ListingId);
      expect(event!.args!.priceInWei).to.equal(
        ethers.utils.parseEther(newListingPrice)
      );
      const listing = await erc721MarketplaceFacet.getERC721Listing(
        erc721ListingId
      );
      expect(listing.listingId).to.equal(erc721ListingId);
      expect(listing.priceInWei).to.equal(
        ethers.utils.parseEther(newListingPrice)
      );
    });
  });

  describe("batchUpdateERC721ListingPrice", async function () {
    it("Should revert if array length not matched", async function () {
      await expect(
        erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [
            ethers.utils.parseEther(newListingPrice),
            ethers.utils.parseEther(newListingPrice),
          ]
        )
      ).to.be.revertedWith(
        "ERC721Marketplace: listing ids not same length as prices"
      );
    });
    it("Should revert if invalid erc721 listing id", async function () {
      await expect(
        erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId + 100000],
          [ethers.utils.parseEther(newListingPrice)]
        )
      ).to.be.revertedWith("ERC721Marketplace: listing not found");
    });
    it("Should revert if erc721 listing already sold", async function () {
      await (
        await erc721MarketWithBuyer.executeERC721Listing(erc721ListingId)
      ).wait();
      await expect(
        erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [ethers.utils.parseEther(newListingPrice)]
        )
      ).to.be.revertedWith("ERC721Marketplace: listing already sold");
    });
    it("Should revert if erc721 listing already canceled", async function () {
      await (
        await erc721MarketplaceFacet.cancelERC721Listing(erc721ListingId)
      ).wait();
      await expect(
        erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [ethers.utils.parseEther(newListingPrice)]
        )
      ).to.be.revertedWith("ERC721Marketplace: listing already cancelled");
    });
    it("Should revert if invalid price", async function () {
      await expect(
        erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [ethers.utils.parseEther("0.5")]
        )
      ).to.be.revertedWith(
        "ERC721Marketplace: price should be 1 GHST or larger"
      );
    });
    it("Should revert if not seller of ERC721 listing", async function () {
      await expect(
        erc721MarketWithBuyer.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [ethers.utils.parseEther(newListingPrice)]
        )
      ).to.be.revertedWith("ERC721Marketplace: Not seller of ERC721 listing");
    });
    it("Should success if all parameters are valid", async function () {
      const receipt = await (
        await erc721MarketplaceFacet.batchUpdateERC721ListingPrice(
          [erc721ListingId],
          [ethers.utils.parseEther(newListingPrice)]
        )
      ).wait();
      const events = receipt!.events!.filter(
        (event) => event.event === "ERC721ListingPriceUpdate"
      );
      expect(events.length).to.equal(1);
      const event = events[0];
      expect(event!.args!.listingId).to.equal(erc721ListingId);
      expect(event!.args!.priceInWei).to.equal(
        ethers.utils.parseEther(newListingPrice)
      );
      const listing = await erc721MarketplaceFacet.getERC721Listing(
        erc721ListingId
      );
      expect(listing.listingId).to.equal(erc721ListingId);
      expect(listing.priceInWei).to.equal(
        ethers.utils.parseEther(newListingPrice)
      );
    });
  });
});
