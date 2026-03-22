import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "./ChatPanel.css";

export default function ChatPanel({ docId, token }) {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 🔥 AUTO-SCROLL TO BOTTOM
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  // 🔥 NORMALIZE RESPONSE - HANDLES ALL FORMATS
  const extractAnswer = (data) => {
    let answer = "No response received";

    if (data?.status === "success" && data?.data?.answer) {
      // Handle: { status: "success", data: { answer: { answer: "text" } } }
      const answerObj = data.data.answer;
      if (typeof answerObj === 'object' && answerObj?.answer) {
        answer = answerObj.answer;
      } else if (typeof answerObj === 'string') {
        answer = answerObj;
      }
    } else if (typeof data?.answer === "string") {
      // Handle: { answer: "text" }
      answer = data.answer;
    } else if (typeof data?.data === "string") {
      // Handle: { data: "text" }
      answer = data.data;
    } else if (typeof data === "string") {
      // Handle: "text"
      answer = data;
    } else if (data?.error) {
      // Handle: { error: "message" }
      answer = `❌ Error: ${data.error}`;
    }

    return answer;
  };

  const askQuestion = async () => {
    if (!question.trim() || !docId || loading) return;

    const userQuestion = question.trim();
    setQuestion("");
    setLoading(true);

    // Add user message immediately
    setChat((prev) => [...prev, { type: "user", text: userQuestion, timestamp: new Date() }]);

    try {
      const res = await fetch("http://localhost:8000/api/analysis/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_id: docId,
          question: userQuestion,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("ASK RESPONSE:", data);

      // Extract answer using normalization
      const answer = extractAnswer(data);
      
      setChat((prev) => [...prev, { 
        type: "ai", 
        text: answer, 
        timestamp: new Date(),
        isError: answer.includes("❌") || answer.includes("Error")
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setChat((prev) => [
        ...prev,
        { 
          type: "ai", 
          text: `❌ Failed to get response: ${err.message}`,
          timestamp: new Date(),
          isError: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>💬 AI Assistant</h3>
        <p className="chat-subtitle">Ask questions about your document</p>
      </div>

      <div className="chat-box">
        {chat.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">💡</div>
            <p>Ask any question about your document</p>
            <small>Example: "What are the main requirements?"</small>
            <div className="suggestion-pills">
              <button 
                className="suggestion-pill"
                onClick={() => setQuestion("What are the key provisions?")}
              >
                Key Provisions
              </button>
              <button 
                className="suggestion-pill"
                onClick={() => setQuestion("Who does this affect?")}
              >
                Who is affected?
              </button>
              <button 
                className="suggestion-pill"
                onClick={() => setQuestion("What are the requirements?")}
              >
                Requirements
              </button>
            </div>
          </div>
        ) : (
          <>
            {chat.map((msg, i) => (
              <div key={i} className={`chat-msg-wrapper ${msg.type}`}>
                <div className={`chat-msg ${msg.type} ${msg.isError ? 'error' : ''}`}>
                  <div className="msg-content">
                    {msg.isError && <FaExclamationCircle className="msg-icon error" />}
                    {!msg.isError && msg.type === "ai" && <FaCheckCircle className="msg-icon success" />}
                    <div className="msg-text">
                      {msg.text}
                    </div>
                  </div>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </>
        )}

        {loading && (
          <div className="chat-msg-wrapper ai">
            <div className="chat-msg ai typing">
              <div className="msg-content">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about document... (Shift+Enter for new line)"
            onKeyDown={handleKeyDown}
            disabled={loading || !docId}
            maxLength={1000}
            type="text"
          />
          <div className="input-actions">
            <span className="char-count">{question.length}/1000</span>
            <button 
              onClick={askQuestion}
              disabled={loading || !question.trim() || !docId}
              className="send-btn"
              title="Send message"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </div>
        {!docId && (
          <div className="input-notice">
            ⚠️ Please upload a document to ask questions
          </div>
        )}
      </div>
    </div>
  );
}