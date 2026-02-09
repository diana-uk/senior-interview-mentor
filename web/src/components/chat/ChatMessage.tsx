import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../../types';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const roleClass = message.role === 'mentor' ? 'chat-message--mentor' : 'chat-message--user';
  const errorClass = message.isError ? 'chat-message--error' : '';
  const roleLabel = message.role === 'mentor' ? 'Mentor' : 'You';

  return (
    <div className={`chat-message ${roleClass} ${errorClass}`}>
      <div className="chat-message__role">{roleLabel}</div>
      <div className="chat-message__content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match && !className;
              if (inline) {
                return <code {...props}>{children}</code>;
              }
              return (
                <SyntaxHighlighter
                  style={vscDarkPlus as Record<string, React.CSSProperties>}
                  language={match?.[1] || 'typescript'}
                  PreTag="div"
                  customStyle={{
                    margin: '8px 0',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
