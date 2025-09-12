import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/user/login', { email, password });
      console.log('User login response:', res.data); // Debug response

      if (res.data.success && res.data.userType === 'user') {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard_user');
      } else {
        alert('Invalid credentials or wrong user type');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      alert('Error logging in: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="login-form">
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>New User? <Link to="/register_user">Register Here</Link></p>
    </div>
  );
};

export default LoginUser;
