import {
  ProtocolParameters
} from "../../blaze-core/src"
import {
  TransactionUnspentOutput
} from "../../blaze-core/src"
import { Provider } from "./provider"

export class DevnetProvider extends Provider {

  constructor(url) {
    super(42)
    this.url = url
    this.nextId = 0
    this.queue = {}
  }

  async init() {
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
  }

  async query(obj) {
    obj.jsonrpc = "2.0"
    obj.id = this.nextId++
    this.sock.send(JSON.stringify(obj))
    return new Promise(resolve => {
      this.queue[obj.id] = resolve
    })
  }

  async getParameters() {
    const obj = await this.query({
      method: "queryProtocolParameters"
    })
    console.log(obj)
    return {
      coinsPerUtxoByte: params.min_utxo_deposit_coefficient,
      maxTxSize: params.max_transaction_size.bytes,
      minFeeCoefficient: params.min_fee_coefficient,
      minFeeConstant: params.min_fee_constant.ada.lovelace,
      maxBlockBodySize: params.max_block_body_size.bytes,
      maxBlockHeaderSize: params.max_block_header_size.bytes,
      stakeKeyDeposit: params.stake_credential_deposit.ada.lovelace,
      poolDeposit: params.stake_pool_deposit.ada.lovelace,
      poolRetirementEpochBound: params.stake_pool_retirement_epoch_bound,
      desiredNumberOfPools: params.desired_number_of_stake_pools,
      poolInfluence: params.stake_pool_pledge_influence,
      monetaryExpansion: params.monetary_expansion,
      treasuryExpansion: params.treasury_expansion,
      minPoolCost: params.min_stake_pool_cost.ada.lovelace,
      protocolVersion: params.version,
      maxValueSize: params.max_value_size.bytes,
      collateralPercentage: params.collateral_percentage,
      maxCollateralInputs: params.max_collateral_inputs,
      costModels: costModels,
      prices: {
        memory: parseRatio(params.script_execution_prices.memory),
        steps: parseRatio(params.script_execution_prices.cpu),
      },
      maxExecutionUnitsPerTransaction: {
        memory: params.max_execution_units_per_transaction.memory,
        steps: params.max_execution_units_per_transaction.cpu,
      },
      maxExecutionUnitsPerBlock: {
        memory: params.max_execution_units_per_block.memory,
        steps: params.max_execution_units_per_block.cpu,
      },
    } as ProtocolParameters;
  }

  getUnspentOutputs(
    address: Address | Credential
  ): Promise<TransactionUnspentOutput[]> {

  }

  getUnspentOutputsWithAsset(
    address: AutoFillAddressKind,
    unit: AssetId
  ): Promise<TransactionUnspentOutput[]> {

  }

  getUnspentOutputByNFT(unit: AssetId) : Promise<TransactionUnspentOutput> {

  }

  async resolveUnspentOutputs(
    txIns: TransactionInput[]
  ): Promise<TransactionUnspentOutput[]> {

  }

  resolveDatum(datumHash): Promise<PlutusData> {

  }

  async awaitTransactionConfirmation(
    txId: TransactionId, 
    timeout?: number
  ): Promise<boolean> {
    
  }

  async postTransactionToChain(
    tx: Transaction
  ): Promise<TransactionId> {
    
  }

  async evaluateTransaction(
    tx: Transaction,
    additionalUtxos: TransactionUnspentOutput[]
  ): Promise<Redeemers> {

  }

}