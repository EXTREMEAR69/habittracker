const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { userId, requestId, payload } = req.body || {};
  if (!userId || !payload) return res.status(400).send('Missing userId or payload');

  try {
    // store payload in user_data table
    const { data, error } = await supabase
      .from('user_data')
      .insert([{ user_id: userId, payload, uploaded_at: new Date().toISOString() }]);

    if (error) throw error;

    // mark request processed (if requestId provided)
    if (requestId) {
      const { error: e2 } = await supabase
        .from('sync_requests')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', requestId);
      if (e2) throw e2;
    }

    return res.status(200).json({ ok: true, inserted: data });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message || 'Server error');
  }
};