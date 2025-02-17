import { Core } from "../../packages/blaze-sdk/dist/index.js"

import { DevnetProvider } from "../../packages/blaze-query/src/devnet.mjs"

const main = async () => {
  const provider = new DevnetProvider("ws://localhost:1338")
  await provider.init()
  //const params = await provider.getParameters()
  //console.log(JSON.stringify(params, null, 2))
  //await provider.getUnspentOutputs(Core.addressFromBech32("addr_test1vztc80na8320zymhjekl40yjsnxkcvhu58x59mc2fuwvgkc332vxv"))
  await provider.getUnspentOutputs(Core.addressFromBech32("addr_test1wqpektzktcku8pydy5x6kq433vr8pl0hcjey0rdwrquvvnsz5qjt0"))
}

main()
