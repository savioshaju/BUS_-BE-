const supabase = require('../config/database');

const getPendingProviders = async (req, res, next) => {
  try {
    const { data: providers, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        email,
        phone_number,
        dob,
        address,
        created_at
      `)
      .eq('role', 'Transit Provider')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: providers
    });

  } catch (error) {
    next(error);
  }
};

const approveProvider = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected"'
      });
    }

    let result;
    if (status === 'Approved') {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          status: 'Approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      result = { id: userId };
    }

    res.json({
      success: true,
      message: `Provider ${status.toLowerCase()} successfully`,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;

    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        username,
        email,
        phone_number,
        role,
        status,
        created_at
      `, { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: users,
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
  getPendingProviders,
  approveProvider,
  getAllUsers
};