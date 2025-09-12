import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const DogChat = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('User'); // default

  // Fetch logged-in user's username from backend
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await axios.get('/api/current-user'); // backend route
        setUsername(res.data.username);
      } catch (err) {
        console.error('Failed to fetch username:', err);
      }
    };
    fetchUsername();
  }, []);

  // Initialize Gemini API client
  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message
    setChatHistory(prev => [...prev, { text: message, sender: 'user' }]);
    setIsLoading(true);

    try {
      const prompt = `
You are a friendly dog expert.  
- Always answer any question related to dogs (breeds, names, adoption, food, training, care, behavior, health, activities, etc.) with a clear, helpful, and detailed response.  
- If the user specifically asks for dog names, provide a list of names, each on a new line.  
- If the question is not related to dogs at all, reply only with: "I only answer dog-related questions."

User: ${message}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      setChatHistory(prev => [...prev, { text: responseText, sender: 'bot' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { text: 'Error connecting to Gemini API', sender: 'bot' }]);
    }

    setMessage('');
    setIsLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '20px auto',
        padding: '20px',
        border: '2px solid #ccc',
        borderRadius: '15px',
        backgroundColor: '#fafafa',
        boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '28px' }}>
        🐶 Dog Chat
      </h2>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #bbb',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: '#fff',
          fontSize: '16px',
          lineHeight: '1.5'
        }}
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}
          >
            <div
              style={{
                background: msg.sender === 'user' ? '#007bff' : '#f1f1f1',
                color: msg.sender === 'user' ? '#fff' : '#000',
                padding: '10px 15px',
                borderRadius: '12px',
                maxWidth: '70%',
                wordWrap: 'break-word',
                textAlign: 'left'
              }}
            >
              <strong>{msg.sender === 'user' ? username : 'DogBot'}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <p><em>DogBot is typing...</em></p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about dogs..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            borderRadius: '10px',
            border: '1px solid #aaa'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            padding: '12px 25px',
            marginLeft: '10px',
            fontSize: '16px',
            borderRadius: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

    
    </div>
  );
};

export default DogChat;
