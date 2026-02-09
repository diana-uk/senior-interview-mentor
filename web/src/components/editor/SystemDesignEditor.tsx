import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SystemDesignTopicId } from '../../types';

interface SystemDesignEditorProps {
  value: string;
  onChange: (value: string) => void;
  topicId: SystemDesignTopicId;
}

interface Section {
  id: string;
  icon: string;
  title: string;
  step: number;
  hint: string;
}

const sections: Section[] = [
  {
    id: 'requirements',
    icon: 'checklist',
    title: 'Requirements & Scope',
    step: 1,
    hint: 'Start here. Clarify what the interviewer expects before designing anything.',
  },
  {
    id: 'api',
    icon: 'api',
    title: 'API Design',
    step: 2,
    hint: 'Define the contract between client and server. RESTful endpoints, request/response shapes.',
  },
  {
    id: 'data',
    icon: 'database',
    title: 'Data Model & Storage',
    step: 3,
    hint: 'Schema design, database choice (SQL vs NoSQL), indexing strategy, partitioning.',
  },
  {
    id: 'architecture',
    icon: 'account_tree',
    title: 'High-Level Architecture',
    step: 4,
    hint: 'Describe the system components and how data flows between them.',
  },
  {
    id: 'deepdive',
    icon: 'bolt',
    title: 'Deep Dives & Bottlenecks',
    step: 5,
    hint: 'Pick 2-3 areas to go deep. Show tradeoffs, not just solutions.',
  },
  {
    id: 'scaling',
    icon: 'monitoring',
    title: 'Scaling & Reliability',
    step: 6,
    hint: 'How does this handle 10x/100x traffic? What breaks first? How do you monitor it?',
  },
];

type PlaceholderSet = Record<string, string>;

const placeholdersByTopic: Record<SystemDesignTopicId, PlaceholderSet> = {
  'url-shortener': {
    requirements: '- Functional: Shorten URLs, redirect, analytics\n- Non-functional: Low-latency redirects (<100ms), 99.9% uptime\n- Scale: 100M URLs created/month, 10:1 read/write ratio\n- Out of scope: User accounts, paid tiers',
    api: 'POST /api/shorten\n  body: { url: string, customAlias?: string }\n  response: { shortUrl: string, expiresAt: string }\n\nGET /:shortCode\n  response: 301 redirect to original URL\n\nGET /api/stats/:shortCode\n  response: { clicks: number, createdAt: string }',
    data: 'Table: urls\n  id: UUID (PK)\n  short_code: VARCHAR(8) UNIQUE INDEX\n  original_url: TEXT\n  created_at: TIMESTAMP\n  expires_at: TIMESTAMP\n  click_count: BIGINT\n\nStorage: PostgreSQL for structured data, Redis for hot URL caching',
    architecture: '[Client] → [Load Balancer] → [API Servers]\n                                   ↓\n                            [Redis Cache]\n                                   ↓\n                            [PostgreSQL]\n                                   ↓\n                    [Analytics Queue → Worker]',
    deepdive: '- Short code generation: Base62 encoding vs random\n  Tradeoff: sequential = predictable, random = needs collision check\n- Caching: Write-through for new URLs, LRU eviction, TTL = 24h\n- Rate limiting: Token bucket per user, 100 req/min\n- Analytics: Async via Kafka → ClickHouse',
    scaling: '- Horizontal: Stateless API servers behind ALB\n- Database: Read replicas, sharding by short_code hash\n- Cache: Redis cluster with consistent hashing\n- CDN: Cache 301 redirects at edge\n- Monitoring: P99 latency, error rate, cache hit ratio',
  },
  'twitter-timeline': {
    requirements: '- Functional: Post tweets, follow users, view home timeline\n- Non-functional: Timeline load <200ms, eventual consistency OK\n- Scale: 500M users, 600M tweets/day, avg 300 followers\n- Out of scope: DMs, search, trending',
    api: 'POST /api/tweets\n  body: { content: string, mediaIds?: string[] }\n  response: { tweetId: string, createdAt: string }\n\nGET /api/timeline?cursor=<id>&limit=20\n  response: { tweets: Tweet[], nextCursor: string }\n\nPOST /api/follow\n  body: { userId: string }',
    data: 'Tables:\n  users: id, handle, name, follower_count\n  tweets: id, user_id, content, created_at, like_count\n  follows: follower_id, followee_id, created_at\n  timeline_cache: user_id, tweet_id, score\n\nStorage: Cassandra for timeline, PostgreSQL for users, Redis for hot timelines',
    architecture: '[Client] → [API Gateway] → [Tweet Service]\n                            → [Timeline Service]\n                            → [Fan-out Service]\n                                   ↓\n                          [Message Queue (Kafka)]\n                                   ↓\n                    [Timeline Workers → Cache (Redis)]',
    deepdive: '- Fan-out on write vs fan-out on read\n  Hybrid: write for normal users, read for celebrities (>1M followers)\n- Timeline ranking: Chronological vs ML-scored relevance\n- Media handling: Separate media service with CDN\n- Celebrity problem: Lazy-load their tweets at read time',
    scaling: '- Partition timelines by user_id hash\n- Cache hot timelines in Redis (top 800 tweets)\n- Separate read/write paths\n- Rate limit posting (tweets/min per user)\n- Monitoring: fan-out latency, timeline cache hit rate, P99 load time',
  },
  'notification-system': {
    requirements: '- Functional: Push, email, SMS notifications; user preferences\n- Non-functional: Delivery <30s for push, at-least-once delivery\n- Scale: 100M users, 1B notifications/day\n- Out of scope: In-app notification center, notification grouping',
    api: 'POST /api/notifications/send\n  body: { userId: string, type: "push"|"email"|"sms",\n          template: string, data: object, priority: 1-5 }\n\nGET /api/notifications/preferences/:userId\nPUT /api/notifications/preferences/:userId\n  body: { channels: { push: bool, email: bool, sms: bool },\n          quietHours: { start: string, end: string } }',
    data: 'Tables:\n  notifications: id, user_id, channel, template, status, created_at\n  user_preferences: user_id, channel_settings, quiet_hours\n  templates: id, name, subject, body_template\n  delivery_log: notification_id, attempt, status, provider_response\n\nStorage: PostgreSQL for preferences, Cassandra for notification log',
    architecture: '[Trigger Service] → [Priority Queue (Kafka)]\n                          ↓\n              [Notification Router]\n              /        |        \\\n     [Push Worker] [Email Worker] [SMS Worker]\n         ↓              ↓             ↓\n     [APNs/FCM]   [SendGrid]    [Twilio]',
    deepdive: '- Deduplication: Idempotency keys per (user, event, channel)\n- Rate limiting: Per-user and per-channel throttling\n- Priority queues: Critical (password reset) > High (purchase) > Low (marketing)\n- Retry strategy: Exponential backoff with dead letter queue\n- Template rendering: Server-side with i18n support',
    scaling: '- Partition queues by priority level\n- Separate worker pools per channel\n- Circuit breaker for third-party providers (APNs, Twilio)\n- Fallback: SMS → push if email bounces\n- Monitoring: delivery rate, latency by channel, bounce rate',
  },
  'rate-limiter': {
    requirements: '- Functional: Enforce request limits per user/IP/API key\n- Non-functional: <1ms overhead per request, distributed\n- Scale: 10M req/sec across 100+ API servers\n- Out of scope: Billing, API key management',
    api: 'Internal middleware API:\n\ncheckRateLimit(key: string, rule: RateLimitRule): RateLimitResult\n  → { allowed: boolean, remaining: number,\n      retryAfter?: number, limit: number }\n\nResponse headers:\n  X-RateLimit-Limit: 100\n  X-RateLimit-Remaining: 42\n  X-RateLimit-Reset: 1672531200\n  Retry-After: 30 (when 429)',
    data: 'Redis data structures:\n  Fixed window: INCR rate:{key}:{window}\n  Sliding window: ZADD rate:{key} {timestamp} {request_id}\n  Token bucket: HASH rate:{key} {tokens, last_refill}\n  Leaky bucket: LIST rate:{key}\n\nConfig store (PostgreSQL):\n  rate_rules: id, path_pattern, limit, window_seconds, key_type',
    architecture: '[API Gateway] → [Rate Limit Middleware]\n                       ↓\n              [Redis Cluster]\n              (shared counter state)\n                       ↓\n         [Config Service (rules DB)]',
    deepdive: '- Algorithm comparison:\n  Fixed window: simple but allows bursts at boundary\n  Sliding window log: precise but memory-heavy\n  Sliding window counter: good balance\n  Token bucket: smooth rate, configurable burst\n- Distributed sync: Redis MULTI/EXEC for atomicity\n- Race conditions: Lua scripting for atomic check-and-increment\n- Local caching: In-memory token bucket with periodic Redis sync',
    scaling: '- Redis cluster with hash-based key sharding\n- Local rate limiter + distributed backup (hybrid approach)\n- Graceful degradation: allow requests when Redis is down\n- Multi-region: Sync counters across regions or accept imprecision\n- Monitoring: false positive rate, Redis latency, rule effectiveness',
  },
  'file-storage': {
    requirements: '- Functional: Upload/download files, sync across devices, sharing\n- Non-functional: 99.99% durability, upload resume for large files\n- Scale: 500M users, 50PB storage, avg file 1MB\n- Out of scope: Real-time collaboration, version history',
    api: 'POST /api/files/upload-init\n  body: { fileName: string, size: number, checksum: string }\n  response: { uploadId: string, chunkSize: number, uploadUrls: string[] }\n\nPUT /api/files/chunks/:uploadId/:chunkIndex\n  body: binary chunk data\n\nPOST /api/files/upload-complete/:uploadId\n\nGET /api/files/:fileId/download\n  response: 302 redirect to signed S3 URL\n\nGET /api/sync?cursor=<timestamp>\n  response: { changes: FileChange[], nextCursor: string }',
    data: 'Tables:\n  files: id, user_id, name, size, checksum, storage_key, created_at\n  chunks: file_id, index, checksum, storage_key, uploaded\n  shares: file_id, shared_with, permission, created_at\n  sync_log: user_id, file_id, action, timestamp\n\nStorage: S3 for file chunks, PostgreSQL for metadata, Redis for upload sessions',
    architecture: '[Client App] → [API Gateway] → [Metadata Service]\n                                → [Upload Service]\n                                        ↓\n                              [Chunk Manager]\n                                        ↓\n                              [Object Storage (S3)]\n                                        ↓\n                      [Sync Service ← WebSocket Notifications]',
    deepdive: '- Chunked uploads: 4MB chunks, parallel upload, resume support\n- Deduplication: Content-addressable storage (SHA-256 hash)\n  Same file = same chunks = stored once\n- Sync conflict resolution: Last-writer-wins or merge strategies\n- Delta sync: Only upload changed blocks, not entire file\n- Sharing: Pre-signed URLs with expiry for downloads',
    scaling: '- S3 for virtually unlimited storage with 11 nines durability\n- CDN for frequently accessed files\n- Partition metadata by user_id\n- Background workers for dedup, virus scanning, thumbnail generation\n- Monitoring: upload success rate, sync latency, storage growth rate',
  },
  'chat-application': {
    requirements: '- Functional: 1:1 chat, group chat, presence, message history\n- Non-functional: Message delivery <500ms, at-least-once delivery\n- Scale: 100M DAU, avg 40 messages/user/day, groups up to 500\n- Out of scope: Voice/video calls, message reactions, file sharing',
    api: 'WebSocket events:\n  client → server: { type: "send", chatId, content, clientMsgId }\n  server → client: { type: "message", chatId, from, content, timestamp, msgId }\n  server → client: { type: "ack", clientMsgId, msgId, status }\n  server → client: { type: "presence", userId, status: "online"|"offline" }\n\nREST:\n  GET /api/chats/:chatId/messages?before=<msgId>&limit=50\n  POST /api/chats (create group)\n  GET /api/chats (list user\'s chats)',
    data: 'Tables:\n  messages: id, chat_id, sender_id, content, timestamp, status\n  chats: id, type (1:1|group), name, created_at\n  chat_members: chat_id, user_id, joined_at, last_read_msg_id\n  presence: user_id, status, last_seen, server_id\n\nStorage: Cassandra for messages (partitioned by chat_id), Redis for presence/sessions',
    architecture: '[Client] ←WebSocket→ [WS Gateway Cluster]\n                              ↓\n                     [Message Router]\n                     /       ↓        \\\n             [Chat Service] [Presence] [Push]\n                     ↓\n           [Message Queue (Kafka)]\n                     ↓\n           [Storage Workers → Cassandra]',
    deepdive: '- WebSocket management: Sticky sessions or connection registry in Redis\n- Message ordering: Lamport timestamps or server-assigned sequence IDs\n- Delivery guarantees: Client ACK + retry, store-and-forward for offline\n- Group fan-out: Push to all online members via WS gateway lookup\n- Read receipts: Aggregate last_read pointer per user per chat',
    scaling: '- WS gateway: Horizontal scaling with connection registry\n- Message partitioning by chat_id in Cassandra\n- Presence: Heartbeat-based with Redis TTL keys\n- Group messages: Fan-out via Kafka consumer groups\n- Monitoring: WS connection count, message delivery latency, offline queue depth',
  },
  custom: {
    requirements: '- Functional: What must the system do? Core features.\n- Non-functional: Latency, throughput, availability targets\n- Scale: Users, requests/sec, data volume\n- Out of scope: What are we NOT building?',
    api: 'Define your endpoints and contracts:\n\nPOST /api/...\n  body: { ... }\n  response: { ... }\n\nGET /api/...\n  response: { ... }',
    data: 'Define your data model:\n\nTable: ...\n  id: UUID (PK)\n  ...\n\nStorage choice: SQL vs NoSQL, caching layer',
    architecture: 'Describe the system components and data flow:\n\n[Client] → [Load Balancer] → [API Servers]\n                                   ↓\n                            [Database]\n                                   ↓\n                          [Message Queue → Workers]',
    deepdive: '- Identify 2-3 interesting technical challenges\n- For each: describe the problem, compare approaches, pick one and justify\n- Discuss tradeoffs explicitly',
    scaling: '- Horizontal scaling strategy\n- Database scaling (replicas, sharding)\n- Caching strategy\n- Monitoring and alerting\n- Failure modes and recovery',
  },
};

export default function SystemDesignEditor({ value, onChange, topicId }: SystemDesignEditorProps) {
  const parsed = parseSections(value);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const placeholders = placeholdersByTopic[topicId] || placeholdersByTopic['custom'];

  function parseSections(raw: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!raw) return result;

    let currentSection = '';
    const lines = raw.split('\n');

    for (const line of lines) {
      const sectionMatch = line.match(/^## \[(\w+)\]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        result[currentSection] = '';
      } else if (currentSection) {
        result[currentSection] = (result[currentSection] || '') + (result[currentSection] ? '\n' : '') + line;
      }
    }
    return result;
  }

  function serializeSections(data: Record<string, string>): string {
    return sections
      .map((s) => `## [${s.id}]\n${data[s.id] || ''}`)
      .join('\n\n');
  }

  function handleSectionChange(sectionId: string, content: string) {
    const updated = { ...parsed, [sectionId]: content };
    onChange(serializeSections(updated));
  }

  function toggleCollapse(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const filledCount = sections.filter((s) => (parsed[s.id] || '').trim().length > 0).length;

  return (
    <div className="sd-editor">
      {/* Header with progress */}
      <div className="sd-editor__header">
        <div className="sd-editor__header-top">
          <div>
            <div className="sd-editor__title">System Design Workspace</div>
            <div className="sd-editor__subtitle">
              Fill out each section below. Describe components, data flow, and tradeoffs in plain text.
            </div>
          </div>
          <div className="sd-editor__progress">
            <div className="sd-editor__progress-label">{filledCount}/{sections.length} sections</div>
            <div className="sd-editor__progress-track">
              <div
                className="sd-editor__progress-fill"
                style={{ width: `${(filledCount / sections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="sd-editor__sections">
        {sections.map((section) => {
          const isCollapsed = collapsed[section.id];
          const content = parsed[section.id] || '';
          const hasContent = content.trim().length > 0;

          return (
            <div key={section.id} className={`sd-section ${hasContent ? 'sd-section--filled' : ''}`}>
              <div
                className="sd-section__header"
                onClick={() => toggleCollapse(section.id)}
              >
                <div className="sd-section__left">
                  <div className={`sd-section__step ${hasContent ? 'sd-section__step--done' : ''}`}>
                    {hasContent ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                    ) : (
                      section.step
                    )}
                  </div>
                  <span className={`material-symbols-outlined sd-section__icon ${hasContent ? 'sd-section__icon--filled' : ''}`}>
                    {section.icon}
                  </span>
                  <span className="sd-section__title">{section.title}</span>
                </div>
                <div className="sd-section__right">
                  {hasContent && <span className="sd-section__badge">filled</span>}
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {!isCollapsed && (
                <div className="sd-section__body">
                  <div className="sd-section__hint">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                    {section.hint}
                  </div>
                  <textarea
                    className="sd-section__textarea"
                    value={content}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    placeholder={placeholders[section.id] || ''}
                    rows={10}
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
