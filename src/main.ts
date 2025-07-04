import { createApp } from 'vue';
import './assets/style.css';
import './index.css';
import App from './App.vue';
import router from './router';
import { createErrorHandler } from './plugins/error-handler';

const app = createApp(App);

// Install plugins
app.use(router);
app.use(
  createErrorHandler({
    logErrors: true,
    showErrorInDevelopment: true,
  }),
);

app.mount('#app');
