<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import api from '../api/axios'

interface Props {
  modelValue: boolean
  selectedDate: string | null
  content: string | null
  isPrivate: boolean
  isOwner: boolean
  color: string
  username: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'refresh'])

const journalText = ref(props.content ?? '')
const isPrivateLocal = ref(props.isPrivate)
const colorLocal = ref(props.color)

watch(() => props.content, v => (journalText.value = v ?? ''))
watch(() => props.isPrivate, v => (isPrivateLocal.value = v))
watch(() => props.color, (newColor) => (colorLocal.value = newColor), { immediate: true })

function closeModal() {
  emit('update:modelValue', false)
}

const isDateEditable = computed(() => {
  const today = new Date()
  const selected = new Date(props.selectedDate as string)

  today.setHours(0, 0, 0, 0)
  selected.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((today.getTime() - selected.getTime()) / (1000 * 60 * 60 * 24))
  // ✅ Editable only if date is not in the future and not older than 3 days
  return diffDays >= 0 && diffDays <= 3
})

const canSave = computed(() => {
  if (!props.isOwner) return false
  if (isDateEditable.value) return true
  return !!props.content
})

async function saveEntry() {
  if (!props.selectedDate) return
  try {
    await api.post(`/journals`, {
      date: props.selectedDate,
      content: journalText.value,
      color: colorLocal.value,
      isPrivate: isPrivateLocal.value
    })
    emit('refresh')
    closeModal()
  } catch (e) {
    console.error('Failed to save entry', e)
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="modal fade show d-block"
    tabindex="-1"
    aria-labelledby="journalModalLabel"
    aria-modal="true"
    role="dialog"
    style="background-color: rgba(0,0,0,0.5);"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0">

        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title">{{ selectedDate }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">

          <div v-if="isPrivate && !isOwner" class="text-muted text-center">
            🔒 This entry is private
          </div>

          <div v-else>
            <textarea
              v-model="journalText"
              class="form-control mb-2"
              rows="6"
              :readonly="!isOwner || !isDateEditable"
              :placeholder="isOwner && isDateEditable ? 'Write your thoughts...' : 'No entry!'"
            ></textarea>

            <div class="modal-footer justify-content-between" v-if="isOwner">
              <div class="d-flex align-items-center gap-3">
                <div class="form-check m-0">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="privateCheck"
                    v-model="isPrivateLocal"
                  />
                  <label class="form-check-label" for="privateCheck">
                    Private
                  </label>
                </div>

                <input
                  type="color"
                  v-model="colorLocal"
                  title="Pick a color"
                  :disabled="!isOwner || !isDateEditable"
                  style="width: 40px; height: 35px; padding: 0; background: none;"
                />
              </div>

              <button
                type="button"
                class="btn btn-outline-primary"
                @click="saveEntry"
                :disabled="!canSave"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  overflow-y: auto;
}
.modal.fade.show {
  display: block;
}
</style>
