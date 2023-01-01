import React, { useState, useEffect } from 'react';

const Chat = () => {
  // State to store the messages
  const [messages, setMessages] = useState([]);

  // State to store the input field value
  const [input, setInput] = useState('');

  // Function to add a message to the message store
  const addMessage = (message) => {
    setMessages([...messages, message]);
  };

  // Function to handle user input
  const handleInput = (event) => {
    setInput(event.target.value);
  };

  // Function to send a message when the user submits the form
  const handleSubmit = (event) => {
    event.preventDefault();
    addMessage({
      text: input,
      date: new Date(),
    });
    setInput('');
  };

  // Render the chat window and input field
  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInput} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;