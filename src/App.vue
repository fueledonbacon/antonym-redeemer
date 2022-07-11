<script setup lang="ts">
import { MetaMaskConnector, WalletConnectConnector, CoinbaseWalletConnector } from 'vue-dapp'

const infuraId = '294756524c724e35ae8e7cb59f4eca94'

const connectors = [
  new MetaMaskConnector({
    appUrl: window.location.host
  }),
  // new WalletConnectConnector({
  //   qrcode: true,
  //   rpc: {
  //     1: `https://mainnet.infura.io/v3/${infuraId}`,
  //     4: `https://rinkeby.infura.io/v3/${infuraId}`
  //   }
  // }),
  new CoinbaseWalletConnector({
    appName: 'Vue Dapp',
    jsonRpcUrl: `https://mainnet.infura.io/v3/${infuraId}`
  })
]
</script>
<template>
  <router-view />
  <vd-board :connectors="connectors" dark />
</template>

<style>
html{
  overflow: hidden auto;
  scroll-behavior: smooth;
}
.html--use-modal {
  overflow-y: hidden;
}

body {
  color: #232323;
  font-weight: 500;
  font-family: 'Helvetica Now Display';
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
