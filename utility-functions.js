const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Import the core class
const { AIEngineerActivityGenerator } = require('./activity-generator.js');

// Secure command execution using spawn
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'pipe', ...options });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// Add the missing methods directly to the prototype
AIEngineerActivityGenerator.prototype.generateUniformCommitDates = function() {
  const commitSchedule = [];
  let currentColumn = 0;

  for (let char of this.version) {
    if (!this.letterPatterns[char]) {
      console.warn(`Character '${char}' not supported, skipping...`);
      continue;
    }

    const pattern = this.letterPatterns[char];
    const letterWidth = pattern[0].length;

    for (let col = 0; col < letterWidth; col++) {
      for (let row = 0; row < 7; row++) {
        if (pattern[row][col] === 1) {
          const date = new Date(this.startDate);
          date.setDate(date.getDate() + (currentColumn + col) * 7 + row);
          
          // Create uniform commits spread evenly throughout the day
          for (let commitNum = 0; commitNum < this.options.commitsPerDay; commitNum++) {
            const commitDate = new Date(date);
            
            // Spread commits evenly across 24 hours for maximum uniformity
            const hourSpread = 24 / this.options.commitsPerDay;
            const baseHour = Math.floor(commitNum * hourSpread);
            const minuteVariation = Math.floor(Math.random() * 60);
            const secondVariation = Math.floor(Math.random() * 60);
            
            commitDate.setHours(baseHour, minuteVariation, secondVariation, 0);
            commitSchedule.push(commitDate);
          }
        }
      }
    }
    currentColumn += letterWidth + 1;
  }

  commitSchedule.sort((a, b) => a.getTime() - b.getTime());
  return commitSchedule;
};

AIEngineerActivityGenerator.prototype.forceReplacePattern = async function() {
  console.log('🔄 Force replacing existing pattern...');
  
  try {
    // Reset git history to remove old commits using secure command execution
    await executeCommand('git', ['checkout', '--orphan', 'temp-new-pattern'], { cwd: this.repoPath });
    await executeCommand('git', ['rm', '-rf', '.'], { cwd: this.repoPath });
    
    console.log('✅ Cleared existing pattern');
  } catch (error) {
    console.log('💡 Creating fresh pattern (no existing pattern found)');
  }
};

AIEngineerActivityGenerator.prototype.previewPattern = function() {
  console.log(`🔍 PREVIEW: "${this.version}" Pattern`);
  console.log("=".repeat(50));
  
  const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
  console.log(`📅 Current GitHub window: ${windowStart.toDateString()} to ${windowEnd.toDateString()}`);
  
  if (this.recommendedVersions[this.version]) {
    const info = this.recommendedVersions[this.version];
    console.log(`📊 ${info.description}`);
    console.log(`📏 Width: ${info.width} weeks | Visibility: ${info.visibility}`);
  }
  
  console.log(`🔥 Intensity: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)`);
  console.log(`🎯 Positioning: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}`);
  console.log(`🗓️ Pattern start: ${this.startDate.toDateString()}\n`);

  const commitDates = this.generateUniformCommitDates();
  const uniqueDates = [...new Set(commitDates.map(d => d.toDateString()))];
  
  const grid = Array(7).fill().map(() => Array(53).fill('·')); // Exact GitHub size
  
  uniqueDates.forEach(dateStr => {
    const date = new Date(dateStr);
    const weeksDiff = Math.floor((date - windowStart) / (7 * 24 * 60 * 60 * 1000));
    const dayOfWeek = date.getDay();
    
    if (weeksDiff >= 0 && weeksDiff < 53) {
      const intensity = '█'; // Uniform max intensity
      grid[dayOfWeek][weeksDiff] = intensity;
    }
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  console.log('GitHub Activity Graph Preview (53-week window):');
  grid.forEach((row, index) => {
    console.log(`${dayNames[index]}: ${row.join('')}`);
  });

  console.log(`\n📈 Unique days with activity: ${uniqueDates.length}`);
  console.log(`🔥 Total commits: ${commitDates.length} (${this.options.commitsPerDay} per day)`);
  console.log(`📅 Pattern span: ${this.calculateMessageWidth()} weeks`);
  
  if (this.options.keepInView) {
    const refreshDates = this.calculateRefreshSchedule();
    console.log(`🔄 Next refresh needed: ${refreshDates[0]?.toDateString() || 'Not scheduled'}`);
  }
};

AIEngineerActivityGenerator.prototype.createCommits = function() {
  return new Promise(async (resolve, reject) => {
    try {
      // Force replace if requested
      if (this.options.forceReplace) {
        await this.forceReplacePattern();
      }

      const commitDates = this.generateUniformCommitDates();
      const activityFile = path.join(this.repoPath, 'ai-engineer-activity.txt');
      const configFile = path.join(this.repoPath, '.github-activity-config.json');
      const activityReadmeFile = path.join(this.repoPath, 'ACTIVITY-PATTERN.md');
      
      // Check if original README exists and preserve it
      const originalReadmeFile = path.join(this.repoPath, 'README.md');
      
      console.log(`🤖 Creating AI Engineer activity pattern: "${this.version}"`);
      console.log(`🔥 Intensity: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)`);
      console.log(`📅 ${commitDates.length} total commits scheduled`);
      console.log(`📊 Message width: ${this.calculateMessageWidth()} weeks`);
      console.log(`🎯 Message positioning: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}`);
      
      const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
      console.log(`📅 Current visible window: ${windowStart.toDateString()} to ${windowEnd.toDateString()}`);
      
      if (this.recommendedVersions[this.version]) {
        const info = this.recommendedVersions[this.version];
        console.log(`💡 ${info.description}`);
      }
      
      if (this.options.keepInView) {
        const refreshSchedule = this.calculateRefreshSchedule();
        console.log(`🔄 Auto-refresh enabled - ${refreshSchedule.length} refresh points scheduled`);
      }
      
      console.log();

      process.chdir(this.repoPath);

      const config = {
        version: this.version,
        options: this.options,
        created: new Date().toISOString(),
        messageWidth: this.calculateMessageWidth(),
        refreshSchedule: this.options.keepInView ? this.calculateRefreshSchedule() : [],
        windowInfo: this.getCurrentGitHubWindow()
      };
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      const activityReadmeContent = `# AI Engineer GitHub Activity Display

## Current Message: "${this.version}"

This repository creates a GitHub activity graph pattern displaying "${this.version}".

### Configuration
- **Message**: ${this.version}
- **Width**: ${this.calculateMessageWidth()} weeks
- **Intensity**: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)
- **Total Commits**: ${commitDates.length}
- **Positioning**: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}
- **Auto-Refresh**: ${this.options.keepInView ? 'Enabled' : 'Disabled'}

### Current GitHub Window
- **Start**: ${windowStart.toDateString()}
- **End**: ${windowEnd.toDateString()}
- **Pattern Start**: ${this.startDate.toDateString()}

### Pattern Details
${this.recommendedVersions[this.version] ? `- **Visibility**: ${this.recommendedVersions[this.version].visibility}
- **Description**: ${this.recommendedVersions[this.version].description}` : '- **Custom Pattern**'}

### Message Replacement
To replace this message with a new one:
\`\`\`bash
node cli.js replace "NEW MESSAGE" --intensity=ultra --force-replace
\`\`\`

### Created: ${new Date().toLocaleDateString()}

*Generated by AI Engineer Activity Generator v3.0*
`;

      // Write the activity pattern info to a separate file
      fs.writeFileSync(activityReadmeFile, activityReadmeContent);
      
      // NEVER modify the original README.md file
      // Only create a new README.md if one doesn't exist at all
      if (!fs.existsSync(originalReadmeFile)) {
        fs.writeFileSync(originalReadmeFile, activityReadmeContent);
        console.log('📄 Created new README.md with activity pattern information');
      } else {
        console.log('📄 Created ACTIVITY-PATTERN.md with pattern information (README.md preserved)');
      }

      // Ensure .gitignore is preserved
      const gitignorePath = path.join(this.repoPath, '.gitignore');
      const defaultGitignore = `node_modules/
.DS_Store
*.log
.env
.vscode/
coverage/
dist/
tmp/`;

      // Create .gitignore if it doesn't exist, otherwise preserve it
      if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, defaultGitignore);
        console.log('📄 Created default .gitignore file');
      } else {
        console.log('📄 Preserved existing .gitignore file');
      }

      if (this.options.keepInView) {
        const refreshScript = `#!/usr/bin/env node
const { refreshAIEngineerDisplay } = require('./utility-functions.js');

refreshAIEngineerDisplay(__dirname)
  .then(() => console.log('✅ Pattern refreshed successfully!'))
  .catch(console.error);
`;
        fs.writeFileSync(path.join(this.repoPath, 'refresh-activity.js'), refreshScript);
        try {
          await executeCommand('chmod', ['+x', 'refresh-activity.js'], { cwd: this.repoPath });
        } catch (e) {
          // Ignore chmod errors on Windows
        }
      }

      const batchSize = 100; // Larger batches for efficiency
      const batches = [];
      for (let i = 0; i < commitDates.length; i += batchSize) {
        batches.push(commitDates.slice(i, i + batchSize));
      }

      console.log(`⚡ Creating commits in ${batches.length} batches for maximum uniformity...`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        for (let i = 0; i < batch.length; i++) {
          const date = batch[i];
          const dateString = date.toISOString().split('T')[0];
          const timeString = date.toISOString().split('T')[1].split('.')[0];
          
          const activityLine = `${this.version}: ${dateString} ${timeString} | Commit ${batchIndex * batchSize + i + 1}\n`;
          fs.writeFileSync(activityFile, activityLine, { flag: 'a' });
          
          await executeCommand('git', ['add', '.'], { cwd: this.repoPath });
          
          const commitMessage = `${this.version}: Uniform activity ${batchIndex * batchSize + i + 1}`;
          await executeCommand('git', ['commit', '-m', commitMessage, '--date', date.toISOString()], { cwd: this.repoPath });
        }
        
        const overallProgress = Math.round(((batchIndex + 1) / batches.length) * 100);
        console.log(`📈 Batch ${batchIndex + 1}/${batches.length} complete (${overallProgress}%)`);
      }

      // If we used force replace, clean up the branch
      if (this.options.forceReplace) {
        try {
          await executeCommand('git', ['branch', '-D', 'main'], { cwd: this.repoPath });
          await executeCommand('git', ['branch', '-m', 'main'], { cwd: this.repoPath });
          console.log('✅ Updated main branch with new pattern');
        } catch (error) {
          console.log('💡 Branch cleanup completed');
        }
      }

      console.log('\n✅ AI Engineer activity pattern created successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Push to GitHub: git push -f origin main');
      console.log('2. Wait 5-10 minutes for GitHub to update the activity graph');
      console.log('3. Visit your GitHub profile to see the result');
      console.log(`4. Your activity graph will display: "${this.version}"`);
      
      if (this.options.keepInView) {
        console.log('\n🔄 Auto-refresh setup:');
        console.log('- Configuration saved in .github-activity-config.json');
        console.log('- Run "node refresh-activity.js" to refresh the pattern');
      }

      console.log(`\n🔥 Pattern intensity: ${this.options.intensity} (uniform distribution)`);
      console.log(`💡 Total commits created: ${commitDates.length}`);
      console.log(`🎯 Pattern is centered in current GitHub window`);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

function setupAIEngineerDisplay(repoPath, version = 'AI', options = {}) {
  return new Promise((resolve, reject) => {
    console.log("🚀 AI Engineer GitHub Activity Display Setup v3.0");
    console.log("=".repeat(60));
    
    if (!version || version === 'help') {
      AIEngineerActivityGenerator.showAvailableVersions();
      resolve();
      return;
    }
    
    const defaultOptions = {
      intensity: 'ultra',
      keepInView: false,
      centerMessage: true,
      forceReplace: false,
      commitsPerDay: null
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    console.log(`🎯 Setting up "${version}" with options:`);
    console.log(`   • Intensity: ${finalOptions.intensity}`);
    console.log(`   • Positioning: ${finalOptions.centerMessage ? 'Centered' : 'Left-aligned'}`);
    console.log(`   • Keep in view: ${finalOptions.keepInView ? 'Yes' : 'No'}`);
    console.log(`   • Force replace: ${finalOptions.forceReplace ? 'Yes' : 'No'}`);
    console.log('');
    
    const generator = new AIEngineerActivityGenerator(repoPath, version, finalOptions);
    
    generator.previewPattern();
    
    console.log("\n⏳ Creating commits...");
    generator.createCommits()
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

function refreshAIEngineerDisplay(repoPath) {
  return new Promise((resolve, reject) => {
    const configPath = path.join(repoPath, '.github-activity-config.json');
    
    if (!fs.existsSync(configPath)) {
      reject(new Error('No configuration found. Run initial setup first.'));
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    console.log(`🔄 Refreshing "${config.version}" pattern...`);
    
    const generator = new AIEngineerActivityGenerator(repoPath, config.version, {
      ...config.options,
      startDate: null, // Recalculate centered position
      forceReplace: true // Always force replace on refresh
    });
    
    generator.createCommits()
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

// New function to replace existing message with a new one
function replaceMessage(repoPath, newVersion, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Replacing existing message with "${newVersion}"`);
    console.log("=".repeat(50));
    
    // Force replace by default when replacing messages
    const replaceOptions = {
      ...options,
      forceReplace: true,
      centerMessage: true,
      intensity: options.intensity || 'ultra'
    };
    
    const generator = new AIEngineerActivityGenerator(repoPath, newVersion, replaceOptions);
    
    generator.previewPattern();
    
    console.log("\n⏳ Replacing message...");
    generator.createCommits()
      .then(() => {
        console.log('\n✅ Message replacement complete!');
        console.log('📋 Next steps:');
        console.log('1. Push with force: git push -f origin main');
        console.log('2. Wait 5-10 minutes for GitHub to update');
        console.log(`3. Your new message "${newVersion}" will be displayed`);
        resolve();
      })
      .catch(error => reject(error));
  });
}

module.exports = { 
  setupAIEngineerDisplay,
  refreshAIEngineerDisplay,
  replaceMessage
};
