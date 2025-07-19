import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiHome, FiCheckSquare, FiPackage } = FiIcons;

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home', labelHi: 'होम' },
    { path: '/tasks', icon: FiCheckSquare, label: 'Tasks', labelHi: 'कार्य' },
    { path: '/items', icon: FiPackage, label: 'Items', labelHi: 'वस्तुएं' }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6"
    >
      <div className="flex justify-center space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-white/20 text-white'
                : 'text-blue-100 hover:bg-white/10 hover:text-white'
            }`}
          >
            <SafeIcon icon={item.icon} className="text-2xl mb-1" />
            <span className="text-sm font-medium">{item.labelHi}</span>
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;