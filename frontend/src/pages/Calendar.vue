<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../store/auth'
import JournalModal from '../components/JournalModal.vue'

const route = useRoute()
const username = route.params.username as string
const auth = useAuthStore()
const isOwner = computed(() => auth.user?.username === username)

const selectedYear = ref<number>(new Date().getFullYear())
const years = ref<number[]>([selectedYear.value])
const days = ref<JournalEntry[]>([])

const showModal = ref(false)
const selectedDay = ref<any | null>(null)
const modalDialog = ref<HTMLElement | null>(null)

type JournalEntry = {
  date: string            // 'YYYY-MM-DD'
  hasEntry?: boolean
  isPrivate?: boolean
  content?: string | null
  color?: string
}

const defaultDayColor = '#e9ecef'
const today = new Date()
today.setHours(0, 0, 0, 0)

function isFuture(d: string) {
  return new Date(d).getTime() > today.getTime()
}

function generateDaysOfYear(year: number) : JournalEntry[] {
  const days: JournalEntry[] = []
  const start = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split('T')[0] || ""
    days.push({
      date: iso,
      hasEntry: false,
      isPrivate: false,
      content: null,
      color: defaultDayColor
    })
  }
  return days
}

function tileTitle(day: JournalEntry) {
  if (day.hasEntry) return `${day.date}${day.isPrivate ? ' (private)' : ''}`
  return `${day.date} — no entry`
}

async function fetchYears() {
  const res = await api.get(`/journals/${username}/years`)
  years.value = res.data
  // const { oldestYear } = res.data
  // const years: number[] = []
  // for (let y = currentYear; y >= oldestYear ; y--)
  //   years.push(y)
}

async function fetchYearEntries() {
  const year = selectedYear.value
  const res = await api.get(`/journals/${username}`, { params: { year } })
  console.log(res)

  const entries = res.data as JournalEntry[]

  const yearDays = generateDaysOfYear(year)

  const entryMap = new Map<string, JournalEntry>()
  for (const e of entries) {
    if (e?.date) entryMap.set(e.date, e)
  }

  for (const day of yearDays) {
    const e = entryMap.get(day.date)
    if (e) {
      day.hasEntry = true
      day.isPrivate = !!e.isPrivate
      day.content = e.content ?? null
      day.color = e.color ?? (e.isPrivate ? '#6c757d' : '#198754')
    } else {
      day.hasEntry = false
      day.isPrivate = false
      day.content = null
      day.color = defaultDayColor
    }
  }

  days.value = yearDays
}

function openModal(day: JournalEntry) {
  selectedDay.value = day
  showModal.value = true
  modalDialog.value?.focus()
}

onMounted(async () => {
  await fetchYearEntries()
  fetchYears()
})
</script>

<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>@{{ username }}'s Journal</h2>

      <select v-model="selectedYear" @change="fetchYearEntries" class="form-select w-auto">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div
      ref="calendarGrid"
      class="calendar-grid"
      role="list"
      aria-label="Journal calendar"
    >
      <div
        v-for="day in days"
        :key="day.date"
        class="calendar-tile"
        :style="{
          backgroundColor: day.color,
          cursor: isFuture(day.date) ? 'not-allowed' : 'pointer',
          opacity: isFuture(day.date) ? 0.5 : 1
        }"
        @click="!isFuture(day.date) && openModal(day)"
        :title="tileTitle(day)"
        role="listitem"
        tabindex="0"
        @keydown.enter.prevent="openModal(day)"
        @keydown.space.prevent="openModal(day)"
      ></div>
    </div>

    <JournalModal
      v-model="showModal"
      :selectedDate="selectedDay?.date || null"
      :content="selectedDay?.content || null"
      :isPrivate="selectedDay?.isPrivate || false"
      :isOwner="isOwner"
      :color="selectedDay?.color || defaultDayColor"
      :username="username"
      @refresh="fetchYearEntries"
    />
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 14px);
  gap: 6px;
  max-height: 520px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  padding: 8px;
}
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
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog {
  width: 90%;
  max-width: 620px;
  outline: none;
}
.modal-content {
  background: #fff;
  border-radius: .375rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
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
