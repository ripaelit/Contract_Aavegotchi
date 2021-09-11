
/* global ethers hre */
/* eslint prefer-const: "off" */

const { LedgerSigner } = require('@ethersproject/hardware-wallets')

const { sendToMultisig } = require('../libraries/multisig/multisig.js')

const { aavegotchiSvgs } = require('../../svgs/aavegotchi-side.js')

const { sideViewsLayers } = require('../upgrades/upgrade-sideViewsLayer.js')

const { sideViewsUpdate } = require('../changes/update-sideViewsUpdate.js')

const {
  sideViewDimensions1,
  sideViewDimensions2,
  sideViewDimensions3,
  sideViewDimensions4,
  sideViewDimensions5,
  sideViewDimensions6,
  sideViewDimensions7,
  sideViewDimensions8
} = require('../../svgs/sideViewDimensions.js')

const {
  wearablesLeftSvgs,
  wearablesRightSvgs,
  wearablesBackSvgs,
  wearablesLeftSleeveSvgs,
  wearablesRightSleeveSvgs,
  wearablesBackSleeveSvgs
} = require('../../svgs/wearables-sides.js')

const {
  collateralsLeftSvgs,
  collateralsRightSvgs
} = require('../../svgs/collaterals-sides.js')

const {
  eyeShapesLeftSvgs,
  eyeShapesRightSvgs
} = require('../../svgs/eyeShapes-sides.js')


async function main () {
  console.log("Upload SVG Start");
  const diamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'
  let account1Signer
  let account1Address
  let signer
  let facet
  let owner = await (await ethers.getContractAt('OwnershipFacet', diamondAddress)).owner()
  const testing = ['hardhat', 'localhost'].includes(hre.network.name)
  if (testing) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [owner]
    })
    signer = await ethers.getSigner(owner)
    let dao = await ethers.getContractAt('DAOFacet', diamondAddress, signer)
    ;[account1Signer] = await ethers.getSigners()
    account1Address = await account1Signer.getAddress()
    let tx = await dao.addItemManagers([account1Address])
    let receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Error:: ${tx.hash}`)
    }
    console.log('assigned', account1Address, 'as item manager')
  } else if (hre.network.name === 'matic') {
    signer = new LedgerSigner(ethers.provider)
  } else {
    throw Error('Incorrect network selected')
  }

  async function updateSvgs(svg, svgType, svgId, testing, uploadSigner) {
    const svgFacet = await ethers.getContractAt('SvgFacet', diamondAddress, uploadSigner)
    let svgLength = new TextEncoder().encode(svg[svgId]).length;
    const array = [{ svgType: ethers.utils.formatBytes32String(svgType), ids: [svgId], sizes: [svgLength] }];

    let tx = await svgFacet.updateSvg(svg[svgId], array)
    let receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Error:: ${tx.hash}`)
    }
  }

  let tx
  let receipt
  let itemSigner
  if (testing) {
    itemSigner = account1Signer
  } else {
    itemSigner = signer
  }

  //dimensions
  const svgViewsFacet = await ethers.getContractAt('SvgViewsFacet', diamondAddress, itemSigner)

  //ID's 1 - 79
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions1)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 1')

  //ID's 80 - 118
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions2)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 2')

  //ID's 119 - 140
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions3)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 3')

  //ID's 141 - 161 & 201 - 204
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions4)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 4')

  //ID's 199 - 209
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions5)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 5')

  //ID's 211 - 216
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions6)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 6')

  //ID's 217 - 227
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions7)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 7')

  //ID's 228 - 24
  tx = await svgViewsFacet.setSideViewDimensions(sideViewDimensions8)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Error:: ${tx.hash}`)
  }
  console.log('Uploaded item side dimensions 8')
}


if(require.main === module){
    main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
  }

  exports.sideViewDimensionsUpdate = main;
