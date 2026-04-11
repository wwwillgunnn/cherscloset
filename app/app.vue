<script setup lang="ts">
const selectedTheme = ref("theme1");
const backgrounds: Record<string, string> = {
  theme1: "/images/backgrounds/theme1.jpg",
  theme2: "/images/backgrounds/theme2.jpg",
  theme3: "/images/backgrounds/theme3.jpg",
  theme4: "/images/backgrounds/theme4.jpg",
  theme5: "/images/backgrounds/theme5.jpg",
};
const backgroundStyle = computed(() => ({
  backgroundImage: `url(${backgrounds[selectedTheme.value]})`,
}));

const topIndex = ref(0);
const bottomIndex = ref(0);
const showingOutfit = ref(false);
const topFileInput = ref<HTMLInputElement | null>(null);
const bottomFileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const userPhoto = ref<string | null>(null);
const userPhotoInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const resultImage = ref<string | null>(null);

// TODO: Use supabase
const tops = ref([
  { src: "/images/tops/yellow-jacket.png", alt: "Yellow jacket" },
  { isUpload: true },
]);

const bottoms = ref([
  { src: "/images/bottoms/yellow-skirt.png", alt: "Yellow skirt" },
  { isUpload: true },
]);

const currentTop = computed(() => tops.value[topIndex.value]);
const currentBottom = computed(() => bottoms.value[bottomIndex.value]);

let buttonClickSound: HTMLAudioElement | null;

onMounted(() => {
  buttonClickSound = new Audio("/audio/mouse-click.mp3");
  const saved = localStorage.getItem("userPhoto");
  if (saved) userPhoto.value = saved;
});

const playSound = () => {
  if (!buttonClickSound) return;
  buttonClickSound.currentTime = 0;
  buttonClickSound.play().catch(() => {});
};

const removeBackground = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file); // must match backend

  const res = await fetch("/api/removebg", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Frontend error:", err);
    throw new Error(err);
  }

  const data = await res.json();
  return data.image;
};

const handleUpload = async (e: Event, type: "top" | "bottom") => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploading.value = true;

  try {
    // remove background first
    const url = await removeBackground(file);

    const newItem = {
      src: url,
      alt: file.name,
    };

    if (type === "top") {
      tops.value.splice(tops.value.length - 1, 0, newItem);
    } else {
      bottoms.value.splice(bottoms.value.length - 1, 0, newItem);
    }
  } catch (err) {
    console.error(err);

    // fallback: show original image if API fails
    const fallbackUrl = URL.createObjectURL(file);

    const newItem = {
      src: fallbackUrl,
      alt: file.name,
    };

    if (type === "top") {
      tops.value.splice(tops.value.length - 1, 0, newItem);
    } else {
      bottoms.value.splice(bottoms.value.length - 1, 0, newItem);
    }
  } finally {
    uploading.value = false;
  }
};

const removeItem = (index: number, type: "top" | "bottom") => {
  const confirmed = confirm("Remove this item?");
  if (!confirmed) return;

  playSound();

  const list = type === "top" ? tops.value : bottoms.value;

  if (list[index]?.isUpload) return;

  list.splice(index, 1);

  if (type === "top") {
    if (topIndex.value >= list.length) topIndex.value = list.length - 1;
  } else {
    if (bottomIndex.value >= list.length) bottomIndex.value = list.length - 1;
  }
};

const nextItem = (index: number, items: any[], type: "top" | "bottom") => {
  playSound();
  return (index + 1) % items.length;
};

const prevItem = (index: number, items: any[]) => {
  playSound();
  return (index - 1 + items.length) % items.length;
};

const triggerUpload = (type: "top" | "bottom") => {
  if (type === "top") topFileInput.value?.click();
  else bottomFileInput.value?.click();
};

const nextTop = () => {
  topIndex.value = nextItem(topIndex.value, tops.value, "top");
};

const nextBottom = () => {
  bottomIndex.value = nextItem(bottomIndex.value, bottoms.value, "bottom");
};

const prevTop = () => {
  topIndex.value = prevItem(topIndex.value, tops.value);
};

const prevBottom = () => {
  bottomIndex.value = prevItem(bottomIndex.value, bottoms.value);
};

const browseItem = () => {
  playSound();
  topIndex.value = Math.floor(Math.random() * tops.value.length);
  bottomIndex.value = Math.floor(Math.random() * bottoms.value.length);
};

// upload user photo
const handleUserPhotoUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  try {
    const url = await removeBackground(file);
    userPhoto.value = url;
    localStorage.setItem("userPhoto", url);
  } catch {
    const reader = new FileReader();
    reader.onload = () => {
      userPhoto.value = reader.result as string;
      localStorage.setItem("userPhoto", userPhoto.value);
    };
    reader.readAsDataURL(file);
  }
};

const runTryOn = async (
  humanImg: string,
  garmentUrl: string,
  category: string,
) => {
  return await $fetch("/api/tryon", {
    method: "POST",
    body: {
      userImage: humanImg,
      garmImg: garmentUrl,
      category,
    },
  });
};

const isSuccess = (res: any): res is { result_url: string } => {
  return res && typeof res.result_url === "string";
};

const isError = (res: any): res is { error: any } => {
  return res && typeof res.error !== "undefined";
};

const dressMe = async () => {
  playSound();

  if (!userPhoto.value) {
    userPhotoInput.value?.click();
    return;
  }

  if (
    !currentTop.value ||
    !currentBottom.value ||
    !currentTop.value.src ||
    !currentBottom.value.src
  )
    return;

  loading.value = true;
  showingOutfit.value = true;

  try {
    // STEP 1: TOP
    const topRes = await runTryOn(
      userPhoto.value,
      currentTop.value.src,
      "upper_body",
    );

    if (!isSuccess(topRes)) {
      throw new Error(
        String(isError(topRes) ? topRes.error : "Top try-on failed"),
      );
    }

    const topImage = topRes.result_url;

    // STEP 2: BOTTOM (chained)
    const bottomRes = await runTryOn(
      topImage,
      currentBottom.value.src,
      "lower_body",
    );

    if (!isSuccess(bottomRes)) {
      throw new Error(
        String(isError(bottomRes) ? bottomRes.error : "Bottom try-on failed"),
      );
    }

    resultImage.value = bottomRes.result_url;

    setTimeout(() => {
      showingOutfit.value = false;
      // resultImage.value = null;
    }, 5000);
  } catch (err) {
    console.error("Try-on failed:", err);
    // showingOutfit.value = false;
  } finally {
    loading.value = false;
  }
};

// if needed to reset user photo:
// localStorage.removeItem("userPhoto");
// userPhoto.value = null;
</script>

<style lang="css" scoped>
* {
  font-family: Orbitron, Michroma, sans-serif;
  font-weight: 900;
  /* Other: https://www.fontshut.com/clueless-font/?utm_source=chatgpt.com */
}
</style>

<template>
  <div
    :style="backgroundStyle"
    class="min-h-screen max-h-screen overflow-hidden flex flex-col justify-center items-center bg-red-500 bg-cover bg-no-repeat bg-center"
  >
    <!-- Nav -->
    <div class="w-full p-4 bg-black relative">
      <!-- TODO: Update name depending if the user is logged in -->
      <h1 class="text-white">CHER'S WARDROBE</h1>
      <!-- TODO: Pull from a different array of clothes depending on the season -->
      <div
        class="ml-20 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 md:m-0"
      >
        <select
          @click="playSound"
          class="px-2 py-1 text-white bg-black outline-none border-2 border-t-gray-300 border-l-gray-300 border-r-gray-950 border-b-gray-950 active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
        >
          <option>FALL FASHIONS</option>
          <option>WINTER FASHIONS</option>
          <option>SPRING FASHIONS</option>
          <option>SUMMER FASHIONS</option>
        </select>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="w-full max-w-xl md:max-w-3xl lg:max-w-4xl 2xl:max-w-6xl flex flex-col lg:flex-row flex-1"
    >
      <!-- Browse -->
      <!-- ? Have another button for auto dress -->
      <div class="order-2 lg:order-1 flex flex-col justify-end">
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
        class="order-1 lg:order-2 flex-1 min-h-0 flex flex-col border-8 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950"
      >
        <!-- If Dress Me button is clicked -->
        <div
          v-if="showingOutfit"
          class="flex-1 min-h-0 bg-white flex flex-col items-center justify-center"
        >
          <!-- TRY ON STAGE -->
          <div
            class="relative w-full flex-1 min-h-0 bg-gray-100 border-4 border-black flex items-center justify-center"
          >
            <!-- LOADING -->
            <div
              v-if="loading"
              class="flex flex-col items-center justify-center h-full"
            >
              <div class="animate-bounce text-2xl mb-4">💅</div>
              <p class="text-lg tracking-widest">TRYING ON OUTFIT...</p>
            </div>

            <!-- AI RESULT -->
            <img
              v-else-if="resultImage"
              :src="resultImage"
              class="w-full h-full object-contain"
            />

            <!-- FALLBACK -->
            <div v-else class="text-black">NO OUTFIT GENERATED</div>
          </div>
        </div>

        <!-- Normal view -->
        <div v-else class="flex flex-col flex-1 h-full">
          <!-- Tops -->
          <div class="flex flex-col flex-1">
            <div class="bg-white flex-1 flex items-center justify-center">
              <template v-if="currentTop?.isUpload">
                <div
                  v-if="uploading"
                  class="flex flex-col items-center justify-center"
                >
                  <div class="animate-pulse text-sm tracking-widest">
                    UPLOADING IMAGE...
                  </div>
                </div>

                <button
                  v-else
                  @click="triggerUpload('top')"
                  class="flex flex-col items-center justify-center gap-2 px-4 py-3 text-xs bg-gray-300 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
                >
                  <img
                    src="/images/icons/upload.png"
                    alt="Upload icon"
                    class="w-8 h-8 object-contain"
                  />
                  <span class="tracking-widest">UPLOAD PICTURE</span>
                </button>
              </template>

              <img
                v-else-if="currentTop"
                :src="currentTop.src"
                :alt="currentTop.alt"
                @contextmenu.prevent="removeItem(topIndex, 'top')"
                class="max-h-40 lg:max-h-54 2xl:max-h-72 max-w-full object-contain"
              />

              <span v-else>NO TOPS</span>

              <!-- hidden input -->
              <input
                type="file"
                ref="topFileInput"
                class="hidden"
                accept="image/*"
                @change="(e) => handleUpload(e, 'top')"
              />
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

              <!-- TODO: On click stop the auto dress -->
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
          <!-- hidden user upload input -->
          <input
            type="file"
            ref="userPhotoInput"
            class="hidden"
            accept="image/*"
            @change="handleUserPhotoUpload"
          />

          <!-- Bottoms -->
          <div class="flex flex-col flex-1">
            <div class="bg-white flex-1 flex items-center justify-center">
              <template v-if="currentBottom?.isUpload">
                <div
                  v-if="uploading"
                  class="flex flex-col items-center justify-center"
                >
                  <div class="animate-pulse text-sm tracking-widest">
                    UPLOADING IMAGE...
                  </div>
                </div>

                <button
                  v-else
                  @click="triggerUpload('bottom')"
                  class="flex flex-col items-center justify-center gap-2 px-4 py-3 text-xs bg-gray-300 border-4 border-outset border-t-gray-400 border-l-gray-400 border-r-gray-950 border-b-gray-950 active:border-inset active:bg-blue-600 active:border-t-gray-950 active:border-l-gray-950 active:border-r-gray-400 active:border-b-gray-400"
                >
                  <img
                    src="/images/icons/upload.png"
                    alt="Upload icon"
                    class="w-8 h-8 object-contain"
                  />
                  <span class="tracking-widest">UPLOAD PICTURE</span>
                </button>
              </template>

              <img
                v-else-if="currentBottom"
                :src="currentBottom.src"
                :alt="currentBottom.alt"
                @contextmenu.prevent="removeItem(bottomIndex, 'bottom')"
                class="max-h-40 lg:max-h-54 2xl:max-h-72 max-w-full object-contain"
              />

              <span v-else>NO BOTTOMS</span>

              <!-- hidden input -->
              <input
                type="file"
                ref="bottomFileInput"
                class="hidden"
                accept="image/*"
                @change="(e) => handleUpload(e, 'bottom')"
              />
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
      <div class="order-3 lg:order-3 flex flex-col justify-end">
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
      <div class="mr-4 flex gap-4 text-white">
        <button class="hover:text-gray-300">SHOES</button>
        <button class="hover:text-gray-300">JEWELRY</button>
        <button class="hover:text-gray-300">SCARVES</button>
        <button class="hover:text-gray-300">PANTYHOSE</button>
        <button class="hover:text-gray-300">UNDERWEAR</button>
        <button class="hover:text-gray-300">PANTS</button>
        <button class="hover:text-gray-300">SWEATERS</button>
      </div>
      <select
        v-model="selectedTheme"
        @click="playSound"
        class="py-1 text-white bg-black outline-none border-2 border-t-gray-300 border-l-gray-300 border-r-gray-950 border-b-gray-950"
      >
        <option value="theme1">THEME 1</option>
        <option value="theme2">THEME 2</option>
        <option value="theme3">THEME 3</option>
        <option value="theme4">THEME 4</option>
        <option value="theme5">THEME 5</option>
      </select>
    </div>
  </div>
</template>
