<template>
  <div class="chat-app">
    <div class="chat-window">
      <h2>Real-Time Chat</h2>
      <div class="messages">
        <!-- Render messages -->
      </div>
      <input type="text" v-model="message" @keyup.enter="sendMessage" placeholder="Type your message..."/>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default {
  setup() {
    const message = ref('');

    const sendMessage = async () => {
      if (message.value.trim()) {
        // Send new message to Firestore
        await addDoc(collection(db, 'messages'), {
          text: message.value,
          createdAt: new Date(),
        });
        message.value = '';
      }
    };

    return { message, sendMessage };
  }
};
</script>

<style scoped>
  /* Add Tailwind or custom styles */
</style>