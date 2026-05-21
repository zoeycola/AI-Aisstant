<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <div class="chat-header">
      <!-- <div class="header-left">
        <Icon name="arrow-left" size="24" color="#fff" />
      </div> -->
      <div class="header-center">
        <div class="avatar-wrapper">
          <Icon name="robot-o" size="32" color="#fff" />
        </div>
        <div class="header-info">
          <h1 class="chat-title">weekend的小助手🐄</h1>
          <span class="online-status">
            <Icon name="circle" size="10" color="#2ed573" />
            在线
          </span>
        </div>
      </div>
      <div class="header-right">
        <Icon name="more-o" size="24" color="#fff" />
      </div>
    </div>
    
    <!-- 消息列表 -->
    <div ref="messageList" class="message-list">
      <div class="welcome-card">
        <Icon name="sparkles" size="48" color="#ff2c55" />
        <h2>你好！</h2>
        <p>我是你的AI助手，有什么可以帮你的？</p>
      </div>
      
      <ChatMessage 
        v-for="message in messages" 
        :key="message.id" 
        :message="message" 
        @scrollToBottom="scrollToBottom"
        @resetAiStatus="resetStatus"
      />
      
      <!-- <div v-if="isTyping" class="typing-indicator">
        <Icon name="loading" size="20" color="#999" class="typing-dots" />
        <span>正在思考...</span>
      </div> -->
    </div>
    
    <!-- 输入框 -->
    <ChatInput 
    :isResponse="isResponse" 
    :isAiProcessing="isAiProcessing"
    @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick} from 'vue'
import { Icon } from 'vant'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import { invokeAI } from '../utils/ai/langchain-invoke.js'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  isTyping?: boolean
  isResponse?: boolean
  isAiProcessing?: boolean,
  isThinking?: boolean
}

// 聊天容器引用
const messageList = ref<HTMLElement | null>(null)

const messages = ref<Message[]>([])
const isTyping = ref(false)//是否正在输入中
const isResponse = ref(false)//是否正在回复
const isAiProcessing = ref(false)//是否正在处理AI回复

const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      messageList.value.scrollTop = messageList.value.scrollHeight
    }
  })
}

// 重置回复状态
const resetStatus = () => {
  isResponse.value = false
  isTyping.value = false
  isAiProcessing.value = false
}


// watch(
//   () => messages.value.map(msg => msg.content), // 监听消息内容变化
//   () => {//变化时的回调函数
//   // 延迟一小段时间，确保DOM已更新
//     setTimeout(() => {
//       console.log('滚动到最底部')
//       scrollToBottom()
//     }, 50)
//   }, { deep: true })


const handleSend = async (content: string) => {
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    content,
    isUser: true,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)
  await scrollToBottom()
  

  isTyping.value = true
  // 设置AI处理状态
  isAiProcessing.value = true

  // 创建AI消息（初始状态为思考中）
  const aiMessage: Message = {
    id: `ai-${Date.now()}`,
    content: '正在思考中🤔...',
    isUser: false,
    timestamp: new Date(),
    isThinking: true
  }
  messages.value.push(aiMessage)
  await scrollToBottom()

  try {
    // 获取ai回复
    const aiResponse = await invokeAI(content)
    // 直接更新同一消息
    const msgIndex = messages.value.findIndex(msg => msg.id === aiMessage.id)
    if (msgIndex !== -1) {
      messages.value[msgIndex] = {
        ...messages.value[msgIndex],
        content: aiResponse,
        isThinking: false
      }
    }
  } catch (error) {
    const msgIndex = messages.value.findIndex(msg => msg.id === aiMessage.id)
    if (msgIndex !== -1) {
      messages.value[msgIndex] = {
        ...messages.value[msgIndex],
        content: '抱歉，暂时无法获取回复，请稍后重试',
        isThinking: false
      }
    }
  } finally {
      isTyping.value = false
      isResponse.value = true
      await scrollToBottom()
  }

 

  console.log('messages==',messages.value)
}
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
}

.chat-header {
  background: linear-gradient(135deg, #ff2c55 0%, #ff4757 100%);
  padding: 8px;
  /* padding-top: calc(16px + env(safe-area-inset-top)); */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left, .header-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.chat-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.online-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
}

.message-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.welcome-card {
  text-align: center;
  padding: 32px;
  margin-bottom: 16px;
}

.welcome-card h2 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #ffffff;
  font-weight: 600;
}

.welcome-card p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin: 0 60px 16px;
  background: #ffffff;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.typing-indicator span {
  font-size: 14px;
  color: #999999;
}

.typing-dots {
  animation: typing 1.4s infinite ease-in-out;
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>