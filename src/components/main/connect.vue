<template>
  <button
    v-if="isHome"
    class="button-connect"
    @click="open"
  >
    {{  isActivated ? shortenAddress(address) : 'Connect' }}
  </button>
  <template v-else>
    <button
      class="button-connect--small"
      @click="open"
    >
      {{ address ? shortenAddress(address) : 'Connect' }}
    </button>
    <router-link
      class="order-count ml-8"
      :to="{ name: 'Cart' }"
    >
      {{ cart.items.length }}
    </router-link>
  </template>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import cart from '@/use/cart'
import account, { useAccount } from '@/use/account'

import { useBoard, useEthers, useWallet, displayEther, shortenAddress } from 'vue-dapp'

const { open } = useBoard()
const { address, balance, isActivated } = useEthers()

const route = useRoute()

const isHome = computed(() => route.name === 'Home')
</script>
