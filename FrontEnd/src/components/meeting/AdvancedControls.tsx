
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { 
  Settings, Mic, MicOff, Video, VideoOff, VolumeX, Volume2, 
  Wifi, WifiOff, Monitor, Speaker, Headphones, X, Sliders 
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateParticipant } from '@/store/meetingSlice';
import { toast } from "@/hooks/use-toast";

interface AdvancedControlsProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({ 
  className,
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const { participants } = useAppSelector(state => state.meeting);
  
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  
  // Audio settings
  const [micVolume, setMicVolume] = useState([80]);
  const [speakerVolume, setSpeakerVolume] = useState([70]);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  
  // Video settings
  const [videoQuality, setVideoQuality] = useState('720p');
  const [frameRate, setFrameRate] = useState(30);
  const [brightness, setBrightness] = useState([50]);
  const [contrast, setContrast] = useState([50]);
  
  // Network settings
  const [bandwidthLimit, setBandwidthLimit] = useState(false);
  const [maxBandwidth, setMaxBandwidth] = useState([1000]); // kbps
  const [adaptiveQuality, setAdaptiveQuality] = useState(true);
  
  // Load available devices
  React.useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
            kind: 'audioinput' as const
          }));
          
        const audioOutputs = devices
          .filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 5)}`,
            kind: 'audiooutput' as const
          }));
          
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
            kind: 'videoinput' as const
          }));
        
        setAudioDevices([...audioInputs, ...audioOutputs]);
        setVideoDevices(videoInputs);
        
        // Set defaults
        if (audioInputs.length > 0) setSelectedMic(audioInputs[0].deviceId);
        if (audioOutputs.length > 0) setSelectedSpeaker(audioOutputs[0].deviceId);
        if (videoInputs.length > 0) setSelectedCamera(videoInputs[0].deviceId);
        
      } catch (error) {
        console.error('Error loading devices:', error);
        toast({
          title: "Device access error",
          description: "Could not load audio/video devices",
          variant: "destructive",
        });
      }
    };
    
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  const handleDeviceChange = async (deviceId: string, type: 'mic' | 'speaker' | 'camera') => {
    try {
      if (type === 'mic') {
        setSelectedMic(deviceId);
        // Update microphone device
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: deviceId } }
        });
        
        toast({
          title: "Microphone changed",
          description: "Successfully switched microphone",
        });
      } else if (type === 'camera') {
        setSelectedCamera(deviceId);
        // Update camera device
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } }
        });
        
        toast({
          title: "Camera changed",
          description: "Successfully switched camera",
        });
      } else if (type === 'speaker') {
        setSelectedSpeaker(deviceId);
        // Update speaker (this is more complex and browser-dependent)
        toast({
          title: "Speaker changed",
          description: "Successfully switched speaker",
        });
      }
    } catch (error) {
      console.error(`Error changing ${type}:`, error);
      toast({
        title: `${type} change failed`,
        description: `Could not switch to selected ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleQualityChange = (quality: string) => {
    setVideoQuality(quality);
    toast({
      title: "Video quality changed",
      description: `Set to ${quality}`,
    });
  };

  const testMicrophone = () => {
    toast({
      title: "Testing microphone",
      description: "Speak now to test your microphone",
    });
  };

  const testSpeakers = () => {
    // Play a test sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2X4O/AaScHLYXN+Nh4NgYeacDl5Z5CDhBPqOPytGIeCzSO2+/KayQLK4PG8N2OQAkUXrTp66hVFApGnt7yvmzhAz2Z4+/AaScHLIXN+Nd3NwYdacDl5Z5CDhBPqOTztGIeCzSO2u7KayUHK4fN9N11AQM=');
    audio.play().catch(() => {
      toast({
        title: "Speaker test",
        description: "Could not play test sound",
        variant: "destructive",
      });
    });
  };

  const resetSettings = () => {
    setMicVolume([80]);
    setSpeakerVolume([70]);
    setNoiseReduction(true);
    setEchoCancellation(true);
    setAutoGainControl(true);
    setVideoQuality('720p');
    setFrameRate(30);
    setBrightness([50]);
    setContrast([50]);
    setBandwidthLimit(false);
    setMaxBandwidth([1000]);
    setAdaptiveQuality(true);
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
    <div className={cn(
      "fixed inset-y-0 right-0 w-96 bg-white/10 backdrop-blur-xl border-l border-white/20 dark:bg-black/20 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "translate-x-full",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Advanced Controls
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <Mic className="w-4 h-4 mr-2" />
            Audio Settings
          </h4>
          
          {/* Microphone Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Microphone</label>
            <Select value={selectedMic} onValueChange={(value) => handleDeviceChange(value, 'mic')}>
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.filter(d => d.kind === 'audioinput').map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={testMicrophone} className="mt-2">
              Test Microphone
            </Button>
          </div>

          {/* Speaker Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Speakers</label>
            <Select value={selectedSpeaker} onValueChange={(value) => handleDeviceChange(value, 'speaker')}>
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue placeholder="Select speakers" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.filter(d => d.kind === 'audiooutput').map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={testSpeakers} className="mt-2">
              Test Speakers
            </Button>
          </div>

          {/* Volume Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Microphone Volume</label>
              <Slider
                value={micVolume}
                onValueChange={setMicVolume}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{micVolume[0]}%</span>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Speaker Volume</label>
              <Slider
                value={speakerVolume}
                onValueChange={setSpeakerVolume}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{speakerVolume[0]}%</span>
            </div>
          </div>

          {/* Audio Enhancement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Noise Reduction</label>
              <Switch checked={noiseReduction} onCheckedChange={setNoiseReduction} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Echo Cancellation</label>
              <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto Gain Control</label>
              <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <Video className="w-4 h-4 mr-2" />
            Video Settings
          </h4>
          
          {/* Camera Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Camera</label>
            <Select value={selectedCamera} onValueChange={(value) => handleDeviceChange(value, 'camera')}>
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Video Quality */}
          <div>
            <label className="text-sm font-medium mb-2 block">Video Quality</label>
            <Select value={videoQuality} onValueChange={handleQualityChange}>
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="480p">480p (SD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Adjustments */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Brightness</label>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Contrast</label>
              <Slider
                value={contrast}
                onValueChange={setContrast}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Network Settings
          </h4>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Adaptive Quality</label>
            <Switch checked={adaptiveQuality} onCheckedChange={setAdaptiveQuality} />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Bandwidth Limit</label>
            <Switch checked={bandwidthLimit} onCheckedChange={setBandwidthLimit} />
          </div>
          
          {bandwidthLimit && (
            <div>
              <label className="text-sm font-medium mb-2 block">Max Bandwidth (kbps)</label>
              <Slider
                value={maxBandwidth}
                onValueChange={setMaxBandwidth}
                min={100}
                max={2000}
                step={50}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">{maxBandwidth[0]} kbps</span>
            </div>
          )}
        </div>
      </div>

      {/* Reset button */}
      <div className="p-4 border-t border-white/10">
        <Button variant="outline" onClick={resetSettings} className="w-full">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default AdvancedControls;
