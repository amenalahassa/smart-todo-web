<template>
  <n-modal :show="show" @update:show="emit('update:show', $event)" preset="card" title="Archive Task" :mask-closable="false" class="archive-modal">
    <div class="archive-content">
      <p class="archive-description">
        You are about to archive the task "{{ task?.title }}". Please provide a justification for archiving this task.
      </p>

      <n-form ref="formRef" :model="{ justification }" :rules="rules">
        <n-form-item path="justification" label="Justification">
          <n-input 
            v-model:value="justification" 
            type="textarea" 
            placeholder="Enter your justification for archiving this task..." 
            :autosize="{ minRows: 3, maxRows: 5 }" 
          />
        </n-form-item>
      </n-form>

      <div class="form-actions">
        <n-button @click="handleCancel">Cancel</n-button>
        <n-button type="primary" @click="handleConfirm" :loading="submitting">
          Archive Task
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { NModal, NForm, NFormItem, NInput, NButton } from 'naive-ui';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:show', 'confirm', 'cancel']);

const justification = ref('');
const submitting = ref(false);
const formRef = ref(null);

// Form validation rules
const rules = {
  justification: {
    required: true,
    message: 'Please provide a justification for archiving this task',
    trigger: 'blur'
  }
};

// Reset form when dialog is closed
watch(() => props.show, (newVal) => {
  if (!newVal) {
    justification.value = '';
    if (formRef.value) {
      formRef.value.restoreValidation();
    }
  }
});

// Handle confirm button click
const handleConfirm = (e) => {
  e.preventDefault();

  // Validate form
  formRef.value?.validate(async (errors) => {
    if (errors) {
      return;
    }

    submitting.value = true;

    try {
      // Emit confirm event with justification
      emit('confirm', {
        taskId: props.task.id,
        justification: justification.value
      });

      // Reset form
      justification.value = '';
      if (formRef.value) {
        formRef.value.restoreValidation();
      }

      // Close the modal
      emit('update:show', false);
    } finally {
      submitting.value = false;
    }
  });
};

// Handle cancel button click
const handleCancel = () => {
  emit('cancel');
  emit('update:show', false);
};
</script>

<style scoped>
.archive-modal {
  max-width: 600px;
  width: 90%;
}

.archive-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.archive-description {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
