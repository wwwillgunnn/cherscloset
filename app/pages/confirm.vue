<script setup lang="ts">
const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) {
      // Redirect to protected page
      return navigateTo("/");
    }
  },
  { immediate: true },
);
</script>

<template
  class="min-h-screen flex items-center justify-center bg-[url('/images/backgrounds/theme1.jpg')] bg-no-repeat bg-cover"
>
  <div class="text-white text-2xl font-bold">Waiting for login...</div>
</template>
