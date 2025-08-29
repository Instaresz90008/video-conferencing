
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Settings } from "lucide-react";

interface MediaPermissionFallbackProps {
  error: string | null;
  onRetry: () => void;
}

const MediaPermissionFallback: React.FC<MediaPermissionFallbackProps> = ({ 
  error,
  onRetry
}) => {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Media access error</AlertTitle>
        <AlertDescription>
          {error || "Permission denied. Please allow camera and microphone access."}
        </AlertDescription>
      </Alert>
      
      <div className="text-sm text-white/70">
        <p>To join a meeting, you need to grant permission to access your camera or microphone.</p>
        
        <div className="mt-4 space-y-2">
          <h4 className="font-medium">How to fix this:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click the camera/lock icon in your browser's address bar</li>
            <li>Select "Allow" for camera and microphone</li>
            <li>Reload the page</li>
          </ol>
        </div>
      </div>
      
      <div className="flex space-x-3 pt-3">
        <Button variant="default" onClick={onRetry} className="flex-1">
          Retry
        </Button>
        <Button 
          variant="outline"
          className="flex items-center space-x-2 bg-white/10 text-white"
          onClick={() => window.open('about:settings', '_blank')}
        >
          <Settings size={16} />
          <span>Browser Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default MediaPermissionFallback;
