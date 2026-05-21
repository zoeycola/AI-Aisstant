<template>
  <div class="chat-input-wrapper" :class="{'disabled-input': isAiProcessing}">
    <div class="input-toolbar">
      <!-- <Icon 
        :name="isVoiceMode ? 'message' : 'mic'" 
        size="24" 
        :color="isVoiceMode ? '#999' : '#ff2c55'"
        class="mode-toggle"
        @click="toggleMode"
      /> -->
    </div>
    
    <!-- 文字输入模式 -->
    <div v-if="!isVoiceMode" class="text-input-container">
      <van-cell-group inset>

        <van-field
          v-model="inputText"
          center
          clearable
          label=""
          :placeholder="isAiProcessing ? '🤚正在生成中...' : '输入消息..'"
          @keyup.enter="handleSend"
          :disabled="isAiProcessing"
          >
          <template #button>
           <van-icon name="upgrade"  style="font-size: 30px;" :color="inputText.length > 0? '#ff2c55' : '#999'" @click="handleSend"/>
          </template>
        </van-field>
      </van-cell-group>
    </div>
    
    <!-- 语音输入模式 -->
    <div v-else class="voice-input-container">
      <div 
        :class="['voice-btn', { 'recording': isRecording, 'recording-active': isRecording }]"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @mouseleave="stopRecording"
        @touchstart.prevent="startRecording"
        @touchend.prevent="stopRecording"
      >
        <Icon 
          :name="isRecording ? 'stop' : 'mic'" 
          size="32" 
          :color="isRecording ? '#fff' : '#ff2c55'"
        />
        <span class="voice-hint">{{ isRecording ? '松开发送' : '按住说话' }}</span>
      </div>
      <div v-if="isRecording" class="recording-indicator">
        <Icon name="volume-o" size="20" color="#ff2c55" class="wave-icon" />
        <span class="recording-text">正在录音...</span>
      </div>
      <div v-if="voiceText" class="voice-preview">
        <p class="preview-text">{{ voiceText }}</p>
        <Button type="danger" size="small" plain @click="clearVoice">重新录制</Button>
        <Button type="primary" size="small" @click="sendVoice">发送语音</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon, Button } from 'vant'

const props = defineProps<{
  isResponse: boolean
  isAiProcessing: boolean
}>()

const emit = defineEmits<{
  (e: 'send', content: string): void
}>()

const isVoiceMode = ref(false)
const inputText = ref('')
const isRecording = ref(false)
const voiceText = ref('')

// const toggleMode = () => {
//   isVoiceMode.value = !isVoiceMode.value
//   inputText.value = ''
//   voiceText.value = ''
// }

const handleSend = () => {
  if (inputText.value.trim()) {
    emit('send', inputText.value.trim())
    inputText.value = ''
  }
}

const startRecording = () => {
  isRecording.value = true
  voiceText.value = ''
}

const stopRecording = () => {
  if (isRecording.value) {
    isRecording.value = false
    voiceText.value = '这是语音转文字的内容示例...'
  }
}

const clearVoice = () => {
  voiceText.value = ''
}

const sendVoice = () => {
  if (voiceText.value) {
    emit('send', voiceText.value)
    voiceText.value = ''
  }
}
</script>

<style scoped>
.chat-input-wrapper {
  background: #ffffff;
  margin-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f0f0;
  border-radius: 30px;
  margin: 12px 16px;
  &.disabled-input {
    background: #f5f5f5;
  }
}

.input-toolbar {
  display: flex;
  justify-content: flex-start;
  /* margin-bottom: 12px; */
}

.van-field--disabled{
  background: #f5f5f5;
}

.mode-toggle {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.mode-toggle:active {
  background: #f5f5f5;
}

.text-input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.text-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border: none;
  border-radius: 24px;
  background: #f5f5f5;
  font-size: 15px;
  resize: none;
  outline: none;
  box-sizing: border-box;
}

.text-input::placeholder {
  color: #cccccc;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 12px;
  color: #999999;
}

.send-btn {
  background: linear-gradient(135deg, #ff2c55 0%, #ff4757 100%);
  border: none;
  padding: 8px 20px;
}

.send-btn:disabled {
  background: #cccccc !important;
}

.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.voice-btn {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid #ff2c55;
}

.voice-btn.recording {
  background: #ff2c55;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 44, 85, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(255, 44, 85, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 44, 85, 0); }
}

.voice-hint {
  font-size: 12px;
  color: #999999;
  margin-top: 6px;
}

.voice-btn.recording .voice-hint {
  color: #ffffff;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wave-icon {
  animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.recording-text {
  font-size: 14px;
  color: #ff2c55;
}

.voice-preview {
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-text {
  margin: 0;
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
}
</style>