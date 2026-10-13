// Test script to check chats API
// Run with: npx ts-node scripts/test-chats-api.ts

const API_URL = 'https://pulse-jzjb.onrender.com/api';

async function testChatsAPI() {
  console.log('Testing Chats API...\n');
  
  // You'll need to replace this with a valid token
  const token = 'YOUR_AUTH_TOKEN_HERE';
  
  try {
    console.log('Fetching chats...');
    const response = await fetch(`${API_URL}/chats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      console.log(`\nFound ${data.length} chats`);
      
      data.forEach((chat: any, index: number) => {
        console.log(`\nChat ${index + 1}:`);
        console.log('  ID:', chat.id || chat._id);
        console.log('  Other Participant:', chat.otherParticipant);
        console.log('  Last Message:', chat.lastMessage);
        console.log('  Participants:', chat.participants);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testChatsAPI();
