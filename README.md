# Aavegotchi Diamonds

## Contract Addresses

Kovan:

- Aavegotchi diamond: 0xD29D0acdf1E33E2f011b34D29E2176B7aA2241Fd
- GHST diamond: 0x5E083148DF00401cdA6D129E7688FA6c7D3B51fD

The ABI files for the diamonds are in the artifacts directory:

1. IAavegotchiDiamond.json
1. IGHSTDiamond.json

To easily see what functions these ABI files provide check the corresponding files in the contracts/interfaces directory:

1. IAavegotchiDiamond.sol
1. IGHSTDiamond.sol

Using a diamond ABI should look something like this:

```javascript
let aavegotchiDiamond = new web3.eth.Contract(
  JSON.parse(jsonfromfile).abi,
  aavegotchiDiamondAddress
);
```

## Deployment

```console
npx buidler run scripts/deploy.js
```
