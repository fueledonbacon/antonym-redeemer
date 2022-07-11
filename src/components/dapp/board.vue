<template>
  <vd-board
    :connectors="connectors"
    dark
  />
</template>

<script setup lang="ts">
import { MetaMaskConnector, CoinbaseWalletConnector } from 'vue-dapp'

const infuraId = '294756524c724e35ae8e7cb59f4eca94'

const connectors = [
  new MetaMaskConnector({
    appUrl: window.location.host
  }),

  new CoinbaseWalletConnector({
    appName: 'Vue Dapp',
    jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraId}`
  })
]
</script>
