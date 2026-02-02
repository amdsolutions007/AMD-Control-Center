// Utility to filter posts by publish time
export interface Post {
  id: string;
  title: string;
  content: string;
  publishTime: string;
  tags: string[];
  hook?: string;
  footerType: 'default' | 'state' | 'urgent' | 'ama';
}

export interface Footers {
  default: string;
  state: string;
  urgent: string;
  ama: string;
}

export function getPublishedPosts(posts: Post[]): Post[] {
  const now = new Date();
  return posts.filter(post => {
    const publishDate = new Date(post.publishTime);
    return publishDate <= now;
  }).sort((a, b) => {
    // Sort by publish time, newest first
    return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
  });
}

export function getRandomHook(hooks: string[]): string {
  return hooks[Math.floor(Math.random() * hooks.length)];
}

export function formatFooter(footer: string, tags: string[]): string {
  // If it's a state footer, replace {{STATE}} with the actual state
  const stateTag = tags.find(tag => 
    ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'FCT'].includes(tag)
  );
  
  if (stateTag && footer.includes('{{STATE}}')) {
    return footer.replace(/{{STATE}}/g, stateTag);
  }
  
  return footer;
}

export function buildPostContent(
  post: Post,
  hooks: string[],
  footers: Footers
): string {
  // Get hook (use custom hook or random)
  const hook = post.hook || getRandomHook(hooks);
  
  // Get footer template
  const footerTemplate = footers[post.footerType] || footers.default;
  
  // Format footer with state info if needed
  const footer = formatFooter(footerTemplate, post.tags);
  
  // Combine: hook + title + content + footer
  return `${hook} ${post.title}\n\n${post.content}\n\n${footer}`;
}
