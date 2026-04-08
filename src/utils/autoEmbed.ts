/**
 * Analyzes an HTML text and replaces recognizable video/image URLs with 
 * responsive HTML embedded players or image tags.
 */
export function autoEmbedUrls(htmlContent: string): string {
  if (!htmlContent) return '';

  let newHtml = htmlContent;

  // 1. YouTube URLs
  // Extract video ID from <a> tags first to avoid ripping HTML apart
  newHtml = newHtml.replace(/<a[^>]*href=["'](?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>.*?<\/a>/gi, (_, videoId) => {
    return `[YOUTUBE_EMBED:${videoId}]`;
  });

  // Extract video ID from plain urls
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
  newHtml = newHtml.replace(youtubeRegex, (match, videoId) => {
    // Avoid double replacing if it's already an attribute
    if (match.includes('YOUTUBE_EMBED')) return match;
    return `[YOUTUBE_EMBED:${videoId}]`;
  });

  // Inject YouTube IFRAME
  newHtml = newHtml.replace(/\[YOUTUBE_EMBED:([a-zA-Z0-9_-]{11})\]/g, (_, videoId) => {
    return `<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; margin: 24px 0;">
              <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
                      src="https://www.youtube.com/embed/${videoId}" 
                      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
              </iframe>
            </div>`;
  });

  // 2. Direct MP4 URLs
  // Extract from <a> wrapper
  newHtml = newHtml.replace(/<a[^>]*href=["']([^"']+\.mp4(?:\?\S*)?)["'][^>]*>.*?<\/a>/gi, (_, url) => {
    return `[MP4_EMBED:${url}]`;
  });
  
  const mp4Regex = /(https?:\/\/\S+\.mp4(?:\?\S*)?)/gi;
  newHtml = newHtml.replace(mp4Regex, (match, url) => {
    if(newHtml.includes(`src="${url}"`) || newHtml.includes(`MP4_EMBED`)) return match;
    return `[MP4_EMBED:${url}]`;
  });

  newHtml = newHtml.replace(/\[MP4_EMBED:(.*?)\]/g, (_, url) => {
    return `<div style="border-radius: 8px; overflow: hidden; margin: 24px 0;">
              <video width="100%" controls controlsList="nodownload">
                <source src="${url}" type="video/mp4">
                Seu navegador não suporta vídeos.
              </video>
            </div>`;
  });

  // 3. Direct Image URLs (.png, .jpg, .jpeg, .gif, .webp)
  newHtml = newHtml.replace(/<a[^>]*href=["']([^"']+\.(?:png|jpg|jpeg|gif|webp)(?:\?\S*)?)["'][^>]*>.*?<\/a>/gi, (_, url) => {
    return `[IMG_EMBED:${url}]`;
  });

  const imgRegex = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp)(?:\?\S*)?)/gi;
  newHtml = newHtml.replace(imgRegex, (match, url) => {
    if(newHtml.includes(`src="${url}"`) || newHtml.includes(`IMG_EMBED`)) return match;
    return `[IMG_EMBED:${url}]`;
  });

  newHtml = newHtml.replace(/\[IMG_EMBED:(.*?)\]/g, (_, url) => {
    return `<img src="${url}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 24px 0; display: block;" alt="Embedded visual" />`;
  });

  // Clean empty paragraphs that may be left over from removing links
  newHtml = newHtml.replace(/<p>\s*<\/p>/g, '');

  return newHtml;
}
