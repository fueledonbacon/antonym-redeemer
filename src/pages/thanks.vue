<template>
  <main class="page flex flex-col items-center text-center">
    <div class="max-w-2xl my-auto">
      <div
        class="text-3xl my-12 md:text-4xl lg:text-5xl xl:text-6xl text-black font-medium uppercase"
      >
        Your Reservation is Confirmed
      </div>
      <div
        class="font-light sm:text-[14px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px] text-black text-center flex flex-col items-center"
      >
        <p>
          This is a reservation order.
        </p>
        <p class="mt-6">
          We are working with our fulfillment partners to retrieve the best
          possible shipping rates to customers. To accomplish this, we will be
          working in waves to process and ship orders out.
        </p>
        <div class="grid >xs:grid-rows-3 sm:grid-cols-3 gap-4 my-12 font-bold text-base sm:text-[10px] lg:text-[12px] xl:text-[14px] 2xl:text-[16px] w-full max-w-[34rem]">
          <div>
            <h4>Wave 1</h4>
            <p>July 11-20, 2022</p>
          </div>
          <div>
            <h4>Wave 2</h4>
            <p>July 21-31, 2022</p>
          </div>
          <div>
            <h4>Wave 3</h4>
            <p>ONGOING</p>
          </div>
        </div>
        <p>
          Once your order is queued for fulfillment, you will receive an e-mail
          with instructions to complete redemption, requiring you to select your
          shipping option and submit your order.
        </p>
        <p class="mt-4">
          Redemption is not completed until this final step. Further, the
          metadata of your NFT will not reflect a change to “redeemed” until
          this shipping transaction is completed.
        </p>
        <p class="mt-4">
          In order to finalize your order, the Antonym NFT(s) used at the time
          of reservation must remain in your wallet until your final
          transaction.
        </p>
      </div>
      <div>
        <h5 class="uppercase mt-10">
          Questions? Contact Us
        </h5>
        <p class="text-sm">
          <a href="https://DISCORD.GG/ANTONYMNFT/">DISCORD.GG/ANTONYMNFT</a>
        </p>
      </div>
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
