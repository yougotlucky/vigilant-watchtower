import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface Stream {
  name: string;
  url: string;
}

export const useStreamSettings = () => {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || 'http://localhost:8083');
  const [streams, setStreams] = useState<Stream[]>(() => {
    const saved = localStorage.getItem('streams');
    return saved ? JSON.parse(saved) : [];
  });

  // Load existing streams from RTSPtoWeb server
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await fetch(`${serverUrl}/streams`);
        if (!response.ok) throw new Error('Failed to fetch streams');
        const data = await response.json();
        
        // Convert RTSPtoWeb streams format to our format
        const streamsList = Object.entries(data.streams).map(([name, details]: [string, any]) => ({
          name,
          url: details.url || '',
        }));

        setStreams(streamsList);
        localStorage.setItem('streams', JSON.stringify(streamsList));
      } catch (error) {
        console.error('Failed to fetch streams:', error);
      }
    };

    if (serverUrl) {
      fetchStreams();
    }
  }, [serverUrl]);

  const addStream = () => {
    const newStream = { name: `Stream ${streams.length + 1}`, url: '' };
    setStreams([...streams, newStream]);
  };

  const removeStream = () => {
    if (streams.length > 0) {
      const newStreams = streams.slice(0, -1);
      setStreams(newStreams);
    }
  };

  const updateStream = (index: number, updatedStream: Stream) => {
    const newStreams = [...streams];
    newStreams[index] = updatedStream;
    setStreams(newStreams);
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('serverUrl', serverUrl);
      localStorage.setItem('streams', JSON.stringify(streams));

      // Update streams on RTSPtoWeb server
      for (const stream of streams) {
        const response = await fetch(`${serverUrl}/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: stream.name,
            url: stream.url,
            on_demand: true,
            debug: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to add stream ${stream.name}`);
        }
      }

      toast({
        title: "Settings Saved",
        description: "Stream settings have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save stream settings. Please check your server connection.",
      });
    }
  };

  return {
    serverUrl,
    setServerUrl,
    streams,
    addStream,
    removeStream,
    updateStream,
    saveSettings,
  };
};