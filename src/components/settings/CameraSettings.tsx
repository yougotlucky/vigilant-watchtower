import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Save, LayoutGrid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStreamSettings } from '@/hooks/useStreamSettings';

const CameraSettings = () => {
  const { toast } = useToast();
  const { 
    serverUrl,
    setServerUrl,
    streams,
    addStream,
    removeStream,
    updateStream,
    saveSettings
  } = useStreamSettings();

  return (
    <Card className="border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-purple-900/40 backdrop-blur-sm shadow-xl animate-in fade-in-0 duration-500">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
          <LayoutGrid className="h-5 w-5" />
          Camera Settings ({streams.length} streams)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-purple-100">RTSPtoWeb Server URL</Label>
          <Input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:8083"
            className="bg-purple-900/20 backdrop-blur-sm text-purple-100 placeholder:text-purple-300/50 border-purple-500/20 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={addStream}
            className="hover:bg-purple-500/20 text-purple-100 border-purple-500/20 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={removeStream}
            disabled={streams.length === 0}
            className="hover:bg-purple-500/20 text-purple-100 border-purple-500/20 transition-all duration-300 hover:scale-105"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-purple-200">
            {streams.length} stream{streams.length !== 1 ? 's' : ''} configured
          </span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
          {streams.map((stream, index) => (
            <div 
              key={index} 
              className="space-y-2 p-4 border rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm border-purple-500/20 animate-in slide-in-from-left duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Input
                value={stream.name}
                onChange={(e) => updateStream(index, { ...stream, name: e.target.value })}
                placeholder="Stream Name"
                className="bg-purple-900/20 backdrop-blur-sm text-purple-100 placeholder:text-purple-300/50 border-purple-500/20"
              />
              <Input
                value={stream.url}
                onChange={(e) => updateStream(index, { ...stream, url: e.target.value })}
                placeholder="RTSP URL (e.g., rtsp://user:pass@ip:port/stream)"
                className="bg-purple-900/20 backdrop-blur-sm text-purple-100 placeholder:text-purple-300/50 border-purple-500/20"
              />
            </div>
          ))}
        </div>

        <Button 
          onClick={saveSettings} 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] animate-pulse"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default CameraSettings;