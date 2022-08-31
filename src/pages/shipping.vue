<template>
  <main class="page py-16 sm:py-20 md:py-24 xl:py-32">
    <router-link class="inline-flex items-center opacity-40 mr-auto" :to="{ name: 'Catalogue' }">
      <i class="text-2xl mdi mdi-arrow-left-thin mr-2" />
      Keep Browsing
    </router-link>
    <h1 class="page-title">
      Shipping Information
    </h1>
    <div class="max-w-15xl mx-auto">
      <div class="flex flex-col lg:flex-row lg:items-start">
        <div>
          <h3 class="font-bold text-xl uppercase">
            Contact Details
          </h3>
          <div class="mt-6 flex-grow flex flex-wrap items-start -m-1">
            <div class="w-full p-1">
              <base-input :disabled="isDisabled" v-model="form.email" title="e-mail" :invalid="!form.fresh && validation.email" />
            </div>
            <div class="w-full p-1">
              <base-input :disabled="isDisabled" v-model="form.discord" title="Discord ID" />
            </div>

          </div>

          <h3 class="font-bold text-xl uppercase mt-12">
            Shipping Address
          </h3>
          <div class="mt-6 flex-grow flex flex-wrap items-start -m-1">
            <div class="w-full sm:w-1/2 p-1">
              <base-input :disabled="isDisabled" v-model="form.firstName" title="First name" :invalid="!form.fresh && validation.firstName" />
            </div>
            <div class="w-full sm:w-1/2 p-1">
              <base-input  :disabled="isDisabled" v-model="form.lastName" title="Last name" :invalid="!form.fresh && validation.lastName" />
            </div>
            <div class="w-full p-1">
              <div class="text-base uppercase mb-2">
                Address
              </div>
              <input id="autocomplete" v-model="form.address1" placeholder="Find My Address"
                class="w-full bg-lightgrey outline-none px-2 py-3 border border-lightgrey <lg:text-xs"
                :class="{ 'border-error': !form.fresh && validation.address1 }" type="text">
              <div class="text-xs text-error py-1">
                <span v-if="!form.fresh && validation.address1">
                  {{ 'error' }}
                </span>
                &nbsp;
              </div>
              <!-- <base-input
                v-model="form.address1"
                ref="autocomplete"
                title="Address Line 1"
                :invalid="!form.fresh && validation.address1"
              /> -->
            </div>

            <div class="w-full p-1">

              <base-input :disabled="isDisabled" v-model="form.address2" title="ADDRESS LINE 2 (UNIT / APT NUMBER)" />
            </div>
            <div class="w-full sm:w-1/2 xl:w-1/3 p-1">
              <base-input disabled v-model="form.city" title="City" :invalid="!form.fresh && validation.city" />
            </div>
            <div class="w-full sm:w-1/2 xl:w-1/3 p-1">
              <base-input disabled v-model="form.state" title="Province/State"
                :invalid="!form.fresh && validation.state" />
            </div>
            <div class="w-full sm:w-1/2 xl:w-1/3 p-1">
              <base-input disabled v-model="form.zip" title="Zip/Postal Code"
                :invalid="!form.fresh && validation.zip" />
            </div>
            <div class="w-full p-1">
              <base-input v-model="form.country" title="Country/Region" :invalid="!form.fresh && validation.country"
                :options="zones" />
            </div>
          </div>

        </div>
        <div v-if="!order.order.id"
          class=" lg:ml-12 2xl:ml-24 lg:p-5 mt-10 md:mt-16 lg:mt-22 lg:border border-black lg:w-100 2xl:w-130 flex-shrink-0">
          <h6 class="font-bold uppercase">
            CONFIRM DETAILS
          </h6>
          <p class="text-sm mt-4">
            Please ensure that your shipping details are correct. If you encounter any issues, please
            refer to our <a class="text-blue-800 underline" href="https://www.antonymnft.com/redemption-faq">shipping FAQ.</a>
          </p>

          <label class="h-6 flex items-center mt-24 lg:mt-10" for="agree">
            <input id="agree" v-model="form.agree" class="checkbox" type="checkbox">
            <span class="ml-2 text-xs">
              I have read and understood the above
            </span>
          </label>
          <hr class="mt-4 mb-8">
          <button class="toggle-button toggle-button--active w-full lg:text-base py-5 lg:py-6 rounded-none uppercase"
            :class="{ 'cursor-not-allowed': !form.agree }" :disabled="!form.agree" @click="confirm">
            Submit Pre-Order
          </button>
        </div>

        <div v-else class="flex flex-col">
          <div
            class=" lg:ml-12 2xl:ml-24 lg:p-5 mt-10 md:mt-16 lg:mt-22 lg:border border-black lg:w-100 2xl:w-130 flex-shrink-0">
            <h6 class="font-bold uppercase">
              CONFIRM ORDER
            </h6>
            <p class="text-justify inline-block  w-full mt-24 lg:mt-10">
              Please select one of the available shipping options. <br> <br>
              Shipping prices are shown in USD and will be collected in ETH. Please have sufficient ETH in your wallet to complete the transaction.
              Discounted shipping rates for bulk orders may be available on a case-by-case basis. For details, please refer to our <a class="text-blue-800" href="https://www.antonymnft.com/redemption-faq">shipping FAQ.</a>
            </p>
            <label class="h-6 flex items-center mt-24 lg:mt-10" for="agree">
              <input id="agree" v-model="form.agree" class="checkbox" type="checkbox">
              <span class="ml-2 text-xs">
                I have read and understood the above
              </span>
            </label>
          </div>

          <div class=" lg:ml-12 2xl:ml-24 lg:p-5 lg:border border-black lg:w-100 2xl:w-130 flex-shrink-0">
            <h6 class="font-bold uppercase">
              Configure Shipping
            </h6>
            <hr class="mb-2 mt-24 lg:mt-20">
            <label class="h-6 flex items-center " for="shipping_option">
              <input id="shipping_option" v-model="shippingOption.provider" value="air" class="checkbox" type="radio"
                name="option">
              <p class="flex flex-row justify-between items-center w-full">
                <span class="ml-2 text-xs">
                  Express Shipping
                </span>
                <span>
                  ${{ order.order.price.air }}
                </span>
              </p>
            </label>
            <hr class="mt-2 mb-2">
            <label class="h-6 flex items-center" for="shipping_option_ground">
              <input id="shipping_option_ground" v-model="shippingOption.provider" value="bundled" class="checkbox"
                type="radio" name="option">

              <p class="flex flex-row justify-between items-center w-full">
                <span class="ml-2 text-xs">
                  Standard Shipping
                </span>
                <span>
                  ${{ order.order.price.bundled }}
                </span>
              </p>
            </label>
            <hr class="mt-2 mb-8">
          </div>

          <div class=" lg:ml-12 2xl:ml-24 lg:p-5  lg:border border-black lg:w-100 2xl:w-130 flex-shrink-0">
            <h6 class="font-bold uppercase">
              ORDER SUMMARY
            </h6>
            <div class="mb-2 mt-24 lg:mt-20 flex flex-col">
              <div class="grid grid-cols-3">
                <span class="col-span-2">Subtotal</span>
                <span class="text-right">$0</span>
              </div>

              <div class="grid grid-cols-3">
                <span class="col-span-2">Shipping and Handling</span>
                <span class="text-right">${{ order.order.price[shippingOption.provider] || 0 }}</span>
              </div>

              <div class="grid grid-cols-3 mt-10">
                <span class="col-span-2">Total</span>
                <span class="text-right">${{ order.order.price[shippingOption.provider] || 0 }} </span>
              </div>
            </div>

            <button class="toggle-button toggle-button--active w-full lg:text-base py-5 lg:py-6 rounded-none uppercase"
              :class="{ 'cursor-not-allowed': !shippingOption.provider }" :disabled="!shippingOption.provider"
              @click="completeOrder">
              CONFIRM TRANSACTION
            </button>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, nextTick, onMounted, ref } from 'vue'
import * as Toast from 'vue-toastification'
import { JsonRpcSigner } from '@ethersproject/providers'

import { isValidEmail } from '@/utils/validators'
import { countries, smartContract } from '@/consts'
import cart from '@/use/cart'
import order from '@/use/order'
import account from '@/use/account'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = Toast.useToast && Toast.useToast()

const zones = countries.map(({ name, code }) => ({
  label: name,
  value: code
}))

const form = reactive({
  fresh: true,
  email: '',
  discord: '',
  country: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  agree: false
})

const shippingOption = reactive({
  provider: '',
  price: 0
})
const validation = computed(() => ({
  email:
    !(form.email && isValidEmail(form.email)) && 'Please enter a valid email',
  country: !form.country && 'Please enter a valid country code',
  firstName: !form.firstName && 'Please enter a valid first name',
  lastName: !form.lastName && 'Please enter a valid last name',
  address1: !form.address1 && 'Please enter a valid address',
  city: !form.city && 'Please enter a valid city name',
  state: !form.state && 'Please enter a valid state/province name',
  zip: !form.zip && 'Please enter a valid zip code'
}))

const isValidForm = computed(
  () => !Object.values(validation.value).find((invalid) => !!invalid)
)

const isDisabled = computed(() => order.order.id)

const createOrder = async () => {
  const signer = (await account.provider?.getSigner()) as JsonRpcSigner
  const message = `I'm signing to redeem this Antonym toy  at ${new Date()}`
  const signature = await signer.signMessage(message)

  const res = await fetch('/.netlify/functions/redeem-shopify-merch', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: JSON.stringify({
      ethAddress: account.activeAccount,
      signature,
      message,
      name: [form.firstName, form.lastName].join(' '),
      email: form.email,
      discordId: form.discord,
      address: {
        // phone: '', TODO: clarify this
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        province: form.state,
        zip: form.zip,
        country: form.country
      },
      items: [...cart.items]
    })
  })
  if (res.status !== 200) {
    throw new Error('Could not create draft order')
  }

  return res.json()
}

const getEthPrice = async () => {
  return await fetch(
    'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
    { method: 'GET' }
  ).then((response) => response.json())
}

// TODO: Move this to order completion page
const completeOrder = async () => {
  try {
    const shippingFee = order.order.price[shippingOption.provider]
    const ethPrice = await getEthPrice()
    const txdata = {
      address: smartContract.paymentAddress,
      amount: (shippingFee / ethPrice.USD).toString()
    }
    const txHash = await account.createTransaction(txdata)
    const orderCompletion = await fetch('/.netlify/functions/complete-order', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: JSON.stringify({
        id: order.order.id,
        address: account.activeAccount,
        txhash: txHash,
        shippingDetails: {
          price: shippingFee,
          country: form.country,
          provider: shippingOption.provider
        }
      })
    })
    if (orderCompletion.status !== 200) {
      throw new Error('Could not create draft order')
    }
    setTimeout(() => router.push({ name: 'Thanks' }), 1000)// redirect to thanks
  } catch (e) {
    throw new Error('Order could not be completed')
  }
}

const confirm = async () => {
  form.fresh = false
  if (!isValidForm.value) {
    return
  }

  try {
    await account.provider?.getSigner()
    const orderDetails = await createOrder()

    const orderInfo = {
      id: orderDetails.orderID,
      price: orderDetails.shipping,
      status: 'unpaid'
    }
    order.order = orderInfo
    cart.clear()
    // setTimeout(() => router.push({ name: 'Thanks' }), 1000)// redirect to thanks
    await account.getAccountNFT(true)
  } catch (err: any) {
    toast.error(err.message || 'Something went wrong. Try again.', {
      position: Toast.POSITION.TOP_RIGHT,
      timeout: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      icon: true
    })
  }
}

onMounted(() => {
  // eslint-disable-next-line
  let autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('autocomplete')
  )
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    form.address1 = place.formatted_address
    // eslint-disable-next-line
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0]
      switch (componentType) {
        case 'postal_code': {
          form.zip = component.long_name
          break
        }
        case 'locality':
          form.city = component.long_name
          break
        case 'administrative_area_level_1': {
          form.state = component.long_name
          break
        }
        case 'country':
          form.country = component.short_name
          break
      }
    }
  })
})
</script>
<route>
{
  "name": "Shipping"
}
</route>
