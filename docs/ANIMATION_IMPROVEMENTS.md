# Camera Animation Safety Improvements

## Overview

Implemented comprehensive safety measures for smooth camera animations in MapComponent and useLocationTracker to prevent app crashes from excessive animation requests and IllegalStateException errors.

## Critical Fix for IllegalStateException

### Root Cause

The app was crashing with `IllegalStateException` when tapping map markers due to:

1. **Race Condition**: `animateCamera()` was called while an async `getCamera()` operation was still pending
2. **Native SDK State**: Google Maps SDK was in an invalid state when receiving rapid animation requests
3. **Async/Await Blocking**: Using `await` on `getCamera()` created blocking that interfered with animation queue processing

### Solution Applied

- **Replaced `animateCamera()` with `setCamera()`**: `setCamera()` is instant and doesn't interfere with ongoing operations
- **Non-blocking `getCamera()`**: Changed from `await getCamera()` to `getCamera().then()` to avoid blocking the queue
- **Coordinate Validation**: Added `isNaN()` checks to prevent invalid coordinates from causing crashes

## Key Improvements

### 1. Animation Queue System (useLocationTracker)

- **Animation ID Tracking**: Added `currentAnimationId` to cancel superseded animations
- **Abort Mechanism**: Added `pendingAnimationAbort` flag to stop animation processing
- **Queue Size Limit**: Maximum 3 items in queue to prevent memory buildup
- **Optimal Timing**: 500ms delay between operations for native SDK stability
- **Non-blocking Operations**: Operations use `Promise.resolve()` to handle both sync and async functions

### 2. Enhanced Debouncing

Increased debounce times to prevent rapid successive calls:

- `onFocusVehicle`: 800ms (was 500ms) - More time for animation to complete
- `onGoToUserLocation`: 800ms (was 500ms) - More time for animation to complete
- `onChangeZoomSnap`: 500ms (was 400ms) - Optimized for zoom interactions

### 3. Safer Camera Methods

**Critical Change**: All camera operations now use `setCamera()` instead of `animateCamera()`:

- **onFocusVehicle**: Uses `setCamera()` with `getCamera().then()` pattern
- **onGoToUserLocation**: Uses `setCamera()` for instant positioning
- **onChangeZoomSnap**: Uses `setCamera()` with `getCamera().then()` pattern

**Why `setCamera()` is safer**:

- Instant positioning, no animation state to manage
- Doesn't interfere with other operations
- More predictable behavior with Google Maps SDK
- Less prone to IllegalStateException

### 4. Input Validation

Added coordinate validation in `onFocusVehicle`:

```typescript
const lat = parseFloat(data.latitute);
const long = parseFloat(data.longitude);

if (isNaN(lat) || isNaN(long)) {
  console.log("[onFocusVehicle] Invalid coordinates");
  return;
}
```

### 5. User Interaction Detection (MapComponent)

- Added `isUserInteracting` state to track when user is manually interacting with map
- Automatically resets after 1 second of no interaction
- Prevents automatic camera movements during user interactions
- Applied to:
  - Zoom buttons (+/-)
  - Marker press events
  - Map pan/drag gestures

### 6. Enhanced Error Handling

- Proper cleanup of animation flags on errors
- Queue returns boolean to indicate success/failure
- Timeout-based flag resets to prevent stuck states
- Try-catch blocks around all camera operations
- `.catch()` handlers for Promise-based operations

## Benefits

✅ **Prevents Crashes**: Queue system and debouncing eliminate race conditions
✅ **Fixed IllegalStateException**: Using `setCamera()` prevents native SDK crashes
✅ **Smoother Experience**: Proper timing prevents jarring animations
✅ **Better UX**: Respects user interactions and doesn't fight user input
✅ **Memory Efficient**: Limited queue size prevents buildup
✅ **Maintainable**: Clear logging for debugging
✅ **Cancelable**: New requests properly cancel old animations
✅ **Input Validation**: Prevents crashes from invalid data

## Technical Details

### Queue Processing Flow

1. Animation requested → Check debouncing
2. Check map ready state
3. Check not currently animating
4. Queue the operation
5. Process queue sequentially
6. Each operation waits 400ms for completion
7. Abort if superseded by new animation

### Interaction Handling Flow

1. User starts interacting → Set `isUserInteracting = true`
2. Clear any existing reset timeout
3. User stops interacting → Start 1-second timeout
4. After timeout → Set `isUserInteracting = false`
5. Automatic animations can resume

## Functions Modified

### useLocationTracker

- `processCameraQueue()` - Enhanced with abort checks and animation ID tracking
- `queueCameraAnimation()` - Returns boolean, enforces queue limit
- `onFocusVehicle()` - Uses smooth animation, better error handling
- `onGoToUserLocation()` - Enhanced with animation ID tracking
- `onChangeZoomSnap()` - Simplified to prevent crashes
- `onSetInitialCamera()` - Maintained instant positioning for initial load

### MapComponent

- Added `handleMapInteractionStart()` and `handleMapInteractionEnd()`
- Enhanced MapView with interaction event handlers
- Added interaction checks to zoom buttons and marker presses
