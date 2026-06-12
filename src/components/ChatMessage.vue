<template>
  <div :class="['chat-message', { 'is-user': message.isUser }]">
    <div class="message-avatar">
      <Icon v-if="message.isUser" name="user-o" size="30" color="#ffffff" />
      <img v-else src="../assets/image/star-boy.webp" alt="" class="assistant-avatar">
    </div>
    <div class="message-content">
      <div class="message-bubble">
        <div>
          <div v-if="message.isUser" class="message-text">{{ message.content }}</div>
          <div v-else-if="message.isThinking" class="thinking-content">
            <span class="thinking-text">正在思考中🤔</span>
            <span class="thinking-dots">
              <span class="dot">.</span>
              <span class="dot">.</span>
              <span class="dot">.</span>
            </span>
          </div>
          <div v-else class="markdown-content" v-html="displayedContent"></div>
        </div>
        <div v-if="!message.isUser && !message.isThinking" class="message-toolbar">
          <button class="toolbar-btn" @click="handleCopy">
            <img src="../assets/icon/icon-copy.png" alt="" class="copy-icon">
            <!-- <span>复制</span> -->
          </button>
          <button class="toolbar-btn" @click="handleRegenerate">
            <img src="../assets/icon/icon-reset.png" alt="" class="copy-icon">
            <!-- <span>重新生成</span> -->
          </button>
        </div>
      </div>
      <div class="message-time">{{ formatTime(message.timestamp) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Icon } from 'vant'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
  isThinking?: boolean
}

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'scrollToBottom'): void
  (e: 'resetAiStatus'): void
  (e: 'copy', content: string): void
  (e: 'regenerate', message: Message): void
}>()

const displayedContent = ref('')
let typeInterval: number | null = null

// 格式化时间
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 每次更新显示的文本内容都会触发滚动事件
// 用户可以实时看到信息消息内容，无需手动滚动
const scrollToBottom = () => {
  emit('scrollToBottom')
}

const resetAiStatus = () => {
  emit('resetAiStatus')
}

// 复制内容
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    // 可以添加提示用户复制成功的逻辑
    emit('copy', props.message.content)
  } catch (err) {
    // 降级方案：使用 textarea
    const textarea = document.createElement('textarea')
    textarea.value = props.message.content
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    emit('copy', props.message.content)
  }
}

// 重新生成
const handleRegenerate = () => {
  emit('regenerate', props.message)
}

// 模拟打字效果
const startTypingEffect = () => {
  if (props.message.isUser || props.message.isTyping) {
    displayedContent.value = md.render(props.message.content)
    return
  }

  const fullContent = props.message.content
  let currentIndex = 0
  displayedContent.value = ''

  if (typeInterval) {
    clearInterval(typeInterval)
  }

  typeInterval = window.setInterval(() => {
    if (currentIndex < fullContent.length) {
      const chunkSize = Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 2 : 1
      const endIndex = Math.min(currentIndex + chunkSize, fullContent.length)
      const partialContent = fullContent.substring(0, endIndex)
      displayedContent.value = md.render(partialContent)
      currentIndex = endIndex
      scrollToBottom()
    } else {
      if (typeInterval) {
        clearInterval(typeInterval)
        typeInterval = null
        resetAiStatus()
      }
    }
  }, 30)
}

onMounted(() => {
  if (!props.message.isUser) {
    startTypingEffect()
  } else {
    displayedContent.value = props.message.content
  }
})

watch(() => props.message.content, () => {
  if (!props.message.isUser) {
    startTypingEffect()
  }
})
</script>

<style scoped>
.chat-message {
  display: flex;
  padding: 8px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chat-message.is-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.is-user .message-avatar {
  background: linear-gradient(135deg, #ff2c55 0%, #ff4757 100%);
}

.chat-message:not(.is-user) .message-avatar {
  background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
}

.assistant-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message-content {
  max-width: 80%;
  margin: 0 12px;
}
.message-toolbar{
  display: flex;
  align-items: center;
  gap: 8px;
  img {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
}

.chat-message.is-user .message-bubble {
  background: linear-gradient(135deg, #ff2c55 0%, #ff4757 100%);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chat-message:not(.is-user) .message-bubble {
  background: #ffffff;
  color: #333333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-text {
  margin: 0;
  padding: 4px 0;
  word-break: break-word;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 12px 0 8px;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.1em;
}

.markdown-content :deep(p) {
  margin: 8px 0;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #ff2c55;
  padding-left: 12px;
  margin: 12px 0;
  color: #666;
}

.markdown-content :deep(a) {
  color: #ff2c55;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(255, 44, 85, 0.1);
  font-weight: 600;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.message-time {
  font-size: 12px;
  color: #999999;
  margin-top: 6px;
}

.chat-message.is-user .message-time {
  text-align: right;
}

.typing-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 思考中状态样式 */
.thinking-content {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.thinking-text {
  animation: bounce 1s ease-in-out infinite;
}

.thinking-dots {
  display: flex;
  gap: 2px;
}

.thinking-dots .dot {
  animation: bounce-dot 1.4s ease-in-out infinite both;
}

.thinking-dots .dot:nth-child(1) {
  animation-delay: 0s;
}

.thinking-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes bounce-dot {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 消息操作栏 */
.message-toolbar {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  padding-left: 4px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background:none;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  color: #ff2c55;
  cursor: pointer;
  transition: all 0.2s ease;
  &:first-child {
   padding-left: 0;
  }
}

.toolbar-btn:hover {
  /* background: rgba(255, 44, 85, 0.15); */
  transform: scale(1.02);
}

.toolbar-btn:active {
  transform: scale(0.98);
}

.toolbar-btn span {
  line-height: 1;
}
</style>
