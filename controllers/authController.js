const bcrypt = require('bcryptjs');
const supabase = require('../config/database');
const { generateToken, generateRefreshToken } = require('../config/jwt');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password, role, status')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if provider is pending approval
    if (user.role === 'Transit Provider' && user.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval'
      });
    }

    // Generate tokens
    const token = generateToken({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });

    const refreshToken = generateRefreshToken({ 
      id: user.id 
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { 
      first_name, 
      middle_name, 
      last_name, 
      username, 
      email, 
      phone_number, 
      password, 
      dob, 
      address, 
      role 
    } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        first_name,
        middle_name: middle_name || null,
        last_name,
        username,
        email,
        phone_number: phone_number || null,
        password: hashedPassword,
        dob: dob || null,
        address: address || null,
        role,
        status: role === 'Transit Provider' ? 'Pending' : 'Approved'
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        status: newUser.status
      }
    });

  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists
    const { data: user } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('id', decoded.id)
      .single();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newToken = generateToken({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

module.exports = {
  login,
  register,
  refreshToken
};