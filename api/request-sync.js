const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== ADMIN_SECRET) return res.status(401).send('Unauthorized');

  const { userId } = req.body || {};
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const { data, error } = await supabase
      .from('sync_requests')
      .insert([{ user_id: userId, requested_at: new Date().toISOString(), processed: false }]);

    if (error) throw error;
    return res.status(200).json({ ok: true, inserted: data });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message || 'Server error');
  }
};