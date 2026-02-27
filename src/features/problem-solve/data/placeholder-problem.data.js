export const PLACEHOLDER_PROBLEM = {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    likes: '12.4K',
    dislikes: '420',
    description: `
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to target</em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p>
<p>You can return the answer in any order.</p>

<div class="mt-8">
<h3 class="text-text-primary text-base font-semibold mb-3">Example 1:</h3>
<div class="bg-black/30 border border-border rounded-lg p-4 font-mono text-sm leading-relaxed text-text-secondary">
    <div><span class="text-text-muted w-16 inline-block">Input:</span><span class="text-text-primary">nums = [2,7,11,15], target = 9</span></div>
    <div><span class="text-text-muted w-16 inline-block">Output:</span><span class="text-text-primary">[0,1]</span></div>
    <div><span class="text-text-muted w-16 inline-block">Expl:</span><span class="text-text-muted">Because nums[0] + nums[1] == 9, we return [0, 1].</span></div>
</div>
</div>

<div class="mt-6">
<h3 class="text-text-primary text-base font-semibold mb-3">Example 2:</h3>
<div class="bg-black/30 border border-border rounded-lg p-4 font-mono text-sm leading-relaxed text-text-secondary">
    <div><span class="text-text-muted w-16 inline-block">Input:</span><span class="text-text-primary">nums = [3,2,4], target = 6</span></div>
    <div><span class="text-text-muted w-16 inline-block">Output:</span><span class="text-text-primary">[1,2]</span></div>
</div>
</div>
    `,
    constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
    ],
    topics: ['Array', 'Hash Table'],
    defaultCode: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
}
