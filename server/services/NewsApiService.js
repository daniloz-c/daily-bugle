const Parser = require('rss-parser');

const parser = new Parser({
  headers: { 'User-Agent': 'DailyBuglePressReader/1.0' },
  timeout: 7000
});

const NYC_NEWS_FEED = 'https://ny1.com/services/contentfeed.nyc%7call-boroughs%7cnews.landing.rss';

function cleanText(value = '') {
  return value.replace(/<[^>]*>/g, '').trim();
}

class NewsApiService {
  /** Fetch local headlines from NY1's New York City all-boroughs RSS feed. */
  static async fetchDailyNews() {
    const feed = await parser.parseURL(NYC_NEWS_FEED);
    if (!Array.isArray(feed.items)) {
      throw new Error('The local NY1 feed did not return a valid list of stories.');
    }

    return feed.items.slice(0, 10).map((item) => {
      const summary = cleanText(item.contentSnippet || item.content || item.summary || item.title || '');
      const imageUrl = item.enclosure?.url || item['media:content']?.url || '';

      return {
        title: cleanText(item.title || 'New York City News'),
        summary: summary.slice(0, 220),
        content: summary,
        source_name: 'NY1',
        source_url: item.link || 'https://ny1.com/nyc/all-boroughs',
        image_url: imageUrl,
        category: 'NEW YORK CITY',
        published_at: item.isoDate || item.pubDate || new Date().toISOString()
      };
    });
  }
}

module.exports = NewsApiService;
