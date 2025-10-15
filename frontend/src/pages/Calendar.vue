<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const username = route.params.username as string
const calendarData = ref<any>(null)

onMounted(async () => {
  try {
    const res = await api.get(`/journals/${username}`)
    calendarData.value = res.data
  } catch (err) {
    console.error('Failed to fetch calendar:', err)
  }
})
</script>

<template>
  <div class="container py-5 text-center">
    <h2>{{ username }}'s Calendar</h2>
    <div v-if="!calendarData">
      <p>Loading calendar...</p>
    </div>
    <div v-else>
      <p>Calendar data would be displayed here</p>
    </div>
  </div>
</template>
