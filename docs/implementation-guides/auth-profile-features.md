# Authentication & Profile Features Implementation Guide

## Overview
This guide covers the new authentication, profile management, and journal features implemented on 2025-07-24.

## 1. Using the Enhanced Authentication System

### APIAuthHelper Usage
```typescript
import { APIAuthHelper } from '@/utils/apiAuth';

// Check if user is authenticated
const isAuth = await APIAuthHelper.isAuthenticated();

// Make authenticated API call
const response = await APIAuthHelper.authenticatedFetch('/api/your-endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});

// Get current user
const user = await APIAuthHelper.getCurrentUser();
```

### Benefits
- Automatic token refresh before expiry
- Retry on 401 with fresh token
- Centralized auth management
- Clear error messages

## 2. Implementing Location Autocomplete

### Basic Usage
```tsx
import { LocationInput } from '@/components/astrology/LocationInput';

function YourComponent() {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>();

  return (
    <LocationInput
      value={location}
      onChange={(value, coords) => {
        setLocation(value);
        if (coords) setCoordinates(coords);
      }}
      onCoordinatesFound={(lat, lng) => {
        console.log('Coordinates:', lat, lng);
      }}
      placeholder="Enter your city"
      label="Birth Location"
    />
  );
}
```

### Features
- Real-time city search
- Current location detection
- Keyboard navigation (arrow keys + enter)
- Mobile optimized
- No API key required (uses OpenStreetMap)

## 3. Profile Data Autofill

### Using the Hook
```tsx
import { useProfileAutofill } from '@/hooks/useProfileAutofill';

function YourAstrologyComponent() {
  const {
    birthDate,
    birthTime,
    birthLocation,
    birthCoordinates,
    saveProfileField,
    isLoading
  } = useProfileAutofill({ autoLoad: true });

  // Auto-filled values are ready to use
  return (
    <form>
      <input 
        type="date" 
        value={birthDate} 
        onChange={(e) => saveProfileField('birthDate', e.target.value)}
      />
      {/* Other fields auto-fill similarly */}
    </form>
  );
}
```

### ProfileDataService Direct Usage
```typescript
import { ProfileDataService } from '@/services/ProfileDataService';

// Get autofill data
const data = ProfileDataService.getAutofillData();

// Save profile data
await ProfileDataService.saveProfile(userId, {
  birthDate: '1990-01-01',
  birthLocation: 'New York, NY',
  birthCoordinates: { lat: 40.7128, lng: -74.0060 }
});

// Subscribe to changes
const unsubscribe = ProfileDataService.subscribe((profile) => {
  console.log('Profile updated:', profile);
});
```

## 4. Cosmic Journal Entry

### Implementation
```tsx
import { CosmicJournalEntry } from '@/components/journal/CosmicJournalEntry';

function YourTarotComponent() {
  const [showJournal, setShowJournal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowJournal(true)}>
        Save to Journal
      </button>
      
      <CosmicJournalEntry
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
        reading={tarotReading}
        cardName="The Fool"
        cardMeaning="New beginnings, innocence, spontaneity"
        question="What should I focus on today?"
      />
    </>
  );
}
```

### Features
- 4 writing quill styles with visual feedback
- Real-time auth state monitoring
- Beautiful cosmic UI
- Mobile responsive
- Saves to journal_entries table

## 5. Enhanced Profile Form

### Usage
```tsx
import { EnhancedProfileForm } from '@/components/profile/EnhancedProfileForm';

function ProfilePage() {
  return (
    <EnhancedProfileForm
      onComplete={() => {
        console.log('Profile saved!');
        // Navigate or show success
      }}
      embedded={false} // Set true for compact mode
    />
  );
}
```

### Features
- Integrated location autocomplete
- Date/time validation
- Tarot reader selection
- Auto-saves to ProfileDataService
- Beautiful cosmic theming

## Best Practices

### 1. Always Check Authentication
```typescript
// Before API calls
const isAuth = await APIAuthHelper.isAuthenticated();
if (!isAuth) {
  // Show login prompt
  return;
}
```

### 2. Handle Location Errors
```tsx
<LocationInput
  onChange={(value, coords) => {
    if (!coords) {
      // User typed custom location without selecting
      // You may want to validate or geocode separately
    }
  }}
/>
```

### 3. Profile Data Loading
```typescript
// Always use autoLoad for components that need profile data
const { birthDate, isLoading } = useProfileAutofill({ autoLoad: true });

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 4. Journal Entry Auth
```tsx
// The component handles auth internally, but you can pre-check
const { user, isGuest } = useAuth();

if (isGuest) {
  // Show "Sign in to save" message
}
```

## Environment Variables

### Optional for Enhanced Features
```env
# For Mapbox geocoding (fallback to OpenStreetMap if not set)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
```

## Migration Guide

### Updating Existing Components
1. Replace manual auth checks with `APIAuthHelper`
2. Replace text inputs for location with `LocationInput`
3. Use `useProfileAutofill` instead of manual form state
4. Update journal/save modals to use `CosmicJournalEntry`

### Database Requirements
Ensure these tables exist:
- `user_profiles` - For profile data storage
- `journal_entries` - For cosmic journal entries

## Troubleshooting

### Auth Issues
- Check browser console for detailed auth errors
- Verify Supabase session is valid
- Clear localStorage and re-login if needed

### Location Search Not Working
- Check internet connection
- Verify CORS is not blocking geocoding APIs
- Use browser location if search fails

### Profile Data Not Saving
- Check user is authenticated
- Verify user_profiles table has proper RLS policies
- Check browser console for Supabase errors

---
*Last updated: 2025-07-24*