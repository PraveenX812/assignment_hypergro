import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      // Handle successful signup, e.g., redirect to login
      // console.log('Signup successful:', data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Sign Up</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <label style={{ fontWeight: 'bold' }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <label style={{ fontWeight: 'bold' }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Sign Up</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>Already have an account? <Link to="/signin" style={{ color: '#007bff', textDecoration: 'none' }}>Sign In</Link></p>
    </div>
  );
} 