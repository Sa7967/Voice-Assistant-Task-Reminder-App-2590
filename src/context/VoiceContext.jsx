import React, { createContext, useContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};

export const VoiceProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem('voiceAssistantMuted');
    if (savedMuteState !== null) {
      setIsMuted(JSON.parse(savedMuteState));
    }
  }, []);

  useEffect(() => {
    // Save mute state to localStorage
    localStorage.setItem('voiceAssistantMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  const value = {
    isMuted,
    setIsMuted,
    isListening,
    setIsListening
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};