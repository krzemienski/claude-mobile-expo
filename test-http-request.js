// Test HTTP Streaming using SSE Client
const { createChatCompletionStream } = require('./claude-code-mobile/src/services/http/sse.client');

async function testHttpStreaming() {
  console.log('Starting HTTP Streaming Test');

  // Track chunks and timing
  const chunks = [];
  const startTime = Date.now();

  const streamClient = createChatCompletionStream(
    'http://192.168.0.153:8001/v1/chat/completions',
    {
      model: 'claude-3-5-haiku-20241022',
      messages: [
        { role: 'user', content: 'Write a short poem about testing HTTP streaming.' }
      ],
      session_id: 'test_session_streaming',
      project_id: 'mobile_test_project'
    },
    {
      onChunk: (chunk) => {
        chunks.push(chunk);
        console.log('Received chunk:', chunk);
      },
      onComplete: () => {
        const endTime = Date.now();
        console.log('Streaming completed successfully');
        console.log('Total chunks received:', chunks.length);
        console.log('Total streaming time:', endTime - startTime, 'ms');
        console.log('Full streamed content:', chunks.join(''));
      },
      onError: (error) => {
        console.error('Streaming error:', error);
        throw error;
      }
    }
  );

  try {
    console.log('Starting stream...');
    await streamClient.start();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testHttpStreaming().catch(console.error);