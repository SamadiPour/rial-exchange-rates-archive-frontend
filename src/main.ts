import { createApp } from 'vue';
import '@/assets/style.css';
import '@/index.css';
import App from '@/App.vue';
import router from '@/router';
import { createErrorHandler } from '@/plugins/error-handler';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const app = createApp(App);

// Install plugins
app.use(router);
app.use(
  createErrorHandler({
    logErrors: true,
    showErrorInDevelopment: true,
  }),
);

// Register global components
app.component('VueDatePicker', VueDatePicker);
app.mount('#app');
