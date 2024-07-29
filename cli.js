#!/usr/bin/env node

// Complete CLI Runner for AI Engineer GitHub Activity Display v3.0
const path = require('path');
const fs = require('fs');

// Import utility functions to ensure prototype methods are available
const utilityFunctions = require('./utility-functions.js');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const version = args[1];
const repoPath = process.cwd();

// Parse options
const options = {};
args.forEach(arg => {
  if (arg.startsWith('--intensity=')) {
    options.intensity = arg.split('=')[1];
  }
  if (arg === '--keep-in-view' || arg === '-k') {
    options.keepInView = true;
  }
  if (arg.startsWith('--commits=')) {
    options.commitsPerDay = parseInt(arg.split('=')[1]);
  }
  if (arg === '--dry-run' || arg === '-d') {
    options.dryRun = true;
  }
  if (arg === '--force-replace' || arg === '-f') {
    options.forceReplace = true;
  }
  if (arg === '--no-center') {
    options.centerMessage = false;
  }
  if (arg === '--use-utc') {
    options.useUtc = true;
  }
});

function main() {
  console.log('🤖 AI Engineer GitHub Activity Display CLI v3.0');
  console.log('='.repeat(55));

  switch(command) {
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp();
      break;
      
    case 'versions':
    case 'list':
    case 'v':
      console.log('📋 Available versions and settings:\n');
      try {
        const { AIEngineerActivityGenerator } = require('./activity-generator.js');
        AIEngineerActivityGenerator.showAvailableVersions();
      } catch (error) {
        console.error('❌ Error loading activity generator:', error.message);
        console.log('💡 Make sure all required files exist in this directory:');
        console.log('   • activity-generator.js (core class)');
        console.log('   • utility-functions.js (helper functions)');
        process.exit(1);
      }
      break;
      
    case 'preview':
    case 'p':
      if (!version) {
        console.error('❌ Please specify a version to preview');
        console.log('Example: node cli.js preview "AWS HERO" --intensity=ultra');
        process.exit(1);
      }
      console.log(`🔍 Previewing "${version}" pattern...\n`);
      try {
        // First load utility functions to ensure prototype methods are available
        require('./utility-functions.js');
        
        // Then create the generator
        const { AIEngineerActivityGenerator } = require('./activity-generator.js');
        const generator = new AIEngineerActivityGenerator(repoPath, version, options);
        
        // Now call previewPattern
        generator.previewPattern();
      } catch (error) {
        console.error('❌ Preview error:', error.message);
        if (error.message.includes('too wide')) {
          console.log('💡 Try using --force-replace to override size limits');
        }
        process.exit(1);
      }
      break;
      
    case 'replace':
    case 'swap':
      if (!version) {
        console.error('❌ Please specify a new version to replace current message');
        console.log('Example: node cli.js replace "AWS HERO" --intensity=ultra');
        process.exit(1);
      }
      
      console.log(`🔄 Replacing current message with "${version}"...\n`);
      try {
        const { replaceMessage } = require('./utility-functions.js');
        
        replaceMessage(repoPath, version, options)
          .then(() => {
            console.log('\n🎯 Next steps:');
            console.log('1. Push with force flag: git push -f origin HEAD');
            console.log('2. Wait 5-10 minutes for GitHub to update the activity graph');
            console.log('3. Your new message will be displayed!');
          })
          .catch(error => {
            console.error('❌ Replacement error:', error.message);
            if (error.message.includes('too wide')) {
              console.log('💡 Try adding --force-replace to override size limits');
            }
            process.exit(1);
          });
      } catch (error) {
        console.error('❌ Error loading utility functions:', error.message);
        process.exit(1);
      }
      break;
      
    case 'create':
    case 'generate':
    case 'c':
      if (!version) {
        console.error('❌ Please specify a version to create');
        console.log('Example: node cli.js create "AWS HERO" --intensity=ultra --force-replace');
        process.exit(1);
      }
      
      // Check if git repo exists
      if (!fs.existsSync('.git')) {
        console.log('⚠️  No git repository found. Initializing...');
        try {
          const { execSync } = require('child_process');
          execSync('git init');
          console.log('✅ Git repository initialized');
        } catch (error) {
          console.error('❌ Failed to initialize git:', error.message);
          process.exit(1);
        }
      }
      
      console.log(`🚀 Creating "${version}" activity pattern...\n`);
      try {
        const { setupAIEngineerDisplay } = require('./utility-functions.js');
        
        setupAIEngineerDisplay(repoPath, version, options)
          .then(() => {
            console.log('\n🎯 Next steps:');
            console.log('1. Make sure you have a GitHub repository set up:');
            console.log('   git remote add origin https://github.com/USERNAME/REPO.git');
            console.log('2. Push your changes:');
            if (options.forceReplace) {
              console.log('   git push -f origin HEAD  # Force push for replacements');
            } else {
              console.log('   git push -u origin HEAD');
            }
            console.log('3. Check your GitHub profile in 5-10 minutes!');
          })
          .catch(error => {
            console.error('❌ Creation error:', error.message);
            if (error.message.includes('too wide')) {
              console.log('💡 Try adding --force-replace to override size limits');
            }
            process.exit(1);
          });
      } catch (error) {
        console.error('❌ Error loading utility functions:', error.message);
        process.exit(1);
      }
      break;
      
    case 'refresh':
    case 'r':
      console.log('🔄 Refreshing existing pattern...\n');
      try {
        const { refreshAIEngineerDisplay } = require('./utility-functions.js');
        
        refreshAIEngineerDisplay(repoPath)
          .then(() => {
            console.log('\n✅ Pattern refreshed! Push with: git push -f origin HEAD');
          })
          .catch(error => {
            console.error('❌ Refresh error:', error.message);
            process.exit(1);
          });
      } catch (error) {
        console.error('❌ Error loading utility functions:', error.message);
        process.exit(1);
      }
      break;
      
    case 'status':
    case 's':
      showStatus();
      break;
      
    case 'setup':
      interactiveSetup()
        .then(() => {
          console.log('\n✅ Setup completed!');
        })
        .catch(error => {
          console.error('❌ Setup error:', error.message);
          process.exit(1);
        });
      break;
      
    case 'window':
    case 'w':
      showCurrentWindow();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
📖 USAGE:
  node cli.js <command> [version] [options]

🎯 COMMANDS:
  help, h                 Show this help message
  versions, list, v       List all available versions and settings
  preview, p <version>    Preview pattern without creating commits
  create, c <version>     Create the activity pattern  
  replace <version>       Replace existing message with new one
  refresh, r             Refresh existing pattern to stay in view
  status, s              Show current repository status
  window, w              Show current GitHub activity window
  setup                  Interactive setup wizard

✨ VERSIONS:
  AI, ML, DL             Excellent visibility (11 weeks) ⭐ recommended
  LLM, GPT, NLP, AIE     Good visibility (17 weeks)
  AIDEV, NEURAL, BRAIN   Fair visibility (29-35 weeks)
  "AWS HERO"             Custom message (use quotes for spaces)

⚙️  OPTIONS:
  --intensity=<level>     Brightness: low, medium, high, max, ultra, extreme
  --keep-in-view, -k     Enable auto-refresh to stay visible
  --force-replace, -f    Force replace existing pattern
  --no-center           Don't center message (left-align instead)
  --commits=<number>     Custom commits per pixel (overrides intensity)
  --dry-run, -d         Preview only, don't create commits

🚀 EXAMPLES:

  # Quick start with ultra brightness (recommended)
  node cli.js create AI --intensity=ultra

  # Replace existing message with maximum visibility
  node cli.js replace "AWS HERO" --intensity=ultra --force-replace

  # Preview before creating to check positioning
  node cli.js preview "AWS HERO" --intensity=extreme

  # Check current GitHub activity window
  node cli.js window

  # See all available options
  node cli.js versions

⚡ QUICK REPLACEMENT SEQUENCE:
  1. node cli.js replace "NEW MESSAGE" --intensity=ultra --force-replace
  2. git push -f origin main
  3. Check GitHub profile in 5-10 minutes! 🎉

🔄 MESSAGE REPLACEMENT:
  • Use 'replace' command to swap messages completely
  • Old commits are removed and replaced with new pattern
  • Pattern is automatically centered in current GitHub window
  • Use --force-replace for oversized messages

📅 WINDOW MANAGEMENT:
  • GitHub shows a rolling 53-week window
  • Messages are automatically centered for maximum visibility  
  • Use 'window' command to see current date range
  • Refresh periodically to stay in view

💡 TIP: Use 'node cli.js setup' for interactive guided setup
`);
}

function showCurrentWindow() {
  try {
    const { AIEngineerActivityGenerator } = require('./activity-generator.js');
    const generator = new AIEngineerActivityGenerator('', 'AI');
    const { startDate, endDate } = generator.getCurrentGitHubWindow();
    
    console.log('📅 Current GitHub Activity Window:');
    console.log(`   • Start: ${startDate.toDateString()}`);
    console.log(`   • End: ${endDate.toDateString()}`);
    console.log(`   • Total weeks: 53`);
    console.log(`   • Rolling window updates daily`);
    
    // Calculate how much time is left before messages start disappearing
    const now = new Date();
    const weeksFromStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
    console.log(`   • Current position: Week ${weeksFromStart + 1} of 53`);
    
    if (weeksFromStart > 40) {
      console.log('   ⚠️  Window is getting close to rollover - consider refreshing patterns');
    }
    
  } catch (error) {
    console.error('❌ Error loading activity generator:', error.message);
  }
}

function showStatus() {
  const configPath = path.join(repoPath, '.github-activity-config.json');
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('📊 Current Configuration:');
      console.log(`   • Version: "${config.version}"`);
      console.log(`   • Intensity: ${config.options.intensity || 'custom'}`);
      console.log(`   • Commits per pixel: ${config.options.commitsPerDay}`);
      console.log(`   • Positioning: ${config.options.centerMessage ? 'Centered' : 'Left-aligned'}`);
      console.log(`   • Keep in view: ${config.options.keepInView ? 'Yes' : 'No'}`);
      console.log(`   • Message width: ${config.messageWidth} weeks`);
      console.log(`   • Created: ${new Date(config.created).toLocaleDateString()}`);
      
      if (config.windowInfo) {
        console.log('\n📅 GitHub Window (when created):');
        console.log(`   • Window start: ${new Date(config.windowInfo.startDate).toDateString()}`);
        console.log(`   • Window end: ${new Date(config.windowInfo.endDate).toDateString()}`);
      }
      
      if (config.options.keepInView && config.refreshSchedule?.length > 0) {
        const nextRefresh = new Date(config.refreshSchedule[0]);
        const now = new Date();
        const daysUntilRefresh = Math.ceil((nextRefresh - now) / (1000 * 60 * 60 * 24));
        
        console.log(`\n🔄 Auto-refresh schedule:`);
        console.log(`   • Next refresh: ${nextRefresh.toDateString()}`);
        if (daysUntilRefresh <= 0) {
          console.log('   ⚠️  Refresh needed now! Run: node cli.js refresh');
        } else {
          console.log(`   • Days until refresh: ${daysUntilRefresh}`);
        }
      }
    } catch (error) {
      console.error('❌ Error reading configuration:', error.message);
    }
  } else {
    console.log('📄 No activity pattern found in this directory');
    console.log('💡 Run "node cli.js create <version>" to get started');
  }
  
  // Check git status
  try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    
    if (gitStatus.trim()) {
      console.log('\n📝 Uncommitted changes detected');
      console.log('💡 Run "git push -f origin main" to update GitHub');
    } else {
      console.log('\n✅ Repository is up to date');
    }
  } catch (error) {
    console.log('\n⚠️  Not a git repository or git not available');
  }
}

function interactiveSetup() {
  return new Promise((resolve, reject) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
    
    console.log('🎯 Interactive Setup Wizard v3.0');
    console.log('='.repeat(35));
    
    (async () => {
      try {
        // Show current GitHub window first
        try {
          console.log('\n📅 Current GitHub Activity Window:');
          const { AIEngineerActivityGenerator } = require('./activity-generator.js');
          const generator = new AIEngineerActivityGenerator('', 'AI');
          const { startDate, endDate } = generator.getCurrentGitHubWindow();
          console.log(`   From: ${startDate.toDateString()}`);
          console.log(`   To: ${endDate.toDateString()}`);
        } catch (error) {
          console.log('   (Unable to calculate window - files may be missing)');
        }
        
        // Show available versions
        console.log('\n📋 Available versions:');
        const versions = [
          'AI ⭐ (recommended)', 'ML', 'DL', 'LLM', 'GPT', 'NLP', 
          'NEURAL', 'BRAIN', 'AWS HERO', 'Custom...'
        ];
        versions.forEach((v, i) => console.log(`${i + 1}. ${v}`));
        
        const versionChoice = await question('\nChoose version (1-10 or type custom): ');
        let selectedVersion = 'AI';
        
        const versionNum = parseInt(versionChoice);
        if (versionNum >= 1 && versionNum <= 9) {
          selectedVersion = versions[versionNum - 1].split(' ')[0];
        } else if (versionNum === 10) {
          selectedVersion = await question('Enter custom message: ');
        } else if (versionChoice.length > 0) {
          selectedVersion = versionChoice.toUpperCase().trim();
        }
        
        console.log('\n🔥 Intensity levels:');
        console.log('1. Low (3 commits per pixel)');
        console.log('2. Medium (8 commits per pixel)');
        console.log('3. High (15 commits per pixel)');
        console.log('4. Max (20 commits per pixel)');
        console.log('5. Ultra (25 commits per pixel) ⭐ recommended');
        console.log('6. Extreme (30 commits per pixel - maximum)');
        
        const intensityChoice = await question('\nChoose intensity (1-6): ');
        const intensityMap = { 
          '1': 'low', '2': 'medium', '3': 'high', 
          '4': 'max', '5': 'ultra', '6': 'extreme' 
        };
        const selectedIntensity = intensityMap[intensityChoice] || 'ultra';
        
        const centerChoice = await question('\nCenter message in GitHub window? (Y/n): ');
        const centerMessage = !centerChoice.toLowerCase().startsWith('n');
        
        const replaceChoice = await question('\nReplace existing pattern completely? (y/N): ');
        const forceReplace = replaceChoice.toLowerCase().startsWith('y');
        
        const keepInViewChoice = await question('\nKeep pattern always visible with auto-refresh? (y/N): ');
        const keepInView = keepInViewChoice.toLowerCase().startsWith('y');
        
        console.log('\n📋 Your configuration:');
        console.log(`   • Version: "${selectedVersion}"`);
        console.log(`   • Intensity: ${selectedIntensity}`);
        console.log(`   • Positioning: ${centerMessage ? 'Centered' : 'Left-aligned'}`);
        console.log(`   • Force replace: ${forceReplace ? 'Yes' : 'No'}`);
        console.log(`   • Keep in view: ${keepInView ? 'Yes' : 'No'}`);
        
        const confirmChoice = await question('\nProceed with this setup? (Y/n): ');
        
        if (!confirmChoice.toLowerCase().startsWith('n')) {
          console.log('\n🚀 Creating your AI Engineer activity pattern...\n');
          
          // Check if required files exist
          const requiredFiles = ['activity-generator.js'];
          const missingFiles = requiredFiles.filter(file => !fs.existsSync(`./${file}`));
          
          if (missingFiles.length > 0) {
            console.error('❌ Missing required files:');
            missingFiles.forEach(file => console.log(`   • ${file}`));
            console.log('\n💡 Make sure all script files are saved in this directory');
            rl.close();
            reject(new Error('Required files not found'));
            return;
          }
          
          const { setupAIEngineerDisplay } = require('./utility-functions.js');
          
          await setupAIEngineerDisplay(repoPath, selectedVersion, {
            intensity: selectedIntensity,
            centerMessage: centerMessage,
            forceReplace: forceReplace,
            keepInView: keepInView
          });
          
          console.log('\n🎉 Setup complete!');
          console.log('\n📋 Next steps:');
          console.log('1. Create a GitHub repository (e.g., "ai-engineer-activity")');
          console.log('2. Run: git remote add origin https://github.com/USERNAME/REPO.git');
          if (forceReplace) {
            console.log('3. Run: git push -f origin main');
          } else {
            console.log('3. Run: git push -u origin main');
          }
          console.log('4. Check your GitHub profile in 5-10 minutes!');
          console.log('\n💡 Pro tip: Make the repository private if you prefer');
        } else {
          console.log('❌ Setup cancelled.');
        }
        
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        rl.close();
      }
    })();
  });
}

// Utility function to check if required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    { file: 'activity-generator.js', description: 'Core activity generator class' },
    { file: 'utility-functions.js', description: 'Setup and utility functions' }
  ];
  
  const missingFiles = requiredFiles.filter(({file}) => !fs.existsSync(`./${file}`));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:');
    missingFiles.forEach(({file, description}) => {
      console.log(`   • ${file} (${description})`);
    });
    console.log('\n💡 Please save all script components in this directory');
    console.log('📖 Refer to the setup instructions for file contents');
    return false;
  }
  return true;
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unexpected error:', error.message);
  console.log('💡 Try "node cli.js help" for usage information');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  process.exit(0);
});

// Run the CLI with file check
if (command !== 'help' && command !== '--help' && command !== '-h' && command !== undefined) {
  if (!checkRequiredFiles()) {
    process.exit(1);
  }
}

main();
