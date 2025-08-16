import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Error logging out');
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/career', label: 'Career' },
    { path: '/learning', label: 'Learning' },
    { path: '/quiz', label: 'Quiz' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            SkillForge AI
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map(item => (
              <Link key={item.path} to={item.path} className="text-gray-700 hover:text-primary">
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-2">
                <img src={user.photoURL || '/default-avatar.png'} alt="User" className="w-8 h-8 rounded-full" />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary"
                >
                  <LogOut size={16} /><span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary">Login</Link>
                <Link to="/signup" className="btn-primary">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {menuItems.map(item => (
              <Link key={item.path} to={item.path} className="block py-2 text-gray-700">
                {item.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout} className="block py-2 text-gray-700 w-full text-left">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700">Login</Link>
                <Link to="/signup" className="block py-2 btn-primary w-full text-center">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
