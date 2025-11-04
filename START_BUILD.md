# How to Start the Build on Expo.dev

## The Issue
The build hasn't started because it requires **interactive confirmation** that can't be automated.

## Solution: Run This Command in Your Terminal

Open PowerShell or Command Prompt in the project folder and run:

```bash
cd f:\Keiros_Service_App_V3
eas build --platform android --profile preview
```

## What Will Happen

1. **EAS will ask:** "Generate a new Android Keystore?"
   - **Type:** `yes` or `y` and press Enter

2. **The build will then:**
   - ✅ Generate Android keystore automatically
   - ✅ Upload your project to Expo servers
   - ✅ Start building the APK
   - ✅ Show you a QR code and build URL

3. **Monitor progress:**
   - In your terminal (real-time logs)
   - On Expo.dev: https://expo.dev/projects/keirosservice/builds
   - You'll get an email when complete

## Expected Build Time

- **First build:** 10-20 minutes (sets up build environment)
- **Subsequent builds:** 5-10 minutes (uses cached environment)

## After Build Completes

1. Go to https://expo.dev/projects/keirosservice
2. Click on the completed build
3. Download the APK file
4. Install on your Android device to test

## Troubleshooting

If the build fails:
- Check the error message in the terminal
- View detailed logs on https://expo.dev/projects/keirosservice/builds
- Make sure all dependencies are installed: `npm install`

## Alternative: Check Build Status

To see if a build is already running:

```bash
eas build:list --platform android
```

To view build details:

```bash
eas build:view
```

