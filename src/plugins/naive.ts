// src/plugins/naive.ts
import { create, NButton, NConfigProvider, NMessageProvider, NTabs, NTabPane, NIcon, NBadge, NSpin, NModal, NInput, NForm, NFormItem, NDatePicker, NSelect } from 'naive-ui'

// Create and export a function to install Naive UI
export default function createNaiveUI() {
  return create({
    components: [
      NButton,
      NConfigProvider,
      NMessageProvider,
      NTabs,
      NTabPane,
      NIcon,
      NBadge,
      NSpin,
      NModal,
      NInput,
      NForm,
      NFormItem,
      NDatePicker,
      NSelect,
      // Add more components as needed
    ]
  })
}
