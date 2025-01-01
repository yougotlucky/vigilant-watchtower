import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Mail, MessageSquare, BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState({
    telegramBotToken: localStorage.getItem('telegramBotToken') || '',
    telegramChatId: localStorage.getItem('telegramChatId') || '',
    emailServiceUrl: localStorage.getItem('emailServiceUrl') || '',
    emailTo: localStorage.getItem('emailTo') || '',
    whatsappApiUrl: localStorage.getItem('whatsappApiUrl') || '',
    whatsappToken: localStorage.getItem('whatsappToken') || '',
    whatsappTo: localStorage.getItem('whatsappTo') || '',
  });

  const handleSave = () => {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    toast({
      title: "Settings Saved",
      description: "Your notification settings have been saved successfully.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure your notification preferences for camera alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Telegram Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Telegram</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="telegramBotToken">Bot Token</Label>
                <Input
                  id="telegramBotToken"
                  name="telegramBotToken"
                  value={settings.telegramBotToken}
                  onChange={handleChange}
                  placeholder="Enter your Telegram bot token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramChatId">Chat ID</Label>
                <Input
                  id="telegramChatId"
                  name="telegramChatId"
                  value={settings.telegramChatId}
                  onChange={handleChange}
                  placeholder="Enter your Telegram chat ID"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Email</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailServiceUrl">Service URL</Label>
                <Input
                  id="emailServiceUrl"
                  name="emailServiceUrl"
                  value={settings.emailServiceUrl}
                  onChange={handleChange}
                  placeholder="Enter your email service URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailTo">Recipient Email</Label>
                <Input
                  id="emailTo"
                  name="emailTo"
                  value={settings.emailTo}
                  onChange={handleChange}
                  type="email"
                  placeholder="Enter recipient email address"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">WhatsApp</h3>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappApiUrl">API URL</Label>
                <Input
                  id="whatsappApiUrl"
                  name="whatsappApiUrl"
                  value={settings.whatsappApiUrl}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp API URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappToken">Token</Label>
                <Input
                  id="whatsappToken"
                  name="whatsappToken"
                  value={settings.whatsappToken}
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter WhatsApp API token"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappTo">Recipient Number</Label>
                <Input
                  id="whatsappTo"
                  name="whatsappTo"
                  value={settings.whatsappTo}
                  onChange={handleChange}
                  placeholder="Enter recipient WhatsApp number"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;