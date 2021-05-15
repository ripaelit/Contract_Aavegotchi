
/* global ethers hre */
/* eslint prefer-const: "off" */

const { LedgerSigner } = require('@ethersproject/hardware-wallets')

const { sendToMultisig } = require('../libraries/multisig/multisig.js')

const { aavegotchiSvgs } = require('../../svgs/aavegotchi-side.js')

const {
  wearablesLeftSvgs,
  wearablesRightSvgs,
  wearablesBackSvgs

} = require('../../svgs/wearables-sides.js')

function getSelectors (contract) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [])
  return selectors
}

function getSelector (func) {
  const abiInterface = new ethers.utils.Interface([func])
  return abiInterface.getSighash(ethers.utils.Fragment.from(func))
}

async function main () {
  const diamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'
  const gasLimit = 9000000
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
  } else if (hre.network.name === 'matic') {
    signer = new LedgerSigner(ethers.provider)
  } else {
    throw Error('Incorrect network selected')
  }

  async function uploadSvgs (svgs, svgType, testing) {
    let svgFacet = (await ethers.getContractAt('SvgFacet', diamondAddress)).connect(signer)
    function setupSvg (...svgData) {
      const svgTypesAndSizes = []
      const svgItems = []
      for (const [svgType, svg] of svgData) {
        svgItems.push(svg.join(''))
        svgTypesAndSizes.push([ethers.utils.formatBytes32String(svgType), svg.map(value => value.length)])
      }
      return [svgItems.join(''), svgTypesAndSizes]
    }

    // eslint-disable-next-line no-unused-vars
    function printSizeInfo (svgTypesAndSizes) {
      console.log('------------- SVG Size Info ---------------')
      let sizes = 0
      for (const [svgType, size] of svgTypesAndSizes) {
        console.log(ethers.utils.parseBytes32String(svgType) + ':' + size)
        for (const nextSize of size) {
          sizes += nextSize
        }
      }
      console.log('Total sizes:' + sizes)
    }

    console.log('Uploading ', svgs.length, ' svgs')
    let svg, svgTypesAndSizes
    console.log('Number of svg:' + svgs.length)
    let svgItemsStart = 0
    let svgItemsEnd = 0
    while (true) {
      let itemsSize = 0
      while (true) {
        if (svgItemsEnd === svgs.length) {
          break
        }
        itemsSize += svgs[svgItemsEnd].length
        if (itemsSize > 24576) {
          break
        }
        svgItemsEnd++
      }
      ;[svg, svgTypesAndSizes] = setupSvg(
        [svgType, svgs.slice(svgItemsStart, svgItemsEnd)]
      )
      console.log(`Uploading ${svgItemsStart} to ${svgItemsEnd} wearable SVGs`)
      printSizeInfo(svgTypesAndSizes)
      if (testing) {
        let tx = await svgFacet.storeSvg(svg, svgTypesAndSizes, { gasLimit: gasLimit })
        let receipt = await tx.wait()
        if (!receipt.status) {
          throw Error(`Error:: ${tx.hash}`)
        }
        console.log(svgItemsEnd, svg.length)
      } else {
        let tx = await svgFacet.populateTransaction.storeSvg(svg, svgTypesAndSizes)
        await sendToMultisig(process.env.DIAMOND_UPGRADER, signer, tx)
      }
      if (svgItemsEnd === svgs.length) {
        break
      }
      svgItemsStart = svgItemsEnd
    }
  }
  console.log(aavegotchiSvgs)

  await uploadSvgs(aavegotchiSvgs.left, 'aavegotchi-left', testing)
  await uploadSvgs(aavegotchiSvgs.right, 'aavegotchi-right', testing)

  const Facet = await ethers.getContractFactory('SvgViewsFacet')
  facet = await Facet.deploy()
  await facet.deployed()
  console.log('Deployed facet:', facet.address)

  // const newFuncs = [
  //   getSelector('function aavegotchiClaimTime(uint256 _tokenId) external view returns (uint256 claimTime_)')
  // ]
  // let existingFuncs = getSelectors(facet)
  // for (const selector of newFuncs) {
  //   if (!existingFuncs.includes(selector)) {
  //     throw Error(`Selector ${selector} not found`)
  //   }
  // }
  // existingFuncs = existingFuncs.filter(selector => !newFuncs.includes(selector))

  const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

  const cut = [
    {
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet)
    }
    // {
    //   facetAddress: facet.address,
    //   action: FacetCutAction.Replace,
    //   functionSelectors: existingFuncs
    // }
  ]
  console.log(cut)

  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress, signer)
  let tx
  let receipt

  if (testing) {
    console.log('Diamond cut')
    tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, '0x', { gasLimit: 8000000 })
    console.log('Diamond cut tx:', tx.hash)
    receipt = await tx.wait()
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`)
    }
    console.log('Completed diamond cut: ', tx.hash)
  } else {
    console.log('Diamond cut')
    tx = await diamondCut.populateTransaction.diamondCut(cut, ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
    await sendToMultisig(process.env.DIAMOND_UPGRADER, signer, tx)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
