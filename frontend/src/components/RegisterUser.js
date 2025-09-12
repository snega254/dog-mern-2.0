import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/auth/user/register', { name, email, password, contact });
      if (res.data.success) {
        navigate('/login_user');
      }
    } catch (err) {
      alert('Error registering');
    }
  };

  return (
    <div className="login-form">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact" required />
        <button type="submit">Register</button>
      </form>
      <p>Already registered? <Link to="/login_user">Login Here</Link></p>
    </div>
  );
};

export default RegisterUser;