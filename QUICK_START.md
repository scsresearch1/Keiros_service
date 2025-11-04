# Quick Start: Fix Build Issue

## The Problem
The build didn't start because the EAS project isn't linked yet. This requires an interactive command.

## The Solution (Choose One):

### ✅ EASIEST: Run in Your Terminal

1. **Open PowerShell or Command Prompt** in this folder (`f:\Keiros_Service_App_V3`)

2. **Run this command:**
   ```bash
   eas init
   ```

3. **When it asks:** "Would you like to create a project for @scs.research.india/keiros-service-app-v3?"
   - Type: **`yes`** and press Enter

4. **It will automatically:**
   - Create the project on Expo.dev
   - Add the project ID to `app.json`
   - Link everything up

5. **Then start the build:**
   ```bash
   npm run build:android:preview
   ```

### Alternative: Use the Batch Script

Just double-click `init-eas-project.bat` in Windows Explorer, or run:
```bash
.\init-eas-project.bat
```

### Alternative: Use Web Interface

1. Go to https://expo.dev
2. Click "Create a project"
3. Slug: `keiros-service-app-v3`
4. Copy the project ID
5. I'll add it to `app.json` for you

---

## After Linking

Once `eas init` completes successfully, you can build with:

```bash
# Preview build (APK for testing)
npm run build:android:preview

# Production build (AAB for Play Store)  
npm run build:android:production
```

The build will start on Expo's servers and you can monitor it at https://expo.dev

