//updating IDs 69 (farmer pitchfork) 229 (Lasso),

import { ethers, network } from "hardhat";

import {
  wearablesLeftSvgs,
  wearablesRightSvgs,
  wearablesBackSvgs,
} from "../../svgs/wearables-sides";

import { wearablesSvgs } from "../../svgs/wearables";

import {
  sideViewDimensions1,
  sideViewDimensions8,
} from "../../svgs/sideViewDimensions";
import { SvgFacet } from "../../typechain";
import { uploadOrUpdateSvg } from "../svgHelperFunctions";
import { Signer } from "@ethersproject/abstract-signer";
import { gasPrice } from "../helperFunctions";

async function main() {
  const diamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";
  let itemManager = "0xa370f2ADd2A9Fba8759147995d6A0641F8d7C119";
  let signer: Signer;

  const testing = ["hardhat", "localhost"].includes(network.name);

  if (testing) {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [itemManager],
    });
    signer = await ethers.getSigner(itemManager);
  } else if (network.name === "matic") {
    const accounts = await ethers.getSigners();
    signer = accounts[0]; //new LedgerSigner(ethers.provider);

    console.log("signer:", signer);
  } else {
    throw Error("Incorrect network selected");
  }

  console.log("Updating Wearables");
  const itemIds = [69, 229];

  const svgFacet = (await ethers.getContractAt(
    "SvgFacet",
    diamondAddress,
    signer
  )) as SvgFacet;

  for (let index = 0; index < itemIds.length; index++) {
    const itemId = itemIds[index];

    console.log("Updating SVGs for id: ", itemId);

    const left = wearablesLeftSvgs[itemId];
    const right = wearablesRightSvgs[itemId];
    const back = wearablesBackSvgs[itemId];
    const front = wearablesSvgs[itemId];

    try {
      await uploadOrUpdateSvg(left, "wearables-left", itemId, svgFacet, ethers);
      await uploadOrUpdateSvg(
        right,
        "wearables-right",
        itemId,
        svgFacet,
        ethers
      );
      await uploadOrUpdateSvg(back, "wearables-back", itemId, svgFacet, ethers);
      await uploadOrUpdateSvg(front, "wearables", itemId, svgFacet, ethers);
    } catch (error) {
      console.log("error uploading", itemId);
    }
  }

  //dimensions
  const svgViewsFacet = await ethers.getContractAt(
    "SvgViewsFacet",
    diamondAddress,
    signer
  );

  console.log("Update dimensions1");
  let tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions1, {
    gasPrice: gasPrice,
  });
  let receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`);
  }

  console.log("Update dimensions8");
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions8, {
    gasPrice: gasPrice,
  });
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

exports.addR5sideViews = main;
