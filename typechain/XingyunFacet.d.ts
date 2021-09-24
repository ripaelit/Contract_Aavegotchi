/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface XingyunFacetInterface extends ethers.utils.Interface {
  functions: {
    "purchaseItemsWithGhst(address,uint256[],uint256[])": FunctionFragment;
    "purchaseTransferItemsWithGhst(address,uint256[],uint256[])": FunctionFragment;
    "xingyun(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "purchaseItemsWithGhst",
    values: [string, BigNumberish[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "purchaseTransferItemsWithGhst",
    values: [string, BigNumberish[], BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "xingyun",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "purchaseItemsWithGhst",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "purchaseTransferItemsWithGhst",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "xingyun", data: BytesLike): Result;

  events: {
    "PurchaseItemsWithGhst(address,address,uint256[],uint256[],uint256)": EventFragment;
    "PurchaseItemsWithVouchers(address,address,uint256[],uint256[])": EventFragment;
    "PurchaseTransferItemsWithGhst(address,address,uint256[],uint256[],uint256)": EventFragment;
    "Xingyun(address,address,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "PurchaseItemsWithGhst"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PurchaseItemsWithVouchers"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "PurchaseTransferItemsWithGhst"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Xingyun"): EventFragment;
}

export type PurchaseItemsWithGhstEvent = TypedEvent<
  [string, string, BigNumber[], BigNumber[], BigNumber] & {
    _buyer: string;
    _to: string;
    _itemIds: BigNumber[];
    _quantities: BigNumber[];
    _totalPrice: BigNumber;
  }
>;

export type PurchaseItemsWithVouchersEvent = TypedEvent<
  [string, string, BigNumber[], BigNumber[]] & {
    _buyer: string;
    _to: string;
    _itemIds: BigNumber[];
    _quantities: BigNumber[];
  }
>;

export type PurchaseTransferItemsWithGhstEvent = TypedEvent<
  [string, string, BigNumber[], BigNumber[], BigNumber] & {
    _buyer: string;
    _to: string;
    _itemIds: BigNumber[];
    _quantities: BigNumber[];
    _totalPrice: BigNumber;
  }
>;

export type XingyunEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber] & {
    _from: string;
    _to: string;
    _tokenId: BigNumber;
    _numAavegotchisToPurchase: BigNumber;
    _totalPrice: BigNumber;
  }
>;

export class XingyunFacet extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: XingyunFacetInterface;

  functions: {
    purchaseItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    purchaseTransferItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    xingyun(
      _to: string,
      _ghst: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  purchaseItemsWithGhst(
    _to: string,
    _itemIds: BigNumberish[],
    _quantities: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  purchaseTransferItemsWithGhst(
    _to: string,
    _itemIds: BigNumberish[],
    _quantities: BigNumberish[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  xingyun(
    _to: string,
    _ghst: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    purchaseItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    purchaseTransferItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    xingyun(
      _to: string,
      _ghst: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "PurchaseItemsWithGhst(address,address,uint256[],uint256[],uint256)"(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[], BigNumber],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
        _totalPrice: BigNumber;
      }
    >;

    PurchaseItemsWithGhst(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[], BigNumber],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
        _totalPrice: BigNumber;
      }
    >;

    "PurchaseItemsWithVouchers(address,address,uint256[],uint256[])"(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[]],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
      }
    >;

    PurchaseItemsWithVouchers(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[]],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
      }
    >;

    "PurchaseTransferItemsWithGhst(address,address,uint256[],uint256[],uint256)"(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[], BigNumber],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
        _totalPrice: BigNumber;
      }
    >;

    PurchaseTransferItemsWithGhst(
      _buyer?: string | null,
      _to?: string | null,
      _itemIds?: null,
      _quantities?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber[], BigNumber[], BigNumber],
      {
        _buyer: string;
        _to: string;
        _itemIds: BigNumber[];
        _quantities: BigNumber[];
        _totalPrice: BigNumber;
      }
    >;

    "Xingyun(address,address,uint256,uint256,uint256)"(
      _from?: string | null,
      _to?: string | null,
      _tokenId?: null,
      _numAavegotchisToPurchase?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber],
      {
        _from: string;
        _to: string;
        _tokenId: BigNumber;
        _numAavegotchisToPurchase: BigNumber;
        _totalPrice: BigNumber;
      }
    >;

    Xingyun(
      _from?: string | null,
      _to?: string | null,
      _tokenId?: null,
      _numAavegotchisToPurchase?: null,
      _totalPrice?: null
    ): TypedEventFilter<
      [string, string, BigNumber, BigNumber, BigNumber],
      {
        _from: string;
        _to: string;
        _tokenId: BigNumber;
        _numAavegotchisToPurchase: BigNumber;
        _totalPrice: BigNumber;
      }
    >;
  };

  estimateGas: {
    purchaseItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    purchaseTransferItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    xingyun(
      _to: string,
      _ghst: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    purchaseItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    purchaseTransferItemsWithGhst(
      _to: string,
      _itemIds: BigNumberish[],
      _quantities: BigNumberish[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    xingyun(
      _to: string,
      _ghst: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
