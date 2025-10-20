<script setup lang="ts">
import { ref, watch } from 'vue'
import api from '../api/axios'

interface Props {
  modelValue: boolean
  selectedDate: string | null
  content: string | null
  isPrivate: boolean
  isOwner: boolean
  activeColor: string
  username: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'refresh'])

const journalText = ref(props.content ?? '')
const isPrivateLocal = ref(props.isPrivate)

watch(() => props.content, v => (journalText.value = v ?? ''))
watch(() => props.isPrivate, v => (isPrivateLocal.value = v))

function closeModal() {
  emit('update:modelValue', false)
}

async function saveEntry() {
  if (!props.selectedDate) return
  try {
    await api.post(`/journals`, {
      date: props.selectedDate,
      content: journalText.value,
      color: "#42f563",
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

        <div class="modal-header text-white" :style="{ backgroundColor: activeColor }">
          <h5 class="modal-title">{{ selectedDate }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
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
              placeholder="Write your thoughts..."
            ></textarea>

            <div class="d-flex justify-content-between align-items-center">
              <div class="form-check m-0">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="isPrivateLocal"
                  id="privateCheck"
                />
                <label class="form-check-label" for="privateCheck">
                  Private
                </label>
              </div>

              <button v-if="isOwner" type="button" class="btn btn-outline-primary" @click="saveEntry">Save</button>
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
