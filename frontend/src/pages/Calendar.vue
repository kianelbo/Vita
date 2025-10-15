<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios' // your axios instance (baseURL set)
import { useAuthStore } from '../store/auth'

const route = useRoute()
const router = useRouter()
const username = (route.params.username || '') as string
const auth = useAuthStore()

const days = ref<any[]>([])
const offset = ref(0)
const limit = 1000
const loading = ref(false)
const loadingMore = ref(false)

/** Modal state */
const showModal = ref(false)
const selectedDay = ref<any | null>(null)
const modalDialog = ref<HTMLElement | null>(null)

const calendarGrid = ref<HTMLElement | null>(null)

const isOwner = computed(() => auth.user?.username === username)

// Format tile tooltip/title
function tileTitle(day: any) {
  if (!day) return ''
  if (day.hasEntry) return `${day.date} — entry${day.isPrivate ? ' (private)' : ''}`
  return `${day.date} — no entry`
}

// Fetch a page of days
async function fetchDays() {
  if (loading.value) return
  loading.value = true
  if (offset.value > 0) loadingMore.value = true

  try {
    // Backend endpoint: GET /api/users/:username/calendar?offset=0&limit=1000
    const res = await api.get(`/journals/${username}`, {
      params: { offset: offset.value, limit }
    })

    // Expect res.data to be an array of objects:
    // { date: 'YYYY-MM-DD', hasEntry: boolean, isPrivate: boolean, journal: string | null, color?: string }
    const mapped = res.data.map((d: any) => ({
      ...d,
      // If backend supplies a color use it, otherwise derive:
      color: d.color || (d.hasEntry ? (d.isPrivate ? '#6c757d' : '#198754') : '#e9ecef')
    }))

    // Append older days to the end (we load newest first, so this extends history)
    days.value.push(...mapped)
    offset.value += mapped.length
  } catch (err) {
    console.error('Failed to fetch days', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function openModal(day: any) {
  selectedDay.value = day
  showModal.value = true

  // Focus modal dialog for accessibility
  setTimeout(() => {
    modalDialog.value?.focus()
  }, 0)
}

function closeModal() {
  showModal.value = false
  selectedDay.value = null
}

/** Edit handler stub — you can implement real editing UI later */
function editDay(day: any) {
  // if owner, route to a day editor or toggle an edit form
  if (isOwner.value) {
    router.push({ path: `/${username}/edit`, query: { date: day.date } })
  }
}

/** Infinite scroll handler: when scrolled to bottom, fetch more */
function onScroll() {
  const el = calendarGrid.value
  if (!el || loading.value) return
  const threshold = 100 // px from bottom
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
    fetchDays()
  }
}

onMounted(async () => {
  await fetchDays()
})
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-3">@{{ username }}'s Journal</h2>

    <div
      ref="calendarGrid"
      class="calendar-grid"
      @scroll="onScroll"
      role="list"
      aria-label="Journal calendar"
    >
      <div
        v-for="day in days"
        :key="day.date"
        class="calendar-tile"
        :style="{ backgroundColor: day.color }"
        @click="openModal(day)"
        :title="tileTitle(day)"
        role="listitem"
        tabindex="0"
        @keydown.enter.prevent="openModal(day)"
        @keydown.space.prevent="openModal(day)"
      ></div>

      <div v-if="loadingMore" class="loading-indicator">Loading...</div>
    </div>

    <!-- Pure-Vue Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal" role="dialog" aria-modal="true">
      <div class="modal-dialog modal-centered" role="document" @keydown.esc="closeModal" tabindex="-1" ref="modalDialog">
        <div class="modal-content p-3">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="modal-title mb-0">{{ selectedDay?.date }}</h5>
            <button class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>

          <div class="modal-body mt-3">
            <p v-if="selectedDay?.isPrivate && !isOwner" class="text-muted">
              🔒 This entry is private.
            </p>

            <div v-else>
              <p v-if="selectedDay?.journal">{{ selectedDay.journal }}</p>
              <p v-else class="text-muted">No entry for this day.</p>
            </div>
          </div>

          <div class="modal-footer d-flex justify-content-end">
            <button class="btn btn-secondary" @click="closeModal">Close</button>
            <!-- Optionally: edit button if owner -->
            <button v-if="isOwner" class="btn btn-primary ms-2" @click="editDay(selectedDay)">Edit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  /* GitHub-like week columns: 7 rows by many columns can be achieved differently,
     but here we keep a responsive horizontal flow. You can rewrite later to a weekly layout. */
  grid-template-columns: repeat(auto-fill, 14px);
  gap: 6px;
  max-height: 520px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  padding: 8px;
  align-items: start;
}

/* Small square tiles */
.calendar-tile {
  width: 14px;
  height: 14px;
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid rgba(0,0,0,0.04);
  box-sizing: border-box;
}
.calendar-tile:focus {
  outline: 2px solid rgba(0,123,255,0.5);
  outline-offset: 2px;
}

/* Basic loading indicator */
.loading-indicator {
  grid-column: 1/-1;
  text-align: center;
  padding: 8px;
  color: #6c757d;
}

/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

/* Modal dialog */
.modal-dialog {
  width: 90%;
  max-width: 620px;
  outline: none;
}
.modal-centered {
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: .375rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* small utility */
.btn-close {
  appearance: none;
  border: none;
  width: 28px;
  height: 28px;
  background: transparent;
  position: relative;
}
.btn-close::before, .btn-close::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 2px;
  background: #6c757d;
  transform-origin: center;
}
.btn-close::before { transform: translate(-50%, -50%) rotate(45deg); }
.btn-close::after { transform: translate(-50%, -50%) rotate(-45deg); }
</style>
