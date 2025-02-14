import { DevnetProvider } from "../../packages/blaze-query/src/devnet.mjs"

const main = async () => {
  const provider = new DevnetProvider("ws://localhost:1338")
  await provider.init()
  const params = await provider.getParameters()
  console.log(JSON.stringify(params, null, 2))
}

main()
