import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed up with Google');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full">Sign Up</button>
        </form>
        <div className="mt-4">
          <button onClick={handleGoogleSignup} className="w-full border py-2 rounded hover:bg-gray-100">
            Sign up with Google
          </button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
