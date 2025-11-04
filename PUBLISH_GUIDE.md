# Quick Guide: Publishing to Expo.dev

## Step-by-Step Instructions

### 1. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Enter your Expo account credentials (or create account at https://expo.dev)

### 3. Initialize EAS for this project
```bash
eas init
```
This will:
- Link your project to Expo
- Create/update the `eas.json` file (already created)
- Set up your project on Expo.dev

### 4. Build the Android App

**Option A: Preview Build (APK for testing)**
```bash
npm run build:android:preview
```
or
```bash
eas build --platform android --profile preview
```

**Option B: Production Build (AAB for Play Store)**
```bash
npm run build:android:production
```
or
```bash
eas build --platform android --profile production
```

### 5. Monitor Build Progress

- The build will start on Expo's cloud servers
- You'll see a QR code and link to track progress
- First build: ~10-20 minutes
- Subsequent builds: ~5-10 minutes

### 6. View on Expo.dev

Once build completes:
1. Go to https://expo.dev
2. Navigate to your project: `keiros-service-app-v3`
3. View build history and download links
4. Download the APK/AAB file

### 7. Install and Test

- Install the APK on your Android device
- Test Bluetooth connectivity with ESP32
- Verify all commands work correctly

## Troubleshooting

### If build fails:
- Check that all dependencies are installed: `npm install`
- Verify `app.json` configuration is correct
- Check EAS build logs on expo.dev

### For updates after initial build:
- Use `expo publish` for JS-only updates (after initial EAS build)
- Or create new EAS builds for native code changes

## Next Steps After Publishing

1. Test the app thoroughly on a physical Android device
2. Test Bluetooth connection with ESP32
3. Verify all commands work correctly
4. Submit to Play Store when ready (using `npm run submit:android`)

