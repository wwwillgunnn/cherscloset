<script setup lang="ts">
// TODO: Use supabase
const tops = [
  { src: "/images/tops/yellowjacket.png", alt: "Yellow jacket" },
  { src: "/images/tops/top1.png", alt: "Black top" },
  { src: "/images/tops/top2.png", alt: "Pink top" },
  { src: "/images/tops/top3.png", alt: "White top" },
];

const bottoms = [
  { src: "/images/bottoms/yellowskirt.png", alt: "Yellow skirt" },
  { src: "/images/bottoms/bottom1.png", alt: "Blue jeans" },
  { src: "/images/bottoms/bottom2.png", alt: "Black skirt" },
  { src: "/images/bottoms/bottom3.png", alt: "Brown pants" },
];

const topIndex = ref(0);
const bottomIndex = ref(0);
const showingOutfit = ref(false);

const currentTop = computed(() => tops[topIndex.value]);
const currentBottom = computed(() => bottoms[bottomIndex.value]);

let buttonClickSound: HTMLAudioElement | null;

onMounted(() => {
  buttonClickSound = new Audio("/audio/mouse-click.mp3");
});

const playSound = () => {
  if (!buttonClickSound) return;

  buttonClickSound.currentTime = 0; // allows spam clicking
  buttonClickSound.play().catch((err) => {
    console.log("Audio play blocked:", err);
  });
};

// TODO: onclick scroll through random clothes (like case opening)
const browseItem = () => {
  playSound();
  topIndex.value =
    (topIndex.value + Math.floor(Math.random() * tops.length)) % tops.length;
  bottomIndex.value =
    (bottomIndex.value + Math.floor(Math.random() * bottoms.length)) %
    bottoms.length;
};

const nextItem = (index: number, items: any[]) => {
  playSound();
  return (index + 1) % items.length;
};

const prevItem = (index: number, items: any[]) => {
  playSound();
  return (index - 1 + items.length) % items.length;
};

const prevTop = () => {
  topIndex.value = prevItem(topIndex.value, tops);
};

const nextTop = () => {
  topIndex.value = nextItem(topIndex.value, tops);
};

const prevBottom = () => {
  bottomIndex.value = prevItem(bottomIndex.value, bottoms);
};

const nextBottom = () => {
  bottomIndex.value = nextItem(bottomIndex.value, bottoms);
};

const dressMe = () => {
  playSound();
  showingOutfit.value = true;

  setTimeout(() => {
    showingOutfit.value = false;
  }, 5000);
};
</script>

<!-- Background -->
<!-- ? Add some toggle to switch between basic and pink? -->
<!-- ? Add sound effects to the buttons -->
<style lang="css" scoped>
* {
  font-family: Orbitron, Michroma, sans-serif;
  font-weight: 900;
  /* Other: https://www.fontshut.com/clueless-font/?utm_source=chatgpt.com */
}
</style>

<template>
  <div
    class="min-h-screen max-h-screen overflow-hidden flex flex-col justify-center items-center bg-[url('/leopard-print.jpg')] bg-red-500 bg-cover bg-no-repeat bg-center"
  >
    <!-- Nav -->
    <div class="w-full p-4 bg-black relative">
      <!-- TODO: Update name depending if the user is logged in -->
      <h1 class="text-white">CHER'S WARDROBE</h1>
      <!-- TODO: Make this a drop down menu to select other seasons, pull from a different list of clothes depending on the season -->
      <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <button
          class="px-2 py-1 text-white bg-black border-2 border-t-gray-300 border-l-gray-300 border-r-gray-950 border-b-gray-950 active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
        >
          FALL FASHIONS
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="w-full max-w-xl md:max-w-3xl lg:max-w-4xl 2xl:max-w-6xl flex flex-1"
    >
      <!-- Browse -->
      <!-- ? Have another button for auto dress -->
      <div class="flex flex-col justify-end">
        <div class="border-4 border-black">
          <button
            @click="browseItem"
            class="p-6 w-full text-xs md:text-lg lg:text-2xl bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
          >
            BROWSE
          </button>
        </div>
      </div>

      <!-- Clothes section -->
      <div
        id="clothing-section"
        class="flex-1 flex flex-col border-8 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950"
      >
        <!-- If Dress Me button is clicked -->
        <div
          v-if="showingOutfit"
          class="h-full bg-white flex flex-col items-center justify-center"
        >
          <h2 class="text-2xl mb-4">Your Outfit</h2>
          <!-- TODO: Insert animation here (outfit preview with the selected clothes on person) -->
        </div>

        <!-- Normal view -->
        <div v-else class="flex flex-col flex-1 h-full">
          <!-- Tops -->
          <div class="flex flex-col flex-1">
            <div class="bg-white flex-1 flex items-center justify-center">
              <img
                v-if="currentTop"
                :src="currentTop.src"
                :alt="currentTop.alt"
                class="max-h-40 lg:max-h-54 2xl:max-h-72 max-w-full object-contain"
              />
              <!-- TODO: if no clothes add a plus button to add own clothes, remove background and lay flat (like depop) -->
              <span v-else>NO TOPS</span>
            </div>

            <div
              class="flex flex-row bg-gray-400 border-4 border-black text-center"
            >
              <button
                @click="prevTop"
                class="lg:text-2xl flex-1 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ⏮
              </button>

              <button
                class="lg:text-2xl py-4 px-6 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ▶
              </button>

              <button
                @click="nextTop"
                class="lg:text-2xl flex-1 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ⏭
              </button>
            </div>
          </div>

          <!-- Bottoms -->
          <div class="flex flex-col flex-1">
            <div class="bg-white flex-1 flex items-center justify-center">
              <img
                v-if="currentBottom"
                :src="currentBottom.src"
                :alt="currentBottom.alt"
                class="max-h-40 lg:max-h-54 2xl:max-h-72 max-w-full object-contain"
              />
              <span v-else>NO BOTTOMS</span>
            </div>

            <div
              class="flex flex-row bg-gray-400 border-4 border-black text-center"
            >
              <button
                @click="prevBottom"
                class="lg:text-2xl flex-1 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ⏮
              </button>

              <button
                class="lg:text-2xl py-4 px-6 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ▶
              </button>

              <button
                @click="nextBottom"
                class="lg:text-2xl flex-1 bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dress me -->
      <div class="flex flex-col justify-end">
        <div class="border-4 border-black">
          <button
            @click="dressMe"
            class="p-6 w-full text-xs md:text-lg lg:text-2xl bg-gray-500 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
          >
            DRESS ME
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Nav -->
    <!-- TODO: figure out something for onclick -->
    <div
      class="w-full overflow-x-auto flex flex-row justify-between p-4 bg-black shadow-lg"
    >
      <div class="flex gap-4 text-white">
        <button class="hover:text-gray-300">SHOES</button>
        <button class="hover:text-gray-300">JEWELRY</button>
        <button class="hover:text-gray-300">SCARVES</button>
        <button class="hover:text-gray-300">PANTYHOSE</button>
        <button class="hover:text-gray-300">UNDERWEAR</button>
        <button class="hover:text-gray-300">PANTS</button>
        <button class="hover:text-gray-300">SWEATERS</button>
      </div>
      <button
        class="ml-4 md:ml-0 px-2 py-1 text-white bg-black border-2 border-outset border-t-gray-300 border-l-gray-300 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
      >
        MORE
      </button>
    </div>
  </div>
</template>
