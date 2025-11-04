# Manual Setup Instructions for Expo.dev

Since `eas init` requires interactive input, please follow these steps **manually in your terminal**:

## Option 1: Create New Project (Recommended)

1. **Open your terminal** in the project directory (`f:\Keiros_Service_App_V3`)

2. **Run this command:**
   ```bash
   eas init
   ```
   
3. **When prompted:**
   - Type `yes` or `y` to create a new project
   - It will create a project with slug: `keiros-service-app-v3`
   - This will automatically add the project ID to `app.json`

4. **Then start the build:**
   ```bash
   eas build --platform android --profile preview
   ```

## Option 2: Link to Existing Project (if you want to use "keiros-service")

If you want to use your existing "keiros-service" project instead:

1. **Get the project ID from Expo.dev:**
   - Go to https://expo.dev
   - Navigate to "keiros-service" project
   - Copy the full project ID (UUID format, not just "a693c93c")

2. **Add it to `app.json`:**
   ```json
   "extra": {
     "eas": {
       "projectId": "YOUR-PROJECT-ID-HERE"
     },
     "router": {
       "origin": false
     }
   }
   ```

3. **Then start the build:**
   ```bash
   eas build --platform android --profile preview
   ```

## Option 3: Use Web Interface

1. Go to https://expo.dev
2. Click "Create a project" or "Add project"
3. Enter slug: `keiros-service-app-v3`
4. Copy the project ID that's generated
5. Add it to `app.json` as shown in Option 2
6. Then run the build command

## After Project is Linked

Once the project is linked (either method above), you can build with:

```bash
# Preview build (APK for testing)
npm run build:android:preview

# Production build (AAB for Play Store)
npm run build:android:production
```

The build will start on Expo's servers and you'll see progress in your terminal and on expo.dev.

