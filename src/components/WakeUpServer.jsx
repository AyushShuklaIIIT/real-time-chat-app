import { useEffect } from 'react';

const WakeUpServer = () => {
  useEffect(() => {
    const wakeUp = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        console.log("⏰ Pinging server to wake it up...");
        await fetch(`${API_URL}/`); 
        console.log("✅ Server is awake!");
      } catch (err) {
        console.error("⚠️ Server wake-up failed (it might be waking up slowly):", err);
      }
    };

    wakeUp();
  }, []);

  return null;
};

export default WakeUpServer;