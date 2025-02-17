import WebSocket from "ws"

import { Provider } from "../dist/index.js"
import { 
  PlutusLanguageVersion,
  Address,
  AddressType,
  Datum,
  DatumHash,
  HexBlob,
  PlutusData,
  TransactionId,
  TransactionInput,
  TransactionOutput,
  TransactionUnspentOutput,
  Value
 } from "../../blaze-core/dist/index.js"

export class DevnetProvider extends Provider {

  constructor(url) {
    super(42)
    this.url = url
    this.nextId = 0
    this.queue = {}
  }

  async init() {
    return new Promise(resolve => {
      this.sock = new WebSocket(this.url)
      this.sock.onopen = () => {
        console.log("Provider connected")
        resolve()
      }
      this.sock.onerror = err => {
        console.log("Provider error: " + err.message)
      }
      this.sock.onmessage = async msg => {
        const obj = JSON.parse(msg.data)
        if (this.queue[obj.id] !== undefined) {
          if (obj.error !== undefined) {
            console.error("Error: " + obj.error)
            await this.queue[obj.id](obj.error)
          } else {
            await this.queue[obj.id](obj.result)
            delete this.queue[obj.id]
          }
        }
      }
    })
  }

  async query(obj) {
    obj.jsonrpc = "2.0"
    obj.id = this.nextId++
    this.sock.send(JSON.stringify(obj))
    return new Promise(resolve => {
      this.queue[obj.id] = resolve
    })
  }

  buildTransactionUnspentOutput(utxo) {
    const txIn = new TransactionInput(
      TransactionId(utxo.txHash),
      BigInt(utxo.outputIndex)
    )
    // No tx output CBOR available
    // so TransactionOutput must be manually constructed.
    const tokenMap = new Map
    let lovelace = 0n;
    Object.keys(utxo.assets).map(k => {
      const quantity = utxo.assets[k]
      if (k === "lovelace") {
        lovelace = BigInt(quantity)
      } else {
        tokenMap.set(k, BigInt(quantity))

      }
    })
    const txOut = new TransactionOutput(
      Address.fromBech32(utxo.address),
      new Value(lovelace, tokenMap),
    )
    if (utxo.datum !== undefined) {
      const datum = Datum.newInlineData(PlutusData.fromCbor(HexBlob(utxo.datum)))
      txOut.setDatum(datum)
    } else if (utxo.datumHash !== null) {
      const datum = Datum.newDataHash(DatumHash(utxo.datumHash))
      txOut.setDatum(datum)
    }
    if (utxo.scriptRef !== undefined) {
      txOut.setScriptRef()
    }
    return new TransactionUnspentOutput(txIn, txOut)
  }

  async getParameters() {
    console.log("DevnetProvider::getParameters")
    const obj = await this.query({
      method: "queryProtocolParameters"
    })
    console.log(obj)

    const costModels = new Map()
    Object.keys(obj.plutusCostModels).map(cm => {
      console.log("setting: " + cm)
      let key = PlutusLanguageVersion.V1
      if (cm === "plutus:v1") key = PlutusLanguageVersion.V1
      if (cm === "plutus:v2") key = PlutusLanguageVersion.V2
      if (cm === "plutus:v3") key = PlutusLanguageVersion.V3
      costModels.set(key, obj.plutusCostModels[cm])
    })
    const parseRatio = (ratio) => {
      const [numerator, denominator] = ratio.split("/").map(Number)
      return numerator / denominator
    }
    return {
      coinsPerUtxoByte: obj.minUtxoDepositCoefficient,
      maxTxSize: obj.maxTransactionSize.bytes,
      minFeeCoefficient: obj.minFeeCoefficient,
      minFeeConstant: obj.minFeeConstant.ada.lovelace,
      maxBlockBodySize: obj.maxBlockBodySize.bytes,
      maxBlockHeaderSize: obj.maxBlockHeaderSize.bytes,
      stakeKeyDeposit: obj.stakeCredentialDeposit.ada.lovelace,
      poolDeposit: obj.stakePoolDeposit.ada.lovelace,
      poolRetirementEpochBound: obj.stakePoolRetirementEpochBound,
      desiredNumberOfPools: obj.desiredNumberOfStakePools,
      poolInfluence: obj.stakePoolPledgeInfluence,
      monetaryExpansion: obj.monetaryExpansion,
      treasuryExpansion: obj.treasuryExpansion,
      minPoolCost: obj.minStakePoolCost.ada.lovelace,
      protocolVersion: obj.version,
      maxValueSize: obj.maxValueSize.bytes,
      collateralPercentage: obj.collateralPercentage,
      maxCollateralInputs: obj.maxCollateralInputs,
      costModels: costModels,
      prices: {
        memory: parseRatio(obj.scriptExecutionPrices.memory),
        steps: parseRatio(obj.scriptExecutionPrices.cpu),
      },
      maxExecutionUnitsPerTransaction: {
        memory: obj.maxExecutionUnitsPerTransaction.memory,
        steps: obj.maxExecutionUnitsPerTransaction.cpu,
      },
      maxExecutionUnitsPerBlock: {
        memory: obj.maxExecutionUnitsPerBlock.memory,
        steps: obj.maxExecutionUnitsPerBlock.cpu,
      },
    } 
  }

  async getUnspentOutputs(address) {
    console.log("DevnetProvider::getUnspentOutputs: " + address)
    const query = {
      method: "getUtxos",
      params: {
        address: address
      }
    }
    console.log(JSON.stringify(query, null, 2))
    const obj = await this.query(query)
    console.log(JSON.stringify(obj, null, 2))
    const utxos = []
    const ret = obj.map(utxo => {
      return this.buildTransactionUnspentOutput(utxo)
    })
    return ret
  }

  getUnspentOutputsWithAsset(address, unit) {
    console.log("DevnetProvider::getUnspentOutputsWithAsset")
  }

  getUnspentOutputByNFT(unit) {
    console.log("DevnetProvider::getUnspentOutputsByNFT")
  }

  async resolveUnspentOutputs(txIns) {
    console.log("DevnetProvider::resolveUnspentOutputs")
  }

  resolveDatum(datumHash) {
    console.log("DevnetProvider::resolveDatum")
  }

  async awaitTransactionConfirmation(txId, timeout) {
    console.log("DevnetProvider::awaitTransactionConfirmation")
  }

  async postTransactionToChain(tx) {
    console.log("DevnetProvider::postTransactionToChain")
  }

  async evaluateTransaction(tx, additionalUtxos) {
    console.log("DevnetProvider::evaluateTransaction")
  }

}
