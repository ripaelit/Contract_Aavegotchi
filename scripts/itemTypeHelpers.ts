import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from "hardhat";

type Category = 0 | 1 | 2 | 3;

interface Dimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ItemType {
  name: string;
  description: string;
  svgId: number;
  minLevel: number;
  canbeTransferred: boolean;
  totalQuantity: number;
  maxQuantity: number;
  setId: number[];
  author: string;
  dimensions: Dimensions | string | number;
  allowedCollaterals: number[];
  ghstPrice: number | BigNumber;
  traitModifiers: number[];
  slotPositions: Slot | boolean[];
  category: Category;
  experienceBonus: number;
  kinshipBonus: number;
  rarityScoreModifier?: number;
}

type Slot =
  | "none"
  | "body"
  | "face"
  | "eyes"
  | "head"
  | "hands"
  | "handLeft"
  | "handRight"
  | "pet"
  | "background";

export function stringToSlotPositions(str: Slot | boolean[]) {
  if (str.length === 0)
    return [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 0 Body
  else if (str === "body")
    return [
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 1 Face
  else if (str === "face")
    return [
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 2 Eyes
  else if (str === "eyes")
    return [
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 3 Head
  else if (str === "head")
    return [
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 4/5 Either hand
  else if (str === "hands")
    return [
      false,
      false,
      false,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 4 Left hand
  else if (str === "handLeft")
    return [
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 5 Right Hand
  else if (str === "handRight")
    return [
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 6 Pet
  else if (str === "pet")
    return [
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  // Slot 7 Background
  else if (str === "background")
    return [
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  else if (str === "none")
    return [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];
  else {
    throw Error("Wrong slot string: " + str);
  }
}

export function calculateRarityScoreModifier(maxQuantity: number) {
  if (maxQuantity >= 1000) return 1;
  if (maxQuantity >= 500) return 2;
  if (maxQuantity >= 250) return 5;
  if (maxQuantity >= 100) return 10;
  if (maxQuantity >= 10) return 20;
  if (maxQuantity >= 1) return 50;
  return 0;
}

export function getItemTypes(itemTypes: ItemType[]) {
  const result = [];
  for (const itemType of itemTypes) {
    itemType.ghstPrice = ethers.utils.parseEther(itemType.ghstPrice.toString());
    itemType.slotPositions = stringToSlotPositions(itemType.slotPositions);
    if (itemType.dimensions === "" || itemType.dimensions === 0) {
      itemType.dimensions = { x: 0, y: 0, width: 0, height: 0 };
    }
    itemType.rarityScoreModifier = calculateRarityScoreModifier(
      itemType.maxQuantity
    );
    if (!Array.isArray(itemType.allowedCollaterals)) {
      throw Error("Is not array.");
    }
    result.push(itemType);
  }
  return result;
}
