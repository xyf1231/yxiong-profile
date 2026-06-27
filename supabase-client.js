// Supabase client for xyfoptics website
// Online mode: fetches from Supabase API
// Offline mode: falls back to window.DEFAULT_SITE_DATA (data.js)

// TEMPORARY: Force offline mode due to Supabase encoding issue (data stored as mojibake)
const SUPABASE_URL = 'https://lmmkxikbhnorwliimnvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbWt4aWtiaG5vcndsaWltbnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODE3NzAsImV4cCI6MjA5ODA1Nzc3MH0.pYDqsKi0bNrE2YkvLw38E3zH8w_v4-TcTkAJKh0MhSM';
const STORAGE_BUCKET = 'assets';
const PAPERS_BUCKET = 'papers';

// Storage CDN base URL
const STORAGE_CDN = `${SUPABASE_URL}/storage/v1/object/public`;

// Check if we're in file:// mode (offline/local)
const IS_FILE_PROTOCOL = window.location.protocol === 'file:';
const IS_LOCALHOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// FORCE OFFLINE: Supabase data has encoding issues (mojibake Chinese characters)
const USE_OFFLINE = true;

// Supabase REST API helper
async function supabaseFetch(table, options = {}) {
  const { select = '*', order = null, limit = null, eq = null } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
  if (order) url += `&order=${order}`;
  if (limit) url += `&limit=${limit}`;
  if (eq) url += `&${eq.column}=eq.${encodeURIComponent(eq.value)}`;

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });

  if (!response.ok) {
    console.warn(`Supabase fetch failed for ${table}:`, response.status, await response.text());
    return null;
  }
  return await response.json();
}

// Convert database row to data.js format
function normalizeProfile(row) {
  return {
    nameCn: row.name_cn,
    nameEn: row.name_en,
    initials: row.initials,
    title: row.title,
    subtitle: row.subtitle,
    affiliation: row.affiliation,
    email: row.email,
    phone: row.phone,
    photo: row.photo_url,
    bio: row.bio,
    focus: row.focus
  };
}

function normalizePublication(row) {
  return {
    year: row.year,
    title: row.title,
    titleZh: row.title_zh,
    authors: row.authors,
    venue: row.venue,
    venueZh: row.venue_zh,
    date: row.date,
    impact: row.impact,
    image: row.image_url,
    url: row.url
  };
}

function normalizeNewsItem(row) {
  return {
    date: row.date,
    title: row.title,
    titleEn: row.title_en,
    text: row.text,
    textEn: row.text_en,
    image: row.image_url,
    url: row.url
  };
}

function normalizeProject(row) {
  return {
    title: row.title,
    text: row.text,
    image: row.image_url,
    url: row.url
  };
}

function normalizeAchievement(row) {
  return {
    type: row.type,
    year: row.year,
    title: row.title,
    detail: row.detail
  };
}

function normalizeExperience(row) {
  return {
    period: row.period,
    title: row.title,
    text: row.text
  };
}

function normalizeContact(row) {
  return {
    label: row.label,
    value: row.value,
    url: row.url
  };
}

function normalizeResearch(row) {
  return {
    title: row.title,
    text: row.text
  };
}

function normalizeMetric(row) {
  return {
    label: row.label,
    value: row.value
  };
}

function normalizeNewsDetail(row) {
  return {
    slug: row.slug,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image_url,
    contentHtml: row.content_html,
    content: row.content,
    paperTitle: row.paper_title,
    journal: row.journal,
    authors: row.authors,
    correspondingAuthors: row.corresponding_authors,
    affiliation: row.affiliation,
    doi: row.doi,
    pdf: row.pdf_url
  };
}

// Main data fetcher
async function fetchSiteData() {
  // If offline, use data.js fallback
  if (USE_OFFLINE) {
    console.log('[Supabase] Offline mode — using data.js');
    return window.DEFAULT_SITE_DATA;
  }

  console.log('[Supabase] Online mode — fetching from Supabase');

  try {
    const [
      profiles, metrics, research, news, newsDetails,
      publications, allPublications, projects, achievements, experiences, contacts
    ] = await Promise.all([
      supabaseFetch('profiles', { limit: 1 }),
      supabaseFetch('metrics', { order: 'display_order' }),
      supabaseFetch('research_areas', { order: 'display_order' }),
      supabaseFetch('news_items', { order: 'display_order' }),
      supabaseFetch('news_details', { limit: 1 }),
      supabaseFetch('publications', { order: 'display_order' }),
      supabaseFetch('all_publications', { order: 'display_order' }),
      supabaseFetch('projects', { order: 'display_order' }),
      supabaseFetch('achievements', { order: 'display_order' }),
      supabaseFetch('experiences', { order: 'display_order' }),
      supabaseFetch('contacts', { order: 'display_order' })
    ]);

    // If any fetch failed, fallback to data.js
    if (!profiles || !publications) {
      console.warn('[Supabase] Some fetches failed, falling back to data.js');
      return window.DEFAULT_SITE_DATA;
    }

    const profile = profiles.length > 0 ? normalizeProfile(profiles[0]) : window.DEFAULT_SITE_DATA.profile;

    // Convert image URLs: if relative, prepend CDN; if already full URL, keep as is
    const toCdnUrl = (path) => {
      if (!path) return path;
      if (path.startsWith('http')) return path;
      if (path.startsWith('assets/')) return `${STORAGE_CDN}/${STORAGE_BUCKET}/${path.replace('assets/', '')}`;
      return path;
    };

    const toPaperUrl = (path) => {
      if (!path) return path;
      if (path.startsWith('http')) return path;
      if (path.startsWith('papers/')) return `${STORAGE_CDN}/${PAPERS_BUCKET}/${path.replace('papers/', '')}`;
      return path;
    };

    // Apply CDN URLs to profile photo
    profile.photo = toCdnUrl(profile.photo);

    const normalizedPublications = (publications || []).map(p => {
      const np = normalizePublication(p);
      np.image = toCdnUrl(np.image);
      return np;
    });

    const normalizedNews = (news || []).map(n => {
      const nn = normalizeNewsItem(n);
      nn.image = toCdnUrl(nn.image);
      return nn;
    });

    const normalizedProjects = (projects || []).map(p => {
      const np = normalizeProject(p);
      np.image = toCdnUrl(np.image);
      return np;
    });

    const normalizedNewsDetails = (newsDetails || []).map(d => {
      const nd = normalizeNewsDetail(d);
      nd.image = toCdnUrl(nd.image);
      nd.pdf = toPaperUrl(nd.pdf);
      return nd;
    });

    return {
      version: 'supabase-v1.0',
      profile: profile,
      metrics: (metrics || []).map(normalizeMetric),
      research: (research || []).map(normalizeResearch),
      news: normalizedNews,
      newsDetails: normalizedNewsDetails,
      publications: normalizedPublications,
      allPublications: (allPublications || []).map(normalizePublication),
      projects: normalizedProjects,
      achievements: (achievements || []).map(normalizeAchievement),
      experience: (experiences || []).map(normalizeExperience),
      contacts: (contacts || []).map(normalizeContact)
    };
  } catch (err) {
    console.error('[Supabase] Error:', err);
    console.log('[Supabase] Falling back to data.js');
    return window.DEFAULT_SITE_DATA;
  }
}

// Export for use in other scripts
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.STORAGE_CDN = STORAGE_CDN;
window.fetchSiteData = fetchSiteData;
window.USE_OFFLINE = USE_OFFLINE;
