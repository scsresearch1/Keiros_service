# Build Instructions - Final Steps

## ✅ Completed
- ✅ Project linked to Expo.dev (ID: 8657b0f9-0d7a-43d7-a32b-c34a8e262aef)
- ✅ Git repository initialized
- ✅ All files committed
- ✅ EAS configuration ready

## 🔧 Final Step (Run in Your Terminal)

The build needs to generate an Android keystore, which requires interactive confirmation.

### Option 1: Let EAS Generate Keystore (Recommended)

Run this in your terminal:

```bash
cd f:\Keiros_Service_App_V3
eas build --platform android --profile preview
```

When prompted: **"Generate a new Android Keystore?"**
- Type: **`yes`** or **`y`** and press Enter

EAS will:
- Generate a keystore automatically
- Store it securely on Expo servers
- Use it for all future builds

### Option 2: Use Existing Keystore

If you already have a keystore:

```bash
eas credentials
```

Then select:
- Platform: Android
- Action: Use existing keystore
- Upload your keystore file

## After Keystore is Set Up

Once the keystore is configured, the build will:
1. ✅ Start on Expo's build servers
2. ✅ Show you a QR code and build URL
3. ✅ Take 10-20 minutes (first build)
4. ✅ Be available on https://expo.dev

## Monitor Build Progress

- **Terminal**: You'll see build progress
- **Web**: Go to https://expo.dev → keirosservice → Builds
- **Email**: You'll get notified when build completes

## Download Build

Once complete:
1. Go to https://expo.dev/projects/keirosservice/builds
2. Click on the completed build
3. Download the APK file
4. Install on your Android device

## Next Builds

After the first build, subsequent builds are faster (5-10 minutes) because:
- Keystore is already configured
- Build environment is cached
- Dependencies are pre-installed

---

**Quick Command Reference:**

```bash
# Preview build (APK for testing)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production

# View build status
eas build:list
```

