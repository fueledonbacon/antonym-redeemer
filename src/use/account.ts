import { computed, markRaw, reactive, ref } from 'vue'
import * as Toast from 'vue-toastification'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from 'ethers'

import wallet from './wallet'
import { CHAINID_CONFIG_MAP, getCurrency } from '@/utils/metamask'
import { smartContract } from '@/consts'
import cart from './cart'
import { useBoard, useEthers, useEthersHooks } from 'vue-dapp'
const { address: activeAccount, isActivated, provider, network, signer } = useEthers()
const { onActivated, onDeactivated, onChanged } = useEthersHooks()

const { open: openDappConnectionBoard } = useBoard()

// const activeAccount = ref('')
const balance = ref('')
const contract = ref(null as ethers.Contract | null)
// const network = ref(null as ethers.providers.Network | null)
// const provider = ref(null as ethers.providers.Web3Provider | null)
const listenersCreated = ref(false)

const hexChainId = computed(() => '0x' + network.value?.chainId.toString(16))
const networkName = computed(() => network.value?.name)
const chainId = computed(() => network.value?.chainId.toString())
const accountCompact = computed(() => activeAccount.value
  ? `${
      activeAccount.value.substring(0, 4)
    }...${
      activeAccount.value.substring(activeAccount.value.length - 4)
    }`
  : 'Connect'
)

const createTransaction = async (
  { address, amount }: { address: string, amount: string }
) => {
  const signer = provider.value?.getSigner()
  return signer?.sendTransaction({
    to: address,
    value: ethers.utils.parseEther(amount)
  })
}

const getAccountNFT = async () => {
  try {
    if (!isActivated) {
      // Wallet undefined
      return
    }

    // Getting NFT of the account
    const accContract = await getContract()
    wallet.balance = +(await accContract?.balanceOf(activeAccount.value)) || 0

    const start = wallet.tokens.length
    if (start === wallet.balance) {
      // already loaded all of them
      return
    }

    const resolvers = [] as Promise<void>[]

    for (let idx = start; idx < wallet.balance; idx++) {
      const id = +(await accContract?.tokenOfOwnerByIndex(activeAccount.value, idx))
      const uri = await accContract?.tokenURI(id)

      resolvers.push(wallet.resolveNFT({ id, uri }))
    }

    await Promise.all(resolvers)
  } catch (err) {
    // TODO: Error handler
  }
}

const getContract = async () => {
  if (contract.value) { return contract.value }

  try {
    await setContract()
    return contract.value
  } catch (err) {}
}

onActivated(async () => {
  await setAccount(activeAccount.value)
  await wallet.getAccountDetails()
  await getAccountNFT()
})

onChanged(async () => {
  disconnect()
  await setAccount(activeAccount.value)
  await wallet.getAccountDetails()
  await getAccountNFT()
})

const disconnect = () => {
  // activeAccount.value = ''
  // balance.value = ''
  cart.clear()
  wallet.clear()
}

onDeactivated(disconnect)

const switchNetwork = async (newChainId: string) => {
  if (
    !newChainId ||
    chainId.value?.toString() === newChainId.toString() ||
    hexChainId.value === newChainId
  ) {
    return
  }

  const config = CHAINID_CONFIG_MAP[newChainId]

  try {
    await provider.value?.send('wallet_switchEthereumChain', [
      { chainId: config.chainId }
    ])

    // await init()

    // Create a minor delay to let the wallet reset to new network
    return new Promise((resolve) => {
      setTimeout(() => resolve(''), 1000)
    })
  } catch (err: any) {
    if (err.code === 4902) {
      await provider.value?.send('wallet_addEthereumChain', [config])
    } else {
      throw err
    }
  }
}

const setContract = async () => {
  if (chainId.value !== smartContract.chainId) {
    await switchNetwork(smartContract.chainId)
  }

  if (!activeAccount.value) {
    // await connect()
    return
  }

  contract.value = new ethers.Contract(
    smartContract.contractAddress,
    smartContract.abi,
    provider.value?.getSigner()
  )
}

const setAccount = async (newAccount: string) => {
  if (newAccount) {
    // Set Account
    activeAccount.value = newAccount
    const accountBalance = await provider.value?.getBalance(newAccount)
    balance.value = `${
      (+ethers.utils.formatEther(accountBalance?.toString() || '')).toFixed(3)
    } ${getCurrency(network.value?.chainId.toString() || '')}`

    await setContract()
  } else {
    disconnect()
  }
}

export default reactive({
  activeAccount,
  provider,

  networkName,
  accountCompact,

  createTransaction
})

export const useAccount = () => {
  const toast = Toast.useToast && Toast.useToast()

  const toggleWallet = async () => {
    try {
      if (!activeAccount.value) {
        openDappConnectionBoard()
      } else {
        await disconnect()
      }
    } catch (err: any) {
      toast.error(err.message || 'Wallet connection failed', {
        position: Toast.POSITION.TOP_RIGHT,
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        icon: true
      })
    }
  }

  return {
    toggleWallet
  }
}
