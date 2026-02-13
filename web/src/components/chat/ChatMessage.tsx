import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  isNew?: boolean;
}

export default function ChatMessageItem({ message, isNew }: ChatMessageItemProps) {
  const roleClass = message.role === 'mentor' ? 'message-mentor' : 'message-user';
  const errorClass = message.isError ? 'message-error' : '';
  const animationClass = isNew ? 'message-enter' : '';
  const roleLabel = message.role === 'mentor' ? 'M' : 'Y';

  return (
    <div className={`message ${roleClass} ${errorClass} ${animationClass}`}>
      <div className="message-header">
        <div className={`avatar avatar-sm ${message.role === 'mentor' ? 'avatar-mentor' : 'avatar-user'}`}>
          {roleLabel}
        </div>
        <span className="message-time">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="message-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const inline = !match && !className;
              if (inline) {
                return <code className="code-inline" {...props}>{children}</code>;
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
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-deep)',
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
