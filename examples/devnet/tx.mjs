import { ColdWallet, Core, Blaze } from "../../packages/blaze-sdk/dist/index.js"

import { DevnetProvider } from "../../packages/blaze-query/src/devnet.mjs"

const main = async () => {

  const alice = Core.addressFromBech32(
    // "addr_test1vztan2tydv3k7pxevnx07pz8xvv4nfecg392vnxtqr77elskq0e8a" // lodge
    "addr_test1vz7khlfuasrjqaal8cmcnzf74fcz599jrw45gvkwn99wwfqm9z9h3" // home
  )

  const provider = new DevnetProvider("ws://localhost:1338") 
  await provider.init()

  const faucet = new ColdWallet(Core.addressFromBech32("addr_test1vztc80na8320zymhjekl40yjsnxkcvhu58x59mc2fuwvgkc332vxv"), 0, provider)
  const blaze = await Blaze.from(provider, faucet)
  const tx = await blaze
    .newTransaction()
    .payLovelace(alice, 1n * 1_000_000n)
    .complete();

    console.log(tx.toCbor())

}

main()
