const supabase = require('../config/database');

const saveRoute = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { start, stops, end } = req.body;

    if (!start || !end || !Array.isArray(stops)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid route data. Start, end, and stops array are required.'
      });
    }

    const { data: route, error } = await supabase
      .from('bus_routes')
      .insert([{
        user_id: userId,
        start_location: start.name || start,
        end_location: end.name || end,
        stops: stops.map(stop => stop.name || stop),
        approval_status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Route saved successfully',
      data: route
    });

  } catch (error) {
    next(error);
  }
};

const getRoutes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 10, status } = req.query;

    let query = supabase
      .from('bus_routes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('approval_status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: routes, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveRoute,
  getRoutes
};