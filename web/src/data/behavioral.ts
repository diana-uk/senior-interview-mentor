export type BehavioralCategory =
  | 'leadership'
  | 'conflict'
  | 'failure'
  | 'innovation'
  | 'teamwork'
  | 'ambiguity'
  | 'execution'
  | 'growth';

export type CompanyTag =
  | 'amazon'
  | 'google'
  | 'meta'
  | 'apple'
  | 'microsoft'
  | 'general';

export type SeniorityLevel = 'new-grad' | 'mid' | 'senior' | 'staff';

export interface BehavioralQuestion {
  id: string;
  question: string;
  category: BehavioralCategory;
  companies: CompanyTag[];
  levels: SeniorityLevel[];
  followUps: string[];
  tips: string[];
  /** Amazon Leadership Principle this maps to, if applicable */
  amazonLP?: string;
}

export const CATEGORY_META: Record<BehavioralCategory, { label: string; icon: string; color: string }> = {
  leadership: { label: 'Leadership', icon: 'crown', color: 'var(--neon-cyan)' },
  conflict: { label: 'Conflict Resolution', icon: 'swords', color: 'var(--neon-red)' },
  failure: { label: 'Failure & Learning', icon: 'flame', color: 'var(--neon-amber)' },
  innovation: { label: 'Innovation & Creativity', icon: 'lightbulb', color: 'var(--neon-lime)' },
  teamwork: { label: 'Teamwork & Collaboration', icon: 'users', color: 'var(--neon-purple)' },
  ambiguity: { label: 'Dealing with Ambiguity', icon: 'help-circle', color: 'var(--neon-pink)' },
  execution: { label: 'Execution & Delivery', icon: 'rocket', color: 'var(--neon-cyan)' },
  growth: { label: 'Growth & Self-Awareness', icon: 'trending-up', color: 'var(--neon-lime)' },
};

export const COMPANY_META: Record<CompanyTag, { label: string }> = {
  amazon: { label: 'Amazon' },
  google: { label: 'Google' },
  meta: { label: 'Meta' },
  apple: { label: 'Apple' },
  microsoft: { label: 'Microsoft' },
  general: { label: 'General' },
};

// ── Behavioral Question Library (100+ questions) ──

export const behavioralQuestions: BehavioralQuestion[] = [
  // ═══════════════════════════════════════════
  // LEADERSHIP (15 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-l-01',
    question: 'Tell me about a time you led a project from start to finish.',
    category: 'leadership',
    companies: ['general', 'amazon'],
    levels: ['mid', 'senior', 'staff'],
    amazonLP: 'Ownership',
    followUps: [
      'How did you decide on the approach?',
      'What would you do differently?',
      'How did you handle stakeholder communication?',
    ],
    tips: [
      'Quantify the impact (revenue, users, time saved)',
      'Show ownership — you drove it, not just participated',
      'Mention how you handled the inevitable obstacles',
    ],
  },
  {
    id: 'bh-l-02',
    question: 'Describe a time when you had to make a decision without all the information you needed.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Bias for Action',
    followUps: [
      'What information was missing?',
      'What was the outcome?',
      'Would you make the same decision again?',
    ],
    tips: [
      'Emphasize the urgency — why you couldn\'t wait',
      'Show your decision-making framework',
      'Mention risk mitigation strategies',
    ],
  },
  {
    id: 'bh-l-03',
    question: 'Tell me about a time you influenced a team to adopt a technical approach they were initially resistant to.',
    category: 'leadership',
    companies: ['google', 'meta', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did you address their concerns?',
      'Did you compromise on anything?',
      'What was the outcome?',
    ],
    tips: [
      'Show empathy for the opposing viewpoint',
      'Demonstrate data-driven persuasion',
      'Mention building consensus, not forcing decisions',
    ],
  },
  {
    id: 'bh-l-04',
    question: 'Tell me about a time you mentored someone and helped them grow.',
    category: 'leadership',
    companies: ['google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did you identify what they needed?',
      'What approach did you take?',
      'What was the long-term impact?',
    ],
    tips: [
      'Be specific about the growth you enabled',
      'Show that you invested time deliberately',
      'Quantify their improvement if possible',
    ],
  },
  {
    id: 'bh-l-05',
    question: 'Describe a situation where you had to push back on a request from leadership.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Have Backbone; Disagree and Commit',
    followUps: [
      'How did you frame your disagreement?',
      'What was the reaction?',
      'Once a decision was made, how did you proceed?',
    ],
    tips: [
      'Show you pushed back with data, not ego',
      'Demonstrate respect while being firm',
      'Emphasize committing fully once the decision was made',
    ],
  },
  {
    id: 'bh-l-06',
    question: 'Tell me about a time you had to delegate effectively under tight deadlines.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did you decide what to delegate vs do yourself?',
      'How did you ensure quality?',
    ],
    tips: [
      'Show trust in your team',
      'Mention how you tracked progress without micromanaging',
    ],
  },
  {
    id: 'bh-l-07',
    question: 'Give an example of when you set a technical vision for your team.',
    category: 'leadership',
    companies: ['meta', 'google', 'general'],
    levels: ['staff'],
    followUps: [
      'How did you get buy-in?',
      'How did you measure success?',
    ],
    tips: [
      'Staff-level signal: connecting technical decisions to business goals',
      'Show how you communicated the "why"',
    ],
  },
  {
    id: 'bh-l-08',
    question: 'Tell me about a time you had to build a team or restructure a team to achieve a goal.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['staff'],
    amazonLP: 'Hire and Develop the Best',
    followUps: [
      'What skills gaps did you identify?',
      'How did you onboard new members?',
    ],
    tips: [
      'Show strategic thinking about team composition',
      'Mention how you balanced velocity with quality',
    ],
  },
  {
    id: 'bh-l-09',
    question: 'Describe a time when you turned around an underperforming project or team.',
    category: 'leadership',
    companies: ['general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What was the root cause of the underperformance?',
      'What changes did you implement first?',
    ],
    tips: [
      'Show diagnostic skill — identifying the real problem',
      'Demonstrate empathy while driving accountability',
    ],
  },
  {
    id: 'bh-l-10',
    question: 'Tell me about a technical decision you made that had company-wide impact.',
    category: 'leadership',
    companies: ['google', 'meta', 'general'],
    levels: ['staff'],
    followUps: [
      'How did you evaluate the tradeoffs?',
      'Who did you involve in the decision?',
    ],
    tips: [
      'Staff-level signal: broad impact beyond your team',
      'Show cross-functional collaboration',
    ],
  },
  {
    id: 'bh-l-11',
    question: 'Describe when you had to manage competing priorities from different stakeholders.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Customer Obsession',
    followUps: [
      'How did you prioritize?',
      'How did you communicate with stakeholders you deprioritized?',
    ],
    tips: [
      'Use a framework: customer impact, urgency, effort',
      'Show transparency in communication',
    ],
  },
  {
    id: 'bh-l-12',
    question: 'Tell me about a time you stepped up to lead when no one else would.',
    category: 'leadership',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'Why did no one else step up?',
      'What was the outcome?',
    ],
    tips: [
      'Shows initiative — great for junior/mid levels',
      'Focus on the positive outcome from your action',
    ],
  },
  {
    id: 'bh-l-13',
    question: 'How do you handle giving difficult feedback to a peer or report?',
    category: 'leadership',
    companies: ['google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'Give a specific example.',
      'How did they respond?',
      'Did the situation improve?',
    ],
    tips: [
      'Use the SBI model: Situation, Behavior, Impact',
      'Show empathy balanced with directness',
    ],
  },
  {
    id: 'bh-l-14',
    question: 'Tell me about a time you championed a process improvement that others adopted.',
    category: 'leadership',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Invent and Simplify',
    followUps: [
      'How did you measure the improvement?',
      'How did you get adoption?',
    ],
    tips: [
      'Quantify the before/after metrics',
      'Show how you made it easy for others to adopt',
    ],
  },
  {
    id: 'bh-l-15',
    question: 'Describe a time you had to align engineering and product teams on a technical direction.',
    category: 'leadership',
    companies: ['meta', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What was the disagreement?',
      'How did you find common ground?',
    ],
    tips: [
      'Show cross-functional communication skills',
      'Translate technical concepts for non-technical stakeholders',
    ],
  },

  // ═══════════════════════════════════════════
  // CONFLICT RESOLUTION (12 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-c-01',
    question: 'Tell me about a time you had a disagreement with a coworker about a technical approach.',
    category: 'conflict',
    companies: ['general', 'google'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How did you resolve the disagreement?',
      'Were you right or wrong?',
      'What did you learn?',
    ],
    tips: [
      'Never badmouth the other person',
      'Show willingness to consider other viewpoints',
      'Focus on the problem, not the person',
    ],
  },
  {
    id: 'bh-c-02',
    question: 'Describe a situation where you received harsh feedback. How did you respond?',
    category: 'conflict',
    companies: ['general', 'amazon'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'Was the feedback fair?',
      'What changed as a result?',
    ],
    tips: [
      'Show emotional maturity and growth mindset',
      'Demonstrate that you acted on the feedback',
    ],
  },
  {
    id: 'bh-c-03',
    question: 'Tell me about a time two team members were in conflict and you had to mediate.',
    category: 'conflict',
    companies: ['general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What was the root cause?',
      'How did you bring them together?',
    ],
    tips: [
      'Show active listening skills',
      'Focus on finding win-win solutions',
    ],
  },
  {
    id: 'bh-c-04',
    question: 'Describe a time you had to work with someone whose work style was very different from yours.',
    category: 'conflict',
    companies: ['google', 'general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'How did you adapt?',
      'What did you learn from them?',
    ],
    tips: [
      'Show adaptability and respect for diversity',
      'Focus on what you learned, not what annoyed you',
    ],
  },
  {
    id: 'bh-c-05',
    question: 'Tell me about a time you had to say no to a feature request from a powerful stakeholder.',
    category: 'conflict',
    companies: ['amazon', 'meta'],
    levels: ['senior', 'staff'],
    amazonLP: 'Have Backbone; Disagree and Commit',
    followUps: [
      'How did you frame the rejection?',
      'What alternative did you propose?',
    ],
    tips: [
      'Use data to support your position',
      'Always offer alternatives, never just say "no"',
    ],
  },
  {
    id: 'bh-c-06',
    question: 'How do you handle a situation where you fundamentally disagree with your manager\'s direction?',
    category: 'conflict',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Give a specific example.',
      'What happened after you voiced your disagreement?',
    ],
    tips: [
      'Show you disagree respectfully and with evidence',
      'Show you commit once a decision is made',
    ],
  },
  {
    id: 'bh-c-07',
    question: 'Tell me about a time you made a mistake that affected your team. How did you handle it?',
    category: 'conflict',
    companies: ['general', 'amazon'],
    levels: ['new-grad', 'mid', 'senior'],
    amazonLP: 'Earn Trust',
    followUps: [
      'How quickly did you acknowledge the mistake?',
      'What did you do to fix it?',
      'What safeguards did you put in place?',
    ],
    tips: [
      'Take full responsibility — no deflecting',
      'Show what you learned and how you prevented recurrence',
    ],
  },
  {
    id: 'bh-c-08',
    question: 'Describe a time when a project you were working on had conflicting requirements from different teams.',
    category: 'conflict',
    companies: ['meta', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you negotiate between the teams?',
      'What was the final outcome?',
    ],
    tips: [
      'Show stakeholder management skills',
      'Focus on finding the common goal',
    ],
  },
  {
    id: 'bh-c-09',
    question: 'Tell me about a code review where you strongly disagreed with the reviewer\'s feedback.',
    category: 'conflict',
    companies: ['google', 'general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'How did you respond?',
      'Were they right in the end?',
    ],
    tips: [
      'Show openness to feedback',
      'Demonstrate professional communication',
    ],
  },
  {
    id: 'bh-c-10',
    question: 'Describe a situation where team morale was low. What did you do?',
    category: 'conflict',
    companies: ['general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What caused the low morale?',
      'Did your actions help? How did you measure?',
    ],
    tips: [
      'Show emotional intelligence',
      'Demonstrate both empathy and action',
    ],
  },
  {
    id: 'bh-c-11',
    question: 'Tell me about a time you had to deliver bad news to your team or stakeholders.',
    category: 'conflict',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Earn Trust',
    followUps: [
      'How did you prepare?',
      'How did they react?',
    ],
    tips: [
      'Be direct but empathetic',
      'Always come with a plan, not just the problem',
    ],
  },
  {
    id: 'bh-c-12',
    question: 'How have you handled a situation where a teammate was not pulling their weight?',
    category: 'conflict',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Did you address it directly?',
      'What was the outcome?',
    ],
    tips: [
      'Show you addressed it constructively, not passive-aggressively',
      'Focus on helping, not judging',
    ],
  },

  // ═══════════════════════════════════════════
  // FAILURE & LEARNING (13 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-f-01',
    question: 'Tell me about your biggest professional failure.',
    category: 'failure',
    companies: ['general', 'amazon'],
    levels: ['new-grad', 'mid', 'senior', 'staff'],
    followUps: [
      'What caused the failure?',
      'What did you learn?',
      'How has it changed your approach?',
    ],
    tips: [
      'Pick a real failure — not a "humble brag"',
      'Focus 70% on what you learned, 30% on what went wrong',
      'Show growth and self-awareness',
    ],
  },
  {
    id: 'bh-f-02',
    question: 'Describe a time when a project you led did not meet its goals.',
    category: 'failure',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What were the goals?',
      'What went wrong?',
      'What would you change?',
    ],
    tips: [
      'Show accountability — don\'t blame external factors',
      'Demonstrate course correction skills',
    ],
  },
  {
    id: 'bh-f-03',
    question: 'Tell me about a time you shipped a bug to production. What happened?',
    category: 'failure',
    companies: ['general', 'meta'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How quickly did you detect and fix it?',
      'What was the customer impact?',
      'What process changes did you make?',
    ],
    tips: [
      'Show your incident response skills',
      'Emphasize prevention — what you changed to avoid recurrence',
    ],
  },
  {
    id: 'bh-f-04',
    question: 'Describe a time when you had to pivot your approach mid-project.',
    category: 'failure',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Learn and Be Curious',
    followUps: [
      'What triggered the pivot?',
      'How did you communicate the change?',
    ],
    tips: [
      'Show adaptability and pragmatism',
      'Mention how you managed the sunk cost',
    ],
  },
  {
    id: 'bh-f-05',
    question: 'Tell me about a time you underestimated the complexity of a task.',
    category: 'failure',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What did you miss?',
      'How has your estimation improved?',
    ],
    tips: [
      'Show humility and learning',
      'Mention concrete techniques you now use for better estimation',
    ],
  },
  {
    id: 'bh-f-06',
    question: 'Describe a decision you made that you later regretted. What did you learn?',
    category: 'failure',
    companies: ['general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'Would you make a different decision now?',
      'How did the regret manifest?',
    ],
    tips: [
      'Show intellectual honesty',
      'Demonstrate how your decision-making evolved',
    ],
  },
  {
    id: 'bh-f-07',
    question: 'Tell me about a time you received critical feedback on a design document or proposal.',
    category: 'failure',
    companies: ['google', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you incorporate the feedback?',
      'Was the final design better because of it?',
    ],
    tips: [
      'Show receptiveness to feedback',
      'Google values collaborative design processes',
    ],
  },
  {
    id: 'bh-f-08',
    question: 'Describe a time when your team missed a deadline. What was your role?',
    category: 'failure',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Deliver Results',
    followUps: [
      'What caused the delay?',
      'How did you communicate with stakeholders?',
      'What did you change for next time?',
    ],
    tips: [
      'Show accountability, even if it wasn\'t entirely your fault',
      'Amazon cares deeply about delivering results',
    ],
  },
  {
    id: 'bh-f-09',
    question: 'Tell me about a system you designed that didn\'t scale as expected.',
    category: 'failure',
    companies: ['meta', 'google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What were the bottlenecks?',
      'How did you fix it?',
    ],
    tips: [
      'Senior-level signal: thinking about scale from the start',
      'Show your debugging and root cause analysis skills',
    ],
  },
  {
    id: 'bh-f-10',
    question: 'Tell me about a time you chose the wrong technology or tool for a project.',
    category: 'failure',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you realize the mistake?',
      'What was the cost of switching?',
    ],
    tips: [
      'Show your evaluation framework for technology choices',
      'Mention how you balance innovation with pragmatism',
    ],
  },
  {
    id: 'bh-f-11',
    question: 'Describe a time when you had to admit you were wrong in a technical debate.',
    category: 'failure',
    companies: ['general', 'google'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How did you handle it publicly?',
      'What did you learn?',
    ],
    tips: [
      'Show intellectual humility',
      'Emphasize that being right matters more than looking right',
    ],
  },
  {
    id: 'bh-f-12',
    question: 'Tell me about a time you dealt with technical debt that became a serious problem.',
    category: 'failure',
    companies: ['general', 'meta'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did it accumulate?',
      'How did you prioritize paying it down?',
    ],
    tips: [
      'Show strategic thinking about when to take on debt and when to pay it back',
      'Quantify the impact of the debt',
    ],
  },
  {
    id: 'bh-f-13',
    question: 'Tell me about a time when you had to cancel or kill a project. How did you handle it?',
    category: 'failure',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Frugality',
    followUps: [
      'How did you decide it wasn\'t worth continuing?',
      'How did you handle team morale?',
    ],
    tips: [
      'Show pragmatism — knowing when to stop is a strength',
      'Mention how you salvaged learnings or components',
    ],
  },

  // ═══════════════════════════════════════════
  // INNOVATION & CREATIVITY (12 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-i-01',
    question: 'Tell me about the most innovative solution you\'ve designed.',
    category: 'innovation',
    companies: ['general', 'google'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'What made it innovative?',
      'What was the impact?',
    ],
    tips: [
      'Innovation doesn\'t mean complexity — simple creative solutions are valuable',
      'Quantify the impact',
    ],
  },
  {
    id: 'bh-i-02',
    question: 'Describe a time you simplified a complex system or process.',
    category: 'innovation',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Invent and Simplify',
    followUps: [
      'What was the complexity before and after?',
      'What was the impact on the team?',
    ],
    tips: [
      'This is a core Amazon LP — have a strong example ready',
      'Quantify: reduced lines of code, reduced latency, fewer steps',
    ],
  },
  {
    id: 'bh-i-03',
    question: 'Tell me about a time you proactively identified and solved a problem before it became critical.',
    category: 'innovation',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    amazonLP: 'Think Big',
    followUps: [
      'How did you identify the problem?',
      'What would have happened if you hadn\'t acted?',
    ],
    tips: [
      'Show foresight and initiative',
      'Quantify the prevented impact',
    ],
  },
  {
    id: 'bh-i-04',
    question: 'Describe a side project or hack week project that you\'re proud of.',
    category: 'innovation',
    companies: ['google', 'meta', 'general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What motivated you?',
      'Did it get adopted?',
    ],
    tips: [
      'Shows passion and initiative',
      'Bonus points if it solved a real problem',
    ],
  },
  {
    id: 'bh-i-05',
    question: 'Tell me about a time you used data to drive a technical decision.',
    category: 'innovation',
    companies: ['meta', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What data did you collect?',
      'How did you analyze it?',
      'What was the outcome?',
    ],
    tips: [
      'Meta values data-driven decision making heavily',
      'Show the full cycle: hypothesis → data → decision → result',
    ],
  },
  {
    id: 'bh-i-06',
    question: 'How do you stay current with new technologies? Give a recent example of applying something new.',
    category: 'innovation',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How do you evaluate whether a new technology is worth adopting?',
    ],
    tips: [
      'Be specific — name the technology and how you applied it',
      'Show you balance learning with pragmatism',
    ],
  },
  {
    id: 'bh-i-07',
    question: 'Tell me about a time you automated something that was previously done manually.',
    category: 'innovation',
    companies: ['amazon', 'general'],
    levels: ['new-grad', 'mid'],
    amazonLP: 'Invent and Simplify',
    followUps: [
      'How much time did the automation save?',
      'How did you ensure reliability?',
    ],
    tips: [
      'Great for junior/mid — shows initiative',
      'Quantify time saved per week/month',
    ],
  },
  {
    id: 'bh-i-08',
    question: 'Describe a time you proposed a solution that was initially rejected but later accepted.',
    category: 'innovation',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Why was it rejected?',
      'What changed that led to acceptance?',
    ],
    tips: [
      'Show persistence and persuasion skills',
      'Demonstrate that you refined the idea based on feedback',
    ],
  },
  {
    id: 'bh-i-09',
    question: 'Tell me about a time you improved the developer experience for your team.',
    category: 'innovation',
    companies: ['google', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you measure the improvement?',
      'Did the team adopt it?',
    ],
    tips: [
      'DX improvements show you think about team productivity, not just features',
      'Quantify: build time reduction, fewer manual steps',
    ],
  },
  {
    id: 'bh-i-10',
    question: 'Describe a creative approach you took to solve a performance problem.',
    category: 'innovation',
    companies: ['meta', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What were the performance metrics before and after?',
      'What approaches did you consider?',
    ],
    tips: [
      'Show profiling/measurement skills',
      'Explain why your solution was better than obvious alternatives',
    ],
  },
  {
    id: 'bh-i-11',
    question: 'Tell me about a time you built a tool or library that others found valuable.',
    category: 'innovation',
    companies: ['google', 'general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'How did you design the API?',
      'How many teams adopted it?',
    ],
    tips: [
      'Show you think about reusability and developer experience',
      'Mention documentation and onboarding',
    ],
  },
  {
    id: 'bh-i-12',
    question: 'Describe a time you challenged the status quo and proposed a radically different approach.',
    category: 'innovation',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Think Big',
    followUps: [
      'What made you think the status quo was insufficient?',
      'How did you validate your approach?',
    ],
    tips: [
      'Show strategic thinking beyond incremental improvement',
      'Demonstrate calculated risk-taking',
    ],
  },

  // ═══════════════════════════════════════════
  // TEAMWORK & COLLABORATION (13 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-t-01',
    question: 'Tell me about a successful cross-team collaboration you led or participated in.',
    category: 'teamwork',
    companies: ['general', 'meta'],
    levels: ['mid', 'senior'],
    followUps: [
      'What were the challenges of working across teams?',
      'How did you ensure alignment?',
    ],
    tips: [
      'Show communication skills across organizational boundaries',
      'Mention specific coordination mechanisms you used',
    ],
  },
  {
    id: 'bh-t-02',
    question: 'Describe your role in a team that shipped something you\'re proud of.',
    category: 'teamwork',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What was your specific contribution?',
      'How did the team collaborate?',
    ],
    tips: [
      'Balance "we" and "I" — show team spirit AND your contribution',
      'Don\'t take all the credit',
    ],
  },
  {
    id: 'bh-t-03',
    question: 'How do you onboard new team members? Give a specific example.',
    category: 'teamwork',
    companies: ['google', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What resources did you create?',
      'How quickly was the new person productive?',
    ],
    tips: [
      'Show you invest in team growth',
      'Mention concrete artifacts (docs, pair programming sessions)',
    ],
  },
  {
    id: 'bh-t-04',
    question: 'Tell me about a time you helped unblock a teammate who was stuck.',
    category: 'teamwork',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How did you identify they were stuck?',
      'Did you teach them to fish, or just solve it?',
    ],
    tips: [
      'Show helpfulness AND teaching mentality',
      'Mention how you balanced your own work with helping',
    ],
  },
  {
    id: 'bh-t-05',
    question: 'Describe how you work with remote team members effectively.',
    category: 'teamwork',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What tools and practices do you use?',
      'How do you handle time zone differences?',
    ],
    tips: [
      'Show you\'re intentional about async communication',
      'Mention documentation and written communication skills',
    ],
  },
  {
    id: 'bh-t-06',
    question: 'Tell me about a time you had to work with a difficult stakeholder or PM.',
    category: 'teamwork',
    companies: ['meta', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What made them difficult?',
      'How did you build a productive relationship?',
    ],
    tips: [
      'Never speak negatively about the person',
      'Show how you found common ground',
    ],
  },
  {
    id: 'bh-t-07',
    question: 'Describe a time you incorporated input from multiple team members into a design.',
    category: 'teamwork',
    companies: ['google', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you handle conflicting suggestions?',
      'Was the final design better because of it?',
    ],
    tips: [
      'Show you value collaborative design',
      'Demonstrate synthesis skills — combining ideas into something better',
    ],
  },
  {
    id: 'bh-t-08',
    question: 'Tell me about a time you had to coordinate a migration or upgrade across multiple services.',
    category: 'teamwork',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did you plan the rollout?',
      'How did you handle backward compatibility?',
    ],
    tips: [
      'Senior-level signal: cross-service coordination',
      'Show project management skills alongside technical skills',
    ],
  },
  {
    id: 'bh-t-09',
    question: 'How do you ensure knowledge sharing within your team?',
    category: 'teamwork',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Give a specific example of something you documented or shared.',
    ],
    tips: [
      'Mention tech talks, documentation, pair programming, code reviews',
    ],
  },
  {
    id: 'bh-t-10',
    question: 'Tell me about a time you had to collaborate with a team in a different tech stack.',
    category: 'teamwork',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you bridge the knowledge gap?',
      'What did you learn?',
    ],
    tips: [
      'Show learning agility and cross-team communication',
    ],
  },
  {
    id: 'bh-t-11',
    question: 'Describe a time you gave a presentation or tech talk to your team or organization.',
    category: 'teamwork',
    companies: ['google', 'general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'How did you prepare?',
      'What was the audience\'s feedback?',
    ],
    tips: [
      'Shows communication skills and thought leadership',
      'Senior/staff engineers are expected to educate broadly',
    ],
  },
  {
    id: 'bh-t-12',
    question: 'Tell me about a time you provided support to another team during a critical incident.',
    category: 'teamwork',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you get involved?',
      'What was your role during the incident?',
    ],
    tips: [
      'Shows ownership beyond your immediate responsibility',
      'Mention incident response best practices',
    ],
  },
  {
    id: 'bh-t-13',
    question: 'How do you handle code reviews? Describe your approach.',
    category: 'teamwork',
    companies: ['google', 'general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'Give an example of a particularly impactful review you gave.',
      'How do you handle pushback on your review comments?',
    ],
    tips: [
      'Show you view reviews as learning opportunities, not gatekeeping',
      'Mention being constructive and specific',
    ],
  },

  // ═══════════════════════════════════════════
  // AMBIGUITY (12 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-a-01',
    question: 'Tell me about a time you had to start a project with very vague requirements.',
    category: 'ambiguity',
    companies: ['general', 'amazon'],
    levels: ['mid', 'senior'],
    amazonLP: 'Bias for Action',
    followUps: [
      'How did you clarify the requirements?',
      'How did you decide what to build first?',
    ],
    tips: [
      'Show initiative in seeking clarity',
      'Demonstrate iterative approach — ship, learn, refine',
    ],
  },
  {
    id: 'bh-a-02',
    question: 'Describe a situation where priorities changed mid-project. How did you adapt?',
    category: 'ambiguity',
    companies: ['general', 'meta'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you communicate the change?',
      'What did you have to sacrifice?',
    ],
    tips: [
      'Show flexibility and pragmatism',
      'Mention stakeholder communication',
    ],
  },
  {
    id: 'bh-a-03',
    question: 'Tell me about a time you had to make a technical decision with incomplete data.',
    category: 'ambiguity',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Bias for Action',
    followUps: [
      'What was at stake?',
      'How did you de-risk the decision?',
    ],
    tips: [
      'Show your framework for making reversible vs. irreversible decisions',
      'Mention what data you gathered vs. what you estimated',
    ],
  },
  {
    id: 'bh-a-04',
    question: 'How do you approach breaking down a large, undefined problem?',
    category: 'ambiguity',
    companies: ['google', 'general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'Give a specific example.',
      'How did you prioritize the pieces?',
    ],
    tips: [
      'Show structured thinking',
      'Mention creating milestones and checkpoints',
    ],
  },
  {
    id: 'bh-a-05',
    question: 'Tell me about a time you had to choose between multiple technical approaches with no clear winner.',
    category: 'ambiguity',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What criteria did you use?',
      'Were you happy with the choice?',
    ],
    tips: [
      'Show decision-making frameworks (reversibility, risk, time)',
      'Mention prototyping or spike approaches',
    ],
  },
  {
    id: 'bh-a-06',
    question: 'Describe a time when you navigated organizational ambiguity (reorgs, changing leadership, unclear ownership).',
    category: 'ambiguity',
    companies: ['meta', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did it affect your team?',
      'What did you do to provide stability?',
    ],
    tips: [
      'Staff-level signal: operating effectively in organizational chaos',
      'Show you provided clarity for your team',
    ],
  },
  {
    id: 'bh-a-07',
    question: 'Tell me about a time you had to define success metrics for a new feature with no historical data.',
    category: 'ambiguity',
    companies: ['meta', 'google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What proxies did you use?',
      'How did you validate your metrics later?',
    ],
    tips: [
      'Show analytical thinking',
      'Demonstrate comfort with proxy metrics and iteration',
    ],
  },
  {
    id: 'bh-a-08',
    question: 'Describe a situation where the "right" technical solution wasn\'t feasible due to constraints.',
    category: 'ambiguity',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What constraints existed?',
      'What compromise did you reach?',
    ],
    tips: [
      'Show pragmatism — perfect is the enemy of good',
      'Demonstrate clear communication about tradeoffs',
    ],
  },
  {
    id: 'bh-a-09',
    question: 'Tell me about a greenfield project you started. How did you scope the first version?',
    category: 'ambiguity',
    companies: ['amazon', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you decide what to include in V1?',
      'What did you intentionally leave out?',
    ],
    tips: [
      'Show MVP thinking',
      'Mention how you validated assumptions early',
    ],
  },
  {
    id: 'bh-a-10',
    question: 'How do you handle a situation where two senior engineers on your team give you conflicting technical advice?',
    category: 'ambiguity',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'How do you evaluate conflicting opinions?',
      'Give a specific example.',
    ],
    tips: [
      'Great for junior/mid levels — shows maturity',
      'Show you evaluate based on merit, not seniority',
    ],
  },
  {
    id: 'bh-a-11',
    question: 'Tell me about a time you had to build something without a design document.',
    category: 'ambiguity',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How did you manage risk?',
      'Did you create documentation retroactively?',
    ],
    tips: [
      'Show you can operate with imperfect processes',
      'Mention creating structure where none existed',
    ],
  },
  {
    id: 'bh-a-12',
    question: 'Describe a time you had to make a build vs. buy decision.',
    category: 'ambiguity',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Frugality',
    followUps: [
      'What factors did you consider?',
      'Are you happy with the choice in hindsight?',
    ],
    tips: [
      'Show you consider total cost of ownership, not just build time',
      'Mention maintenance burden and opportunity cost',
    ],
  },

  // ═══════════════════════════════════════════
  // EXECUTION & DELIVERY (12 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-e-01',
    question: 'Tell me about the most impactful project you\'ve delivered.',
    category: 'execution',
    companies: ['general', 'amazon'],
    levels: ['mid', 'senior', 'staff'],
    amazonLP: 'Deliver Results',
    followUps: [
      'What was the impact in numbers?',
      'What obstacles did you face?',
    ],
    tips: [
      'Lead with impact metrics',
      'Show the full arc: problem → solution → result',
    ],
  },
  {
    id: 'bh-e-02',
    question: 'Describe a time you had to ship something under an extremely tight deadline.',
    category: 'execution',
    companies: ['amazon', 'general'],
    levels: ['new-grad', 'mid', 'senior'],
    amazonLP: 'Deliver Results',
    followUps: [
      'What did you cut to meet the deadline?',
      'Was the quality sufficient?',
    ],
    tips: [
      'Show you can scope ruthlessly when needed',
      'Mention what you didn\'t sacrifice (quality, testing)',
    ],
  },
  {
    id: 'bh-e-03',
    question: 'Tell me about a time you improved the reliability or performance of a system significantly.',
    category: 'execution',
    companies: ['google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'What were the before/after metrics?',
      'How did you identify the bottlenecks?',
    ],
    tips: [
      'Use specific numbers: latency, uptime, error rates',
      'Show systematic profiling approach',
    ],
  },
  {
    id: 'bh-e-04',
    question: 'How do you approach testing and quality assurance in your projects?',
    category: 'execution',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What types of tests do you write?',
      'How do you decide what to test?',
    ],
    tips: [
      'Show a thoughtful testing strategy, not just "I write unit tests"',
      'Mention the testing pyramid',
    ],
  },
  {
    id: 'bh-e-05',
    question: 'Tell me about a production incident you helped resolve.',
    category: 'execution',
    companies: ['amazon', 'meta', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'What was your role?',
      'How quickly was it resolved?',
      'What was the post-mortem outcome?',
    ],
    tips: [
      'Show calmness under pressure',
      'Mention the post-mortem — shows continuous improvement mindset',
    ],
  },
  {
    id: 'bh-e-06',
    question: 'Describe how you plan and estimate work for a quarter or sprint.',
    category: 'execution',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'How accurate are your estimates typically?',
      'How do you handle scope creep?',
    ],
    tips: [
      'Show you think about risk, dependencies, and buffer',
      'Mention how you communicate timeline changes',
    ],
  },
  {
    id: 'bh-e-07',
    question: 'Tell me about a large refactoring effort you led. How did you manage the risk?',
    category: 'execution',
    companies: ['google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'How did you ensure zero customer impact?',
      'How did you get buy-in to invest in refactoring?',
    ],
    tips: [
      'Show incremental approach — strangler fig, feature flags',
      'Demonstrate risk management skills',
    ],
  },
  {
    id: 'bh-e-08',
    question: 'How do you prioritize between building new features and maintaining existing ones?',
    category: 'execution',
    companies: ['amazon', 'general'],
    levels: ['senior', 'staff'],
    amazonLP: 'Ownership',
    followUps: [
      'Give a specific example of this tradeoff.',
    ],
    tips: [
      'Show strategic thinking about technical debt and business value',
      'Amazon values ownership of operational health',
    ],
  },
  {
    id: 'bh-e-09',
    question: 'Tell me about a time you had to quickly ramp up on a new codebase or domain.',
    category: 'execution',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What strategies did you use?',
      'How quickly were you productive?',
    ],
    tips: [
      'Show effective learning strategies',
      'Mention reading tests, tracing code, and asking targeted questions',
    ],
  },
  {
    id: 'bh-e-10',
    question: 'Describe a feature you shipped end-to-end, from design to production monitoring.',
    category: 'execution',
    companies: ['meta', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Walk me through each phase.',
      'What metrics did you track?',
    ],
    tips: [
      'Show full-stack thinking: design, implementation, testing, deployment, monitoring',
      'Meta values "move fast" — show velocity with quality',
    ],
  },
  {
    id: 'bh-e-11',
    question: 'Tell me about a time you had to balance speed vs. quality.',
    category: 'execution',
    companies: ['general', 'meta'],
    levels: ['mid', 'senior'],
    followUps: [
      'What tradeoffs did you make?',
      'Were you happy with the result?',
    ],
    tips: [
      'Show you understand when each is appropriate',
      'Mention reversible vs. irreversible decisions',
    ],
  },
  {
    id: 'bh-e-12',
    question: 'How do you ensure the systems you build are observable and debuggable?',
    category: 'execution',
    companies: ['amazon', 'google', 'general'],
    levels: ['senior', 'staff'],
    followUps: [
      'Give a specific example of observability saving the day.',
    ],
    tips: [
      'Mention logging, metrics, tracing, alerting',
      'Senior-level signal: thinking about operational excellence from day 1',
    ],
  },

  // ═══════════════════════════════════════════
  // GROWTH & SELF-AWARENESS (13 questions)
  // ═══════════════════════════════════════════
  {
    id: 'bh-g-01',
    question: 'What are your biggest technical strengths and weaknesses?',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How are you working on your weaknesses?',
      'Give an example of each in action.',
    ],
    tips: [
      'Be genuinely honest about weaknesses — not fake ones',
      'Show you have a plan to improve',
    ],
  },
  {
    id: 'bh-g-02',
    question: 'Where do you see your career in 3-5 years?',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'What are you doing now to get there?',
      'IC track or management?',
    ],
    tips: [
      'Be specific but not rigid',
      'Show ambition aligned with the role',
    ],
  },
  {
    id: 'bh-g-03',
    question: 'Tell me about a skill you developed recently. What motivated you?',
    category: 'growth',
    companies: ['amazon', 'general'],
    levels: ['new-grad', 'mid'],
    amazonLP: 'Learn and Be Curious',
    followUps: [
      'How did you learn it?',
      'Have you applied it professionally?',
    ],
    tips: [
      'Show continuous learning mindset',
      'Amazon highly values "Learn and Be Curious"',
    ],
  },
  {
    id: 'bh-g-04',
    question: 'What\'s the most valuable piece of feedback you\'ve ever received?',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How did it change you?',
      'Who gave it to you?',
    ],
    tips: [
      'Shows self-awareness and growth mindset',
      'Pick feedback that genuinely changed your behavior',
    ],
  },
  {
    id: 'bh-g-05',
    question: 'How do you handle burnout or periods of low motivation?',
    category: 'growth',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Give a specific example.',
      'How do you recognize the signs early?',
    ],
    tips: [
      'Show self-awareness and proactive self-care',
      'Mention sustainable work practices',
    ],
  },
  {
    id: 'bh-g-06',
    question: 'What makes you excited about engineering? What gets you out of bed?',
    category: 'growth',
    companies: ['google', 'general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'How does this role align with that passion?',
    ],
    tips: [
      'Be genuine — enthusiasm is infectious',
      'Connect your passion to the role/company',
    ],
  },
  {
    id: 'bh-g-07',
    question: 'Tell me about a time you had to learn a completely unfamiliar technology under pressure.',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'How did you prioritize what to learn?',
      'How quickly were you effective?',
    ],
    tips: [
      'Show you can learn fast and apply immediately',
      'Mention your learning strategy',
    ],
  },
  {
    id: 'bh-g-08',
    question: 'How do you give and receive feedback on your team?',
    category: 'growth',
    companies: ['google', 'general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Give an example of difficult feedback you gave.',
      'How do you ensure psychological safety?',
    ],
    tips: [
      'Google values feedback culture',
      'Show both giving and receiving skills',
    ],
  },
  {
    id: 'bh-g-09',
    question: 'What\'s a technology opinion you held strongly that turned out to be wrong?',
    category: 'growth',
    companies: ['general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'What changed your mind?',
      'How did it affect your decision-making?',
    ],
    tips: [
      'Shows intellectual humility and growth',
      'Pick something substantive, not trivial',
    ],
  },
  {
    id: 'bh-g-10',
    question: 'How do you decide when to go deep on a problem vs. when to move on?',
    category: 'growth',
    companies: ['general'],
    levels: ['mid', 'senior'],
    followUps: [
      'Give an example of each.',
    ],
    tips: [
      'Show time management and prioritization skills',
      'Mention diminishing returns thinking',
    ],
  },
  {
    id: 'bh-g-11',
    question: 'Tell me about a time you had to step outside your comfort zone technically.',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid'],
    followUps: [
      'What was uncomfortable about it?',
      'What did you learn?',
    ],
    tips: [
      'Shows willingness to grow',
      'Focus on the growth, not the discomfort',
    ],
  },
  {
    id: 'bh-g-12',
    question: 'If you could go back and give yourself advice when you started your career, what would it be?',
    category: 'growth',
    companies: ['general'],
    levels: ['mid', 'senior', 'staff'],
    followUps: [
      'Why that specific advice?',
    ],
    tips: [
      'Shows reflection and self-awareness',
      'Keep it genuine and specific',
    ],
  },
  {
    id: 'bh-g-13',
    question: 'What is one area where you know you need to improve as an engineer?',
    category: 'growth',
    companies: ['general'],
    levels: ['new-grad', 'mid', 'senior'],
    followUps: [
      'What are you doing about it?',
      'How does it affect your work today?',
    ],
    tips: [
      'Be genuinely vulnerable — fake answers are obvious',
      'Show a concrete plan for improvement',
    ],
  },
];

// ── Utility functions ──

export function getQuestionsByCategory(category: BehavioralCategory): BehavioralQuestion[] {
  return behavioralQuestions.filter((q) => q.category === category);
}

export function getQuestionsByCompany(company: CompanyTag): BehavioralQuestion[] {
  return behavioralQuestions.filter((q) => q.companies.includes(company));
}

export function getQuestionsByLevel(level: SeniorityLevel): BehavioralQuestion[] {
  return behavioralQuestions.filter((q) => q.levels.includes(level));
}

export function getRandomQuestion(filters?: {
  category?: BehavioralCategory;
  company?: CompanyTag;
  level?: SeniorityLevel;
}): BehavioralQuestion {
  let pool = behavioralQuestions;
  if (filters?.category) pool = pool.filter((q) => q.category === filters.category);
  if (filters?.company) pool = pool.filter((q) => q.companies.includes(filters.company!));
  if (filters?.level) pool = pool.filter((q) => q.levels.includes(filters.level!));
  if (pool.length === 0) pool = behavioralQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const totalBehavioralQuestions = behavioralQuestions.length;
