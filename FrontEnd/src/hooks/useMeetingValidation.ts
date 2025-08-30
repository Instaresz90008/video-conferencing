
// import { useState, useEffect } from 'react';
// import { meetingApi, type MeetingRoom } from '@/services/meetingApi';

// export interface MeetingValidationState {
//   meeting: MeetingRoom | null;
//   isLoading: boolean;
//   error: string | null;
//   isValid: boolean;
// }

// export const useMeetingValidation = (meetingId: string | undefined, skipValidation?: boolean) => {
//   const [state, setState] = useState<MeetingValidationState>({
//     meeting: null,
//     isLoading: !skipValidation,
//     error: null,
//     isValid: skipValidation || false,
//   });

//   useEffect(() => {
//     if (skipValidation) {
//       setState({
//         meeting: null,
//         isLoading: false,
//         error: null,
//         isValid: true,
//       });
//       return;
//     }

//     if (!meetingId) {
//       setState({
//         meeting: null,
//         isLoading: false,
//         error: 'No meeting ID provided',
//         isValid: false,
//       });
//       return;
//     }

//     const validateMeeting = async () => {
//       setState(prev => ({ ...prev, isLoading: true, error: null }));

//       try {
//         const meeting = await meetingApi.getMeeting(meetingId);
        
//         if (!meeting) {
//           setState({
//             meeting: null,
//             isLoading: false,
//             error: 'Meeting not found',
//             isValid: false,
//           });
//           return;
//         }

//         // Check if meeting is expired
//         if (meeting.expiresAt && new Date(meeting.expiresAt) < new Date()) {
//           setState({
//             meeting,
//             isLoading: false,
//             error: 'Meeting has expired',
//             isValid: false,
//           });
//           return;
//         }

//         // Check if meeting is active
//         if (!meeting.isActive) {
//           setState({
//             meeting,
//             isLoading: false,
//             error: 'Meeting has ended',
//             isValid: false,
//           });
//           return;
//         }

//         setState({
//           meeting,
//           isLoading: false,
//           error: null,
//           isValid: true,
//         });
//       } catch (error) {
//         setState({
//           meeting: null,
//           isLoading: false,
//           error: 'Failed to validate meeting',
//           isValid: false,
//         });
//       }
//     };

//     validateMeeting();
//   }, [meetingId, skipValidation]);

//   return state;
// };





















import { useState, useEffect } from 'react';
import { meetingApi, type MeetingRoom } from '@/services/meetingApi';

export interface MeetingValidationState {
  meeting: MeetingRoom | null;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
}

export const useMeetingValidation = (meetingId: string | undefined) => {
  const [state, setState] = useState<MeetingValidationState>({
    meeting: null,
    isLoading: true,
    error: null,
    isValid: false,
  });

  useEffect(() => {
    if (!meetingId) {
      setState({
        meeting: null,
        isLoading: false,
        error: 'No meeting ID provided',
        isValid: false,
      });
      return;
    }

    const validateMeeting = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const meeting = await meetingApi.getMeeting(meetingId);
        
        if (!meeting) {
          setState({
            meeting: null,
            isLoading: false,
            error: 'Meeting not found',
            isValid: false,
          });
          return;
        }

        // Check if meeting is expired
        if (meeting.expiresAt && new Date(meeting.expiresAt) < new Date()) {
          setState({
            meeting,
            isLoading: false,
            error: 'Meeting has expired',
            isValid: false,
          });
          return;
        }

        // Check if meeting is active
        if (!meeting.isActive) {
          setState({
            meeting,
            isLoading: false,
            error: 'Meeting has ended',
            isValid: false,
          });
          return;
        }

        setState({
          meeting,
          isLoading: false,
          error: null,
          isValid: true,
        });
      } catch (error) {
        console.error('Meeting validation error:', error);
        setState({
          meeting: null,
          isLoading: false,
          error: 'Failed to validate meeting',
          isValid: false,
        });
      }
    };

    validateMeeting();
  }, [meetingId]);

  return state;
};