import {BlockchainHandler, BlockchainHandlerOpts} from "../blockchain-handler";
import {AccountID} from "caip";
import { getConsentMessage, LinkProof} from "../utils";
import { signatureVerify } from '@polkadot/util-crypto'
import * as uint8arrays from 'uint8arrays'

const namespace = 'polkadot'

const stringHex = (str: string): string => `0x${uint8arrays.toString(uint8arrays.fromString(str), 'base16')}`

async function createLink (did: string, account: AccountID, signer: any, opts: BlockchainHandlerOpts): Promise<LinkProof> {
    const { message, timestamp } = getConsentMessage(did, !opts?.skipTimestamp)
    const linkMessageHex = stringHex(message)
    const res = await signer.signRaw({address: account.address, data: linkMessageHex})
    const proof: LinkProof = {
        version: 2,
        type: 'eoa',
        message: linkMessageHex,
        signature: res.signature,
        account: account.toString()
    }
    if (!opts?.skipTimestamp) proof.timestamp = timestamp
    return proof
}

// polkadot sr25519 signatures inlcude randomness, need deterministic function to currently implment authentication
async function authenticate(message: string, account: AccountID, signer: any): Promise<string> {
    throw new Error('authenticate: polkadot authentication not yet supported')
    // const res = await signer.signRaw({address: account.address, data: stringHex(message)})
    // return res.signature
}

async function validateLink (proof: LinkProof): Promise<LinkProof | null> {
    const address = new AccountID(proof.account).address
    const res = await signatureVerify(proof.message, proof.signature, address)
    return res.isValid ? proof : null
}

const Handler: BlockchainHandler = {
    namespace,
    authenticate,
    validateLink,
    createLink
}

export default Handler
