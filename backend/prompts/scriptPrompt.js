export function buildPrompt(data){

return `
You are a viral content strategist.

Create a short-form video script.

Context:

Niche: ${data.niche}
Audience: ${data.audience}
Platform: ${data.platform}
Goal: ${data.goal}
Video style: ${data.style}

Return:

1. Hook
2. Script
3. Visual ideas
4. CTA
5. Title
6. Hashtags
`
}