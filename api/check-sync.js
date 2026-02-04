const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
  const { userId } = req.query || {};
  if (!userId) return res.status(400).send('Missing userId');

  try {
    const { data, error } = await supabase
      .from('sync_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('processed', false)
      .order('requested_at', { ascending: true })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      return res.status(200).json({ requested: true, requestId: data[0].id });
    }

    return res.status(200).json({ requested: false });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message || 'Server error');
  }
};