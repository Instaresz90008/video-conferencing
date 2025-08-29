
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MeetingNotFoundProps {
  error: string;
  meetingId?: string;
}

const MeetingNotFound: React.FC<MeetingNotFoundProps> = ({ error, meetingId }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleCreateMeeting = () => {
    navigate('/', { state: { showCreateMeeting: true } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Meeting Not Found
          </CardTitle>
          <CardDescription>
            We couldn't find the meeting you're looking for
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {meetingId && (
            <div className="text-center text-sm text-gray-600">
              Meeting ID: <code className="bg-gray-100 px-2 py-1 rounded">{meetingId}</code>
            </div>
          )}

          <div className="text-sm text-gray-600 space-y-2">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The meeting link is incorrect or expired</li>
              <li>The meeting has already ended</li>
              <li>The meeting was cancelled by the host</li>
              <li>You don't have permission to access this meeting</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleGoHome} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
          <Button onClick={handleCreateMeeting} className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Create Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MeetingNotFound;
