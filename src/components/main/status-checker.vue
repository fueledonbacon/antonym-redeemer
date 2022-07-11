<template>
  <div
    v-if="isHome"
    v-bind="$attrs"
    class="status-checker"
  >
    <div class="<md:border-y md:border border-black bg-white">
      <div
        class="status-checker flex items-center text-xs sm:text-sm md:text-md lg:text-lg 2xl:text-xl font-bold px-6 cursor-pointer"
        @click="open = !open"
      >
        Verify Token Status
        <i
          class="text-lg mdi mdi-menu-down ml-auto"
          :class="{
            'mdi-menu-down': !open,
            'mdi-menu-up': open
          }"
        />
      </div>
      <div
        v-if="open"
        class="px-6 py-5"
      >
        <h1 class="md:text-lg lg:text-xl 2xl:text-2xl">
          Redemption Status
        </h1>
        <p class="text-xs md:text-sm 2xl:text-base mt-2">
          Enter an Antonym token ID to<br>
          confirm redemption status in real-time.
        </p>
        <div class="flex items-center mt-8">
          <div
            v-if="form.message"
            class="flex items-center flex-grow bg-lightgrey h-10 text-xs px-4 cursor-pointer"
            @click="clear"
          >
            <i class="mdi mdi-check-circle mr-1" />
            {{ form.message }}
          </div>
          <input
            v-else
            v-model="form.tokenID"
            class="flex-grow bg-lightgrey h-10 text-xs px-4 placeholder-black/50 outline-none"
            placeholder="Enter Token ID (Ex. 1435)"
            type="text"
          >
          <button
            class="toggle-button toggle-button--active rounded-none px-8 py-3"
            @click="check"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const open = ref(false)
const isHome = computed(() => route.name === 'Home')

const form = reactive({
  tokenID: '',
  message: ''
})

const check = async () => {
  const response = await request()
  if (response === true) {
    form.message = 'STATUS: REDEEMED'
  } else {
    form.message = 'STATUS: UNREEDEMED'
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

const clear = () => {
  form.message = ''
  form.tokenID = ''
}
</script>
