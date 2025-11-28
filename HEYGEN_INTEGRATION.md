# HeyGen Integration Guide

This guide explains how to integrate HeyGen's streaming avatar SDK with your PersonaAI application.

## Setup

### 1. Get HeyGen API Credentials

1. Sign up at [HeyGen](https://app.heygen.com)
2. Go to Settings > API Keys
3. Generate a new API key
4. Note your Avatar IDs from the Avatar section

### 2. Environment Configuration

Copy the environment variables from `.env.heygen.example` to your `.env.local`:

```bash
NEXT_PUBLIC_HEYGEN_API_KEY=your_heygen_api_key_here
NEXT_PUBLIC_HEYGEN_SERVER_URL=wss://api.heygen.com
NEXT_PUBLIC_HEYGEN_DEFAULT_AVATAR=your_default_avatar_id
```

### 3. Avatar Configuration

You can configure different avatars for different personas by modifying the `HeyGenComponent.tsx`:

```typescript
// In HeyGenComponent.tsx
const getAvatarId = (persona: PersonaChatDto) => {
  // Map personas to specific avatars
  switch (persona.gender?.toLowerCase()) {
    case "male":
      return (
        process.env.NEXT_PUBLIC_HEYGEN_MALE_AVATAR || "default-male-avatar"
      );
    case "female":
      return (
        process.env.NEXT_PUBLIC_HEYGEN_FEMALE_AVATAR || "default-female-avatar"
      );
    default:
      return process.env.NEXT_PUBLIC_HEYGEN_DEFAULT_AVATAR || "default-avatar";
  }
};
```

## Features

### Current Implementation

- ✅ **Video Avatar Display**: Shows HeyGen avatar in video element
- ✅ **Connection Management**: Start/stop avatar sessions
- ✅ **Speech Synthesis**: Make avatar speak text responses
- ✅ **Audio/Video Controls**: Toggle video, audio, and microphone
- ✅ **Error Handling**: Display connection and API errors
- ✅ **Loading States**: Show connection progress
- ✅ **Responsive Design**: Works on different screen sizes

### Available Controls

- **Video Toggle**: Show/hide avatar video
- **Audio Toggle**: Mute/unmute avatar audio
- **Microphone Toggle**: Enable/disable voice input (for future voice chat)
- **Disconnect**: End avatar session

## Integration with Chat System

### 1. Automatic Speech

To make the avatar automatically speak AI responses, integrate with your chat system:

```typescript
// In your chat handling code
const handleChatResponse = async (response: string) => {
  // Show text response in messages
  setMessages((prev) => [...prev, { role: "assistant", content: response }]);

  // Make avatar speak the response
  if (avatarRef.current && isInVideoMode) {
    await avatarRef.current.speakText(response);
  }
};
```

### 2. Voice Input Integration

For voice-to-text input, you can integrate with Web Speech API:

```typescript
// Voice recognition setup
const startVoiceRecognition = () => {
  const recognition = new webkitSpeechRecognition();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };
  recognition.start();
};
```

## API Usage

### Core Methods

- `startAvatar()`: Initialize avatar session
- `stopAvatar()`: End avatar session
- `speakText(text)`: Make avatar speak
- Video/audio control toggles

### Error Handling

The component handles common errors:

- SDK loading failures
- Connection timeouts
- Authentication errors
- Avatar initialization failures

## Customization

### Avatar Selection

Modify the `heygenConfig` in `HeyGenComponent.tsx`:

```typescript
const heygenConfig = {
  apiKey: process.env.NEXT_PUBLIC_HEYGEN_API_KEY,
  serverUrl: process.env.NEXT_PUBLIC_HEYGEN_SERVER_URL,
  avatarId: getAvatarForPersona(persona), // Custom function
  quality: "high", // "low", "medium", "high"
  language: "en", // Language code
};
```

### Styling

The component uses Tailwind CSS classes. Key areas to customize:

- Video container: `.bg-black.rounded-lg`
- Controls: `.bg-gray-800/80`
- Status indicators: `.text-green-400`

## Troubleshooting

### Common Issues

1. **SDK Not Loading**: Check network connectivity and HeyGen service status
2. **Authentication Failed**: Verify API key is correct and active
3. **Avatar Not Starting**: Check avatar ID exists and is accessible
4. **No Audio**: Verify browser audio permissions

### Debug Mode

Enable console logging in the component for debugging:

```typescript
const DEBUG = process.env.NODE_ENV === "development";
if (DEBUG) console.log("HeyGen operation:", operation, data);
```

## Performance Notes

- Avatar video uses WebRTC for low latency
- Bandwidth usage: ~1-2MB per minute of video
- Recommended minimum: 1Mbps upload/download
- Works best with stable internet connection

## Browser Support

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ⚠️ Limited (audio may not work)

## Security Considerations

- API keys are exposed in client-side code (use environment variables)
- Consider implementing server-side proxy for production
- WebRTC connections are peer-to-peer encrypted
