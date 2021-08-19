const { expect } = require("chai");
const { ethers } = require("hardhat");
const truffleAsserts = require("truffle-assertions");
const {
  removeXingYun,
} = require("../scripts/upgrades/upgrade-removeXingYun.js");

describe("Testing mintPortal()", async function () {
  this.timeout(300000);

  let aavegotchiDiamondAddress;

  before(async () => {
    aavegotchiDiamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";
  });
  it("should not allow the xingyun function to be called", async () => {
    console.log("removing XingYun");
    await removeXingYun();
    const Xing = await ethers.getContractAt(
      "XingyunFacet",
      aavegotchiDiamondAddress
    );
    //await Xing.xingyun("0xE47d2d47aA7fd150Fe86045e81509B09454a4Ee5", 30000000);
    await truffleAsserts.reverts(
      Xing.xingyun(
        "0xE47d2d47aA7fd150Fe86045e81509B09454a4Ee5",
        30000000,
        "0xf48c74edd9814f2ee0acc45a05089a82c2b6eeba85cd581d2575517a31cfcfec"
      ),
      "Diamond: Function does not exist"
    );
  });

  it("should double confirm that XingYunFacet only has two functions remaining", async () => {
    const Loupe = await ethers.getContractAt(
      "DiamondLoupeFacet",
      aavegotchiDiamondAddress
    );
    functions = await Loupe.facetFunctionSelectors(
      "0x0BfA0cfC88ff56C37e2AfA32af9BeE77f6f970ED"
    );
    const rouge = await Loupe.facetAddress("0xc2bb68d4");
    console.log(functions);
    //console.log(rouge);
    const exists = functions.includes("0xc2bb68d4");
    expect(functions.length).to.equal(2);
    expect(rouge).to.equal(ethers.constants.AddressZero);
    expect(exists).to.equal(false);
  });
});
