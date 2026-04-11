<script setup lang="ts">
const supabase = useSupabaseClient();
const isLogin = ref(true);

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const errorMsg = ref("");
const loading = ref(false);

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  errorMsg.value = "";
};

const handleAuth = async () => {
  errorMsg.value = "";
  loading.value = true;

  try {
    if (isLogin.value) {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });

      if (error) throw error;
    } else {
      // SIGN UP
      if (password.value !== confirmPassword.value) {
        throw new Error("Passwords don't match");
      }

      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            full_name: fullName.value,
          },
        },
      });

      if (error) throw error;
    }

    navigateTo("/confirm");
  } catch (err: any) {
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};

const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/confirm",
    },
  });
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[url('/images/login-background.png')] bg-no-repeat bg-cover"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow p-8">
      <!-- TITLE -->
      <h1 class="text-2xl font-bold mb-2 text-center">
        {{ isLogin ? "Welcome back" : "Create an account" }}
      </h1>

      <p class="text-gray-500 text-center mb-6">
        {{
          isLogin
            ? "Login with your account"
            : "Enter your info to create your account"
        }}
      </p>

      <!-- GOOGLE -->
      <button
        @click="signInWithGoogle"
        class="w-full border rounded-lg py-2 mb-4 hover:bg-gray-50"
      >
        Continue with Google
      </button>

      <!-- DIVIDER -->
      <div class="flex items-center my-4">
        <div class="flex-1 h-px bg-gray-300"></div>
        <span class="px-3 text-sm text-gray-400">or</span>
        <div class="flex-1 h-px bg-gray-300"></div>
      </div>

      <!-- FORM -->
      <div class="space-y-4">
        <!-- FULL NAME (SIGNUP ONLY) -->
        <div v-if="!isLogin">
          <label class="text-sm font-medium">Full Name</label>
          <input
            v-model="fullName"
            type="text"
            placeholder="John Doe"
            class="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <!-- EMAIL -->
        <div>
          <label class="text-sm font-medium">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="m@example.com"
            class="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <!-- PASSWORD -->
        <div>
          <label class="text-sm font-medium">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <!-- CONFIRM PASSWORD -->
        <div v-if="!isLogin">
          <label class="text-sm font-medium">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <!-- ERROR -->
        <p v-if="errorMsg" class="text-red-500 text-sm">
          {{ errorMsg }}
        </p>

        <!-- SUBMIT -->
        <button
          @click="handleAuth"
          :disabled="loading"
          class="w-full bg-black text-white py-2 rounded-lg mt-2 hover:opacity-90"
        >
          {{ loading ? "Loading..." : isLogin ? "Login" : "Create Account" }}
        </button>
      </div>

      <!-- TOGGLE -->
      <p class="text-center text-sm text-gray-500 mt-6">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <button @click="toggleMode" class="underline ml-1">
          {{ isLogin ? "Sign up" : "Sign in" }}
        </button>
      </p>
    </div>
  </div>
</template>
