import legal from './legal.json'
import antonym_abi from './antonym_abi'

export const ItemsPerSizeMap: Record<string, number> = {
  12: 1,
  24: 4,
  60: 20
}
export const BlackItemsPerSizeMap: Record<string, number> = {
  12: 4,
  24: 20
}

export { default as capsules } from './capsules.json'
export { default as intro } from './intro.json'
export { default as countries } from './countries.json'
export const { PrivacyPolicy, TermsOfUse } = legal

const {
  VITE_CONTRACT_ADDRESS = '',
  VITE_CHAIN_ID = '4'
} = import.meta.env

export const smartContract = {
  contractAddress: VITE_CONTRACT_ADDRESS,
  chainId: VITE_CHAIN_ID,
  abi: antonym_abi.abi
}
