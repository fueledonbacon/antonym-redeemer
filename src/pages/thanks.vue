<template>
  <main class="page flex flex-col">
    <div
      class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-black font-bold mt-auto uppercase"
    >
      Thank you for reserving
    </div>
    <div class="text-base sm:text-[10px] lg:text-[12px] xl:text-[14px] 2xl:text-[16px] text-black mb-auto">
      <p class="my-6">
        This is a reservation order.
      </p>
      <p class="my-6">
        In order to provide you with the most
        competitive shipping rates possible, you will receive an e-mail with
        instructions to complete redemption, requiring you to select your
        shipping option and complete your order.
      </p>
      <p class="my-6">
        Further, the metadata of your NFT will not reflect a change to
        “redeemed” until this shipping transaction is completed.
      </p>
      <p class="my-6">
        In order to finalize your order, the Antonym NFT(s) used at the time of
        pre-order must remain in your wallet until your final transaction.
      </p>
    </div>
  </main>
</template>

<style>
@media (min-width: 768px) {
  .home.page {
    background-size: auto 90%;
  }
}
</style>

<route>
{
  "name": "Thanks"
}
</route>
