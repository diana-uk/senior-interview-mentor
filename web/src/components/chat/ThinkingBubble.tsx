export default function ThinkingBubble() {
  return (
    <div className="message message-mentor message-enter" role="status" aria-label="Mentor is thinking">
      <div className="message-header">
        <div className="avatar avatar-sm avatar-mentor">M</div>
      </div>
      <div className="message-content thinking-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="thinking-label">Thinking...</span>
      </div>
    </div>
  );
}
