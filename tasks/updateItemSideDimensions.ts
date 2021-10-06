import { task } from "hardhat/config";
import { Signer } from "@ethersproject/abstract-signer";
import {
  getDiamondSigner,
  itemManager,
  maticDiamondAddress,
} from "../scripts/helperFunctions";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { SvgViewsFacet } from "../typechain";
import { Dimensions, SideDimensions } from "../scripts/itemTypeHelpers";
import {
  convertDimensionsArrayToString,
  convertStringToDimensionsArray,
} from "./updateItemDimensions";

export interface UpdateItemSideDimensionsTaskArgs {
  itemIds: string;
  sides: string;
  dimensions: string;
}

export function convertSideDimensionsToTaskFormat(
  dimensions: SideDimensions[]
) {
  const items: SideDimensions[] = [];
  for (let index = 0; index < dimensions.length; index++) {
    items.push(dimensions[index]);
  }
  const sideDimensionsTaskArgs: UpdateItemSideDimensionsTaskArgs = {
    itemIds: items.map((item: SideDimensions) => item.itemId).join(),
    sides: items.map((item: SideDimensions) => item.side).join(),
    dimensions: convertDimensionsArrayToString(
      items.map((item) => item.dimensions)
    ),
  };
  return sideDimensionsTaskArgs;
}

export function convertStringToSideDimensionsArray(
  itemIds: string,
  sides: string,
  dimensions: string
): SideDimensions[] {
  const output: SideDimensions[] = [];
  const itemIdsOutput = itemIds.split(",");
  const sidesOutput = sides.split(",");
  const sideDimensions: Dimensions[] =
    convertStringToDimensionsArray(dimensions);

  console.log("side dimensions:", sideDimensions);

  itemIdsOutput.forEach((_, index) => {
    output.push({
      itemId: itemIdsOutput[index],
      side: sidesOutput[index],
      dimensions: sideDimensions[index],
    });
  });

  return output;
}

task(
  "updateItemSideDimensions",
  "Updates item side dimensions, given svgIds, sides, and dimensions"
)
  .addParam("itemIds", "Item IDs to update dimensions")
  .addParam("sides", "Item side to be updated dimensions")
  .addParam("dimensions", "New dimensions of each item")

  .setAction(
    async (
      taskArgs: UpdateItemSideDimensionsTaskArgs,
      hre: HardhatRuntimeEnvironment
    ) => {
      const sideDimensions: SideDimensions[] =
        convertStringToSideDimensionsArray(
          taskArgs.itemIds,
          taskArgs.sides,
          taskArgs.dimensions
        );

      console.log("side dimensions:", sideDimensions);

      const signer: Signer = await getDiamondSigner(hre, itemManager, false);
      const svgViewsFacet = (await hre.ethers.getContractAt(
        "SvgViewsFacet",
        maticDiamondAddress,
        signer
      )) as SvgViewsFacet;

      let tx = await svgViewsFacet.setSideViewDimensions(sideDimensions);
      console.log("tx hash:", tx.hash);
      let receipt = await tx.wait();
      console.log("New Dimensions set!");
      if (!receipt.status) {
        throw Error(`Error with transaction: ${tx.hash}`);
      }
    }
  );
