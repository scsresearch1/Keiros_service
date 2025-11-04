const { withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Config plugin to ensure react-native-bluetooth-serial-next
 * and all other subprojects have compileSdkVersion set correctly.
 * 
 * This is required because:
 * - react-native-bluetooth-serial-next uses Java 9+ features
 * - It requires compileSdkVersion >= 30 (we set 34 for full compatibility)
 * - expo-build-properties doesn't apply to all subprojects (known Expo issue)
 * - Gradle 8.8 compatible syntax
 * 
 * Reference: https://github.com/expo/expo/issues/36461
 * 
 * This plugin resolves compatibility issues with:
 * - Gradle 8.8
 * - Android SDK 34
 * - Deprecated libraries that require compileSdkVersion >= 30
 */
const withBluetoothCompileSdk = (config) => {
  return withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // First, ensure ext properties are set in buildscript (if buildscript block exists)
    // This allows subprojects to reference compileSdkVersion
    // Fixed: Properly check if buildscript exists AND ext block is missing OR compileSdkVersion is missing
    const hasBuildscript = buildGradle.includes('buildscript');
    const hasExtInBuildscript = /buildscript\s*\{[\s\S]*?ext\s*\{/.test(buildGradle);
    const hasCompileSdkInBuildscript = /buildscript\s*\{[\s\S]*?compileSdkVersion/.test(buildGradle);
    
    if (hasBuildscript && (!hasExtInBuildscript || !hasCompileSdkInBuildscript)) {
      // Add ext properties to buildscript if not already present
      const buildscriptEndPattern = /(buildscript\s*\{[\s\S]*?dependencies\s*\{[^}]*\})\s*\}/;
      if (buildscriptEndPattern.test(buildGradle)) {
        buildGradle = buildGradle.replace(buildscriptEndPattern, (match) => {
          // Check if ext already exists in this match
          if (match.includes('ext {')) {
            // Add compileSdkVersion to existing ext block
            return match.replace(/(ext\s*\{[^}]*?)(\})/, '$1\n        compileSdkVersion = 34\n    $2');
          } else {
            // Add new ext block
            return match.replace(/(dependencies\s*\{[^}]*\})\s*(\})/, '$1\n    ext {\n        compileSdkVersion = 34\n    }\n$2');
          }
        });
      }
    }
    
    // Define the subprojects block - COMPREHENSIVE Gradle 8.8 compatible solution
    // This ensures ALL subprojects (including react-native-bluetooth-serial-next) 
    // use compileSdkVersion 34, which satisfies the >= 30 requirement
    // MUST set compileSdk BEFORE evaluation - afterEvaluate is too late!
    const subprojectsBlock = `subprojects { subproject ->
    // COMPREHENSIVE compileSdkVersion configuration for Gradle 8.8
    // MUST set compileSdk BEFORE evaluation - afterEvaluate is too late!
    
    // Method 1: Set ext property for subprojects to reference
    subproject.ext.compileSdkVersion = 34
    
    // Method 2: beforeEvaluate - PRIMARY method (executes before evaluation)
    // Configure android extension directly - this is safe in beforeEvaluate
    subproject.beforeEvaluate { project ->
        // Configure extension if it exists (for plugins already applied)
        try {
            if (project.extensions.findByName('android')) {
                project.extensions.configure('android') { android ->
                    android.compileSdkVersion 34
                }
            }
        } catch (Exception e) {
            // Extension doesn't exist yet - that's fine
        }
    }
    
    // Method 3: plugins.withId - handles plugins applied via plugins {} block
    // This executes when plugin is applied (before evaluation)
    subproject.plugins.withId('com.android.application') { plugin ->
        subproject.android {
            compileSdkVersion 34
        }
    }
    subproject.plugins.withId('com.android.library') { plugin ->
        subproject.android {
            compileSdkVersion 34
        }
    }
}`;
    
    // Check if our specific configuration already exists (avoid duplicates)
    // Look for our exact pattern - must have subprojects block with beforeEvaluate and compileSdkVersion 34
    const hasOurConfig = /subprojects\s*\{[^}]*beforeEvaluate[^}]*compileSdkVersion\s*34/.test(buildGradle);
    
    if (hasOurConfig) {
      // Already configured correctly, skip to avoid duplicates
      return config;
    }
    
    // Check if any subprojects block exists
    const subprojectsMatch = buildGradle.match(/subprojects\s*\{/);
    
    if (subprojectsMatch) {
      // Find the matching closing brace for the subprojects block
      // Must handle nested braces, strings, and comments properly
      const startIdx = subprojectsMatch.index;
      let depth = 0;
      let endIdx = startIdx;
      let inString = false;
      let stringChar = null;
      let inComment = false;
      let inLineComment = false;
      
      for (let i = startIdx; i < buildGradle.length; i++) {
        const char = buildGradle[i];
        const nextChar = i < buildGradle.length - 1 ? buildGradle[i + 1] : null;
        const prevChar = i > 0 ? buildGradle[i - 1] : null;
        
        // Handle strings (single and double quotes)
        if (!inComment && (char === '"' || char === "'" || char === '`')) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = null;
          }
          continue;
        }
        
        // Skip processing if inside string
        if (inString) continue;
        
        // Handle block comments
        if (char === '/' && nextChar === '*') {
          inComment = true;
          i++; // Skip next char
          continue;
        }
        if (char === '*' && nextChar === '/') {
          inComment = false;
          i++; // Skip next char
          continue;
        }
        if (inComment) continue;
        
        // Handle line comments
        if (char === '/' && nextChar === '/') {
          inLineComment = true;
          continue;
        }
        if (inLineComment && char === '\n') {
          inLineComment = false;
          continue;
        }
        if (inLineComment) continue;
        
        // Count braces
        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      
      // Replace the entire subprojects block with our configuration
      const before = buildGradle.substring(0, startIdx).trim();
      const after = buildGradle.substring(endIdx).trim();
      buildGradle = before + '\n' + subprojectsBlock + '\n' + after;
    } else {
      // No subprojects block exists - append it at the end
      buildGradle = buildGradle.trim() + '\n\n' + subprojectsBlock;
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });
};

module.exports = withBluetoothCompileSdk;

