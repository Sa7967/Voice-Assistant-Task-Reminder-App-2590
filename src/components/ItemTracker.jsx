import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useItem } from '../context/ItemContext';
import { useVoice } from '../context/VoiceContext';
import { format } from 'date-fns';

const { FiPackage, FiMapPin, FiSearch, FiTrash2, FiVolume2, FiPlus } = FiIcons;

const ItemTracker = () => {
  const { items, addItem, deleteItem, findItem } = useItem();
  const { isMuted } = useVoice();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', location: '' });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speak = (text) => {
    if (isMuted) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.location.trim()) {
      addItem({
        id: Date.now(),
        name: newItem.name.trim(),
        location: newItem.location.trim(),
        createdAt: new Date()
      });
      
      setNewItem({ name: '', location: '' });
      setShowAddForm(false);
      speak(`याद रखा गया: ${newItem.name} ${newItem.location} में है`);
    }
  };

  const handleDeleteItem = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      deleteItem(itemId);
      speak('वस्तु हटाई गई');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const foundItem = findItem(searchQuery);
      if (foundItem) {
        speak(`${foundItem.name} ${foundItem.location} में है`);
      } else {
        speak('वस्तु नहीं मिली');
      }
    }
  };

  const playItemLocation = (item) => {
    speak(`${item.name} ${item.location} में है`);
  };

  const formatTime = (date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">वस्तु ट्रैकर</h2>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
              {items.length} वस्तुएं
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 text-white hover:bg-white/30 p-2 rounded-lg transition-all duration-300"
            >
              <SafeIcon icon={FiPlus} className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="वस्तु खोजें..."
              className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <SafeIcon 
              icon={FiSearch} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60" 
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300"
          >
            खोजें
          </motion.button>
        </div>
      </div>

      {/* Add Item Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">नई वस्तु जोड़ें</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="वस्तु का नाम (जैसे: चार्जर, चाबी)"
                className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="स्थान (जैसे: अलमारी, टेबल)"
                className="w-full bg-white/20 text-white placeholder-white/60 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddItem}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300"
                >
                  जोड़ें
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300"
                >
                  रद्द करें
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center"
            >
              <SafeIcon icon={FiPackage} className="text-4xl text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">
                {searchQuery ? 'कोई वस्तु नहीं मिली' : 'कोई वस्तु सहेजी नहीं गई'}
              </p>
              <p className="text-white/50 text-sm mt-2">
                कहें: "मैंने चार्जर अलमारी में रखा" या मैन्युअल रूप से जोड़ें
              </p>
            </motion.div>
          ) : (
            filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <SafeIcon icon={FiPackage} className="text-2xl text-purple-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white mb-1">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center space-x-1 text-blue-200 mb-2">
                      <SafeIcon icon={FiMapPin} className="text-sm" />
                      <span>{item.location}</span>
                    </div>
                    
                    {item.createdAt && (
                      <span className="text-white/50 text-xs">
                        जोड़ा गया: {formatTime(item.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playItemLocation(item)}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                    >
                      <SafeIcon icon={FiVolume2} className="text-lg" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300"
                    >
                      <SafeIcon icon={FiTrash2} className="text-lg" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-4"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{items.length}</div>
            <div className="text-purple-200 text-sm">कुल वस्तुएं सहेजी गई</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ItemTracker;