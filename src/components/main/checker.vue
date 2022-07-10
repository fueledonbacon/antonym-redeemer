<template>
  <div class="relative">
    <div
      class="absolute -top-4 right-0 lg:ml-12 2xl:ml-24 lg:p-3 mr-4 lg:border border-black lg:w-100 2xl:w-130 flex-shrink-0 bg-white">
      <a  @click="form.isHidden=!form.isHidden" class="pointer" >

      <h6 class="font-bold uppercase font-md pointer">
        Verify Token Status
      </h6>
              </a>

      <div class="mt-6"    :class="{ 'hidden': form.isHidden }">
          <h6 class="sm:text-lg font-medium uppercase ">
          Redemption Status
        </h6>
        <p>
          Enter an Antonym token ID to confirm redemption status in real-time.
        </p>
        <div class="w-full p-1">
          <base-input v-model="form.tokenID" title="tokenId" placeholder="Enter Token ID (EX 1234)" />
          <button class="toggle-button toggle-button--active w-full lg:text-base py-2 lg:py-2 rounded-none uppercase"
            @click="check">
            SUBMIT
          </button>

        </div>
        <span class="font-bold uppercase my-4 w-1/2">
          {{ form.message }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

const form = reactive({
  tokenID: '',
  message: '',
  isHidden: true
})
const check = async () => {
  const response = await request()
  if (response === true) {
    form.message = 'STATUS: REDEMED'
  } else {
    form.message = 'STATUS: UNREDEMED'
  }
}
const request = async () => {
  const res = await fetch('/.netlify/functions/token-status', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: JSON.stringify({
      tokenID: form.tokenID
    })
  })

  const { redeemed } = await res.json()
  return redeemed
}
</script>
