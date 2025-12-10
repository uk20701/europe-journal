// api/entries.js

const { createClient } = require('@supabase/supabase-js');

// Read env vars set in Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function mapRowToEntry(row) {
  return {
    id: row.id,
    date: row.date,
    country: row.country,
    city: row.city,
    title: row.title,
    content: row.content,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

module.exports = async (req, res) => {
  const { method } = req;

  res.setHeader('Content-Type', 'application/json');

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase GET error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch entries from database',
        });
      }

      const entries = (data || []).map(mapRowToEntry);

      return res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (err) {
      console.error('GET handler error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unexpected server error',
      });
    }
  }

  if (method === 'POST') {
    const { date, country, city, title, content, imageUrl } = req.body || {};

    const missing = [];
    if (!country) missing.push('country');
    if (!title) missing.push('title');
    if (!content) missing.push('content');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields: missing,
      });
    }

    const dateValue = date || new Date().toISOString().slice(0, 10);

    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([
          {
            date: dateValue,
            country,
            city: city || null,
            title,
            content,
            image_url: imageUrl || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase INSERT error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to save entry to database',
        });
      }

      const entry = mapRowToEntry(data);

      return res.status(201).json({
        success: true,
        data: entry,
      });
    } catch (err) {
      console.error('POST handler error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unexpected server error',
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({
    success: false,
    error: `Method ${method} not allowed`,
  });
};
