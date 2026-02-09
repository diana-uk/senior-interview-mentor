/**
 * Longest Substring Without Repeating Characters
 *
 * Given a string s, find the length of the longest substring
 * without repeating characters.
 *
 * Pattern: Sliding Window
 * Time: O(n)
 * Space: O(min(n, m)) where m is charset size
 */

export function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    // Shrink window while we have duplicates
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left++;
    }

    // Expand window
    seen.add(s[right]);

    // Update result
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}
