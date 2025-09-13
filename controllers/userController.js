const bcrypt = require('bcryptjs');
const supabase = require('../config/database');

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        username,
        email,
        phone_number,
        dob,
        address,
        role,
        status,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { first_name, middle_name, last_name, phone_number, dob, address } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name,
        middle_name: middle_name || null,
        last_name,
        phone_number: phone_number || null,
        dob: dob || null,
        address: address || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        username,
        email,
        phone_number,
        dob,
        address,
        role,
        status
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { old_password, new_password } = req.body;

    // Get current password
    const { data: user, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 12);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};