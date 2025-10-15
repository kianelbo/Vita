<script setup lang="ts">
function sayHello() {
  alert("Hello from Vita!");
}
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Vita Journal</h1>
    <button class="btn btn-primary" @click="sayHello">
      Click Me
    </button>
  </div>
</template>
