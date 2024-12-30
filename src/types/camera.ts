export interface Camera {
  id: number;
  name: string;
  status: 'online' | 'offline' | 'error';
  streamUrl: string;
  powerStatus: boolean;
  isRecording: boolean;
  lastUpdate: Date;
}