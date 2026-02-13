import type { PatternName } from '../../types';
import { type FullProblem } from './helpers';

export const stackProblems: FullProblem[] = [
  {
    group: 'Stack',
    id: 'sk-1',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    pattern: 'HashMap' as PatternName,
    description:
      'Given a string `s` containing just the characters `\'(\'`, `\')\'`, `\'{\'`, `\'}\'`, `\'[\'` and `\']\'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      'Input: s = "()"\nOutput: true',
      'Input: s = "()[]{}"\nOutput: true',
      'Input: s = "(]"\nOutput: false',
      'Input: s = "([)]"\nOutput: false',
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCode: `function isValid(s: string): boolean {\n  // Your solution here\n  \n}`,
    testCases: [
      { input: 'isValid("()")', expected: 'true' },
      { input: 'isValid("()[]{}")', expected: 'true' },
      { input: 'isValid("(]")', expected: 'false' },
      { input: 'isValid("([)]")', expected: 'false' },
    ],
  },
];
