import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown, Bot, User, Settings } from 'lucide-react';
import { sendMessage, getModels, switchModel } from './api';

const Chat = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your financial assistant. I have access to all your bills, debts, and balance. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [activeModel, setActiveModel] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available models on open
  useEffect(() => {
    if (isOpen && models.length === 0) {
      getModels()
        .then(data => setModels(data.models || []))
        .catch(err => console.error('Failed to load models:', err));
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const data = await sendMessage(userMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        model: data.model
      }]);
      if (data.model && !activeModel) setActiveModel(data.model);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Could not reach the assistant. Is Ollama running?' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSwitch = async (model) => {
    try {
      await switchModel(model);
      setActiveModel(model);
      setShowModelPicker(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Switched to ${model}. How can I help?`
      }]);
    } catch (err) {
      console.error('Failed to switch model:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-rose-500 hover:bg-rose-600 rotate-90'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
        }`}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-96 h-[550px] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
        }`}>

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Financial Assistant</p>
                <p className="text-emerald-100 text-xs">{activeModel || 'Loading model...'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
                title="Switch model"
              >
                <Settings size={16} className="text-white" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                <ChevronDown size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Model picker dropdown */}
          {showModelPicker && (
            <div className={`border-b p-3 space-y-1 ${
              darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Switch Model
              </p>
              {models.length === 0 && (
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Loading models...
                </p>
              )}
              {models.map(model => (
                <button
                  key={model}
                  onClick={() => handleModelSwitch(model)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                    activeModel === model
                      ? 'bg-emerald-500 text-white'
                      : darkMode
                        ? 'text-slate-300 hover:bg-slate-600'
                        : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {model} {activeModel === model && '✓'}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-teal-500'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-white" />
                  }
                </div>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-500 text-white rounded-tr-sm'
                    : darkMode
                      ? 'bg-slate-700 text-slate-100 rounded-tl-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`flex gap-2 items-end rounded-xl border p-2 ${
              darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances..."
                rows={1}
                className={`flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed ${
                  darkMode ? 'text-white placeholder-slate-400' : 'text-slate-800 placeholder-slate-400'
                }`}
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white disabled:opacity-40 transition hover:from-emerald-600 hover:to-teal-700 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className={`text-[10px] mt-1.5 text-center ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;