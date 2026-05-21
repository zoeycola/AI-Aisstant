import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './src/router'
import App from './App.vue'

import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vant)

app.mount('#app')
