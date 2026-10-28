import { useState } from 'react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration du chatbot
  const CHATBOT_API_URL = 'http://localhost:3002/api/v1/chat';
  const CHATBOT_API_KEY = 'EjgmM5oxCiBTp4TFIc_Qt-vw4HrmKS0xIP3sr62t8vw';

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const requestBody = {
        message: userMessage
      };

      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CHATBOT_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Chat error: ${response.statusText}`);
      }

      const data = await response.json();

      setConversationId(data.conversationId);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 w-15 h-15 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border-none cursor-pointer shadow-lg flex items-center justify-center text-2xl z-[9999] hover:scale-110 transition-transform"
          style={{ width: '60px', height: '60px' }}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-5 right-5 w-[400px] h-[500px] bg-white rounded-xl shadow-2xl z-[9999] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex justify-between items-center">
            <span className="font-semibold text-base">🤖 Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-none border-none text-white text-xl cursor-pointer px-2 py-1"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-12">
                <p className="text-5xl mb-4">👋</p>
                <p>Bonjour ! Comment puis-je vous aider ?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  } shadow-sm`}
                >
                  <p className="m-0 text-sm leading-relaxed">{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="m-0 text-xs font-semibold mb-1">📚 Sources :</p>
                      {msg.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-purple-600 no-underline mb-0.5"
                        >
                          → {source.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-center text-gray-500 p-4">
                <div className="inline-block animate-bounce">
                  💬
                </div>
                <p className="mt-2 m-0 text-xs">Écriture...</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-none rounded-lg cursor-pointer text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
