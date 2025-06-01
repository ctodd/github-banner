const { execSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import letter patterns
const letterPatterns = require('./patterns');

// Added sanitizeInput function to prevent command injection
function sanitizeInput(input) {
  // Remove any potentially dangerous characters
  return input.replace(/[;&|`$(){}]/g, '');
}

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

class AIEngineerActivityGenerator {
  constructor(repoPath, version = 'AI', options = {}) {
    // Normalize and resolve path to prevent path traversal
    this.repoPath = path.normalize(path.resolve(repoPath));
    // Sanitize user input to prevent command injection
    this.version = sanitizeInput(version.toUpperCase());
    
    // Default options
    this.options = {
      intensity: 'ultra',
      commitsPerDay: 25,
      centerMessage: true,
      keepInView: false,
      dryRun: false,
      forceReplace: false,
      useUtc: false, // Default to local timezone
      ...options
    };
    
    // Set commits per day based on intensity
    if (!options.commitsPerDay) {
      switch (this.options.intensity) {
        case 'light':
          this.options.commitsPerDay = 5;
          break;
        case 'medium':
          this.options.commitsPerDay = 10;
          break;
        case 'high':
          this.options.commitsPerDay = 15;
          break;
        case 'ultra':
          this.options.commitsPerDay = 25;
          break;
        default:
          this.options.commitsPerDay = 10;
      }
    }
    
    // Load letter patterns
    this.letterPatterns = letterPatterns;
    
    // Calculate start date
    if (this.options.startDate) {
      this.startDate = new Date(this.options.startDate);
    } else if (this.options.centerMessage) {
      this.startDate = this.calculateCenteredStartDate();
    } else {
      const { startDate } = this.getCurrentGitHubWindow();
      this.startDate = startDate;
    }
    
    // Recommended versions with descriptions
    this.recommendedVersions = {
      'AI ENG': {
        visibility: 'Excellent',
        description: 'Perfect fit for GitHub activity graph'
      },
      'AI ENGR': {
        visibility: 'Excellent',
        description: 'Perfect fit for GitHub activity graph'
      },
      'AWS HERO': {
        visibility: 'Excellent',
        description: 'Shows AWS expertise'
      },
      'DEVOPS': {
        visibility: 'Excellent',
        description: 'Clear and visible'
      },
      'CLOUD': {
        visibility: 'Excellent',
        description: 'Short and impactful'
      },
      'PYTHON': {
        visibility: 'Excellent',
        description: 'Shows Python expertise'
      },
      'JAVA': {
        visibility: 'Good',
        description: 'Shows Java expertise'
      },
      'REACT': {
        visibility: 'Good',
        description: 'Shows React expertise'
      },
      'NODE JS': {
        visibility: 'Good',
        description: 'Shows Node.js expertise'
      },
      'ML': {
        visibility: 'Excellent',
        description: 'Shows Machine Learning focus'
      },
      'AI': {
        visibility: 'Excellent',
        description: 'Simple and impactful'
      }
    };
  }
  
  // Get the current GitHub activity window (53 weeks)
  getCurrentGitHubWindow() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (53 * 7));
    
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }
    
    return { startDate, endDate };
  }

  // Calculate centered start date within the visible window
  calculateCenteredStartDate() {
    const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
    const messageWidth = this.calculateMessageWidth();
    
    console.log(`📅 Current GitHub window: ${windowStart.toDateString()} to ${windowEnd.toDateString()}`);
    console.log(`📏 Message width: ${messageWidth} weeks`);
    
    if (messageWidth > 53) {
      console.warn(`⚠️  Message is ${messageWidth} weeks wide, exceeds GitHub's 53-week display!`);
      console.log('💡 Consider splitting into multiple words or using abbreviations');
      
      if (!this.options.forceReplace) {
        throw new Error(`Message "${this.version}" is too wide (${messageWidth} weeks). Use --force-replace to override.`);
      }
      
      return new Date(windowStart);
    }
    
    const availableWeeks = 53;
    const startWeekOffset = Math.floor((availableWeeks - messageWidth) / 2);
    
    const centeredStart = new Date(windowStart);
    centeredStart.setDate(centeredStart.getDate() + (startWeekOffset * 7));
    
    console.log(`🎯 Centering message: starting week ${startWeekOffset + 1} of 53`);
    console.log(`📍 Centered start date: ${centeredStart.toDateString()}`);
    
    return centeredStart;
  }

  calculateMessageWidth() {
    let totalWidth = 0;
    for (let i = 0; i < this.version.length; i++) {
      const char = this.version[i];
      if (this.letterPatterns[char]) {
        totalWidth += this.letterPatterns[char][0].length;
        if (i > 0) totalWidth += 1;
      } else {
        console.warn(`Character '${char}' not supported, skipping...`);
      }
    }
    return totalWidth;
  }
  
  // Generate commit dates with option to use UTC or local timezone
  generateUniformCommitDates() {
    const { startDate, endDate } = this.getPatternDateRange();
    const pattern = this.generatePattern();
    const commitDates = [];
    
    // Calculate the number of commits per day based on intensity
    const commitsPerDay = this.options.commitsPerDay;
    
    // For each day in the pattern
    for (let week = 0; week < pattern[0].length; week++) {
      for (let day = 0; day < 7; day++) {
        // Check if this day should have commits
        if (pattern[day][week] === 1) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + (week * 7) + day);
          
          // Create multiple commits for this day based on intensity
          for (let i = 0; i < commitsPerDay; i++) {
            // Distribute commits throughout the day
            const hour = Math.floor(i / (commitsPerDay / 24)) % 24;
            const minute = (i * 60) % 60;
            
            let commitDate;
            
            if (this.options.useUtc) {
              // Use UTC dates if specified
              commitDate = new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                hour,
                minute,
                0,
                0
              ));
            } else {
              // Use local timezone (default)
              commitDate = new Date(date);
              commitDate.setHours(hour, minute, 0, 0);
            }
            
            commitDates.push(commitDate);
          }
        }
      }
    }
    
    return commitDates;
  }

  // Get the date range for the pattern
  getPatternDateRange() {
    const startDate = this.startDate;
    const pattern = this.generatePattern();
    
    // Calculate end date based on pattern width
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (pattern[0].length * 7));
    
    return { startDate, endDate };
  }

  // Generate the pattern for the message
  generatePattern() {
    // Initialize a 7x53 grid (7 days per week, 53 weeks max in GitHub's display)
    const pattern = Array(7).fill().map(() => Array(53).fill(0));
    
    let currentWeek = 0;
    
    // Process each character in the message
    for (let i = 0; i < this.version.length; i++) {
      const char = this.version[i];
      
      // Skip unsupported characters
      if (!this.letterPatterns[char]) {
        console.warn(`Character '${char}' not supported, skipping...`);
        continue;
      }
      
      // Get the pattern for this character
      const charPattern = this.letterPatterns[char];
      
      // Add the character pattern to the overall pattern
      for (let day = 0; day < 7; day++) {
        for (let week = 0; week < charPattern[0].length; week++) {
          pattern[day][currentWeek + week] = charPattern[day][week];
        }
      }
      
      // Move to the next position (character width + 1 space)
      currentWeek += charPattern[0].length;
      
      // Add a space between characters
      if (i < this.version.length - 1) {
        currentWeek += 1;
      }
    }
    
    return pattern;
  }

  // Preview the pattern in the console
  previewPattern() {
    const { startDate, endDate } = this.getCurrentGitHubWindow();
    const pattern = this.generatePattern();
    
    console.log(`🔍 PREVIEW: "${this.version}" Pattern`);
    console.log("==================================================");
    console.log(`📅 Current GitHub window: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(`🔥 Intensity: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)`);
    console.log(`🎯 Positioning: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}`);
    console.log(`🗓️ Pattern start: ${this.startDate.toDateString()}`);
    console.log();
    
    // Display the pattern
    console.log("GitHub Activity Graph Preview (53-week window):");
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let day = 0; day < 7; day++) {
      process.stdout.write(`${days[day]}: `);
      
      for (let week = 0; week < 53; week++) {
        if (week < pattern[0].length) {
          if (pattern[day][week] === 1) {
            process.stdout.write("\x1b[32m█\x1b[0m"); // Green block for active days
          } else {
            process.stdout.write("·"); // Dot for inactive days
          }
        } else {
          process.stdout.write("·"); // Dot for weeks outside the pattern
        }
      }
      
      console.log();
    }
    
    console.log();
    
    // Count unique days with activity
    let activeDays = 0;
    for (let day = 0; day < 7; day++) {
      for (let week = 0; week < pattern[0].length; week++) {
        if (pattern[day][week] === 1) {
          activeDays++;
        }
      }
    }
    
    console.log(`📈 Unique days with activity: ${activeDays}`);
    console.log(`🔥 Total commits: ${activeDays * this.options.commitsPerDay} (${this.options.commitsPerDay} per day)`);
    console.log(`📅 Pattern span: ${pattern[0].length} weeks`);
    console.log();
  }

  // Create commits for the pattern
  async createCommits() {
    console.log("⏳ Creating commits...");
    
    // Check if we need to replace an existing pattern
    if (this.options.forceReplace) {
      console.log("🔄 Force replacing existing pattern...");
      
      try {
        // Check if there's an existing pattern
        if (fs.existsSync(path.join(this.repoPath, 'ai-engineer-activity.txt'))) {
          console.log("✅ Cleared existing pattern");
        } else {
          console.log("💡 Creating fresh pattern (no existing pattern found)");
        }
      } catch (error) {
        console.warn(`⚠️  Error checking for existing pattern: ${error.message}`);
      }
    }
    
    // Generate commit dates
    const commitDates = this.generateUniformCommitDates();
    
    // Create README.md with pattern information
    try {
      if (fs.existsSync(path.join(this.repoPath, 'README.md'))) {
        console.log("📄 Created ACTIVITY-PATTERN.md with pattern information (README.md preserved)");
        await this.createActivityPatternFile();
      } else {
        console.log("📄 Created new README.md with activity pattern information");
        await this.createReadme();
      }
    } catch (error) {
      console.warn(`⚠️  Error creating README: ${error.message}`);
    }
    
    // Create .gitignore
    try {
      if (fs.existsSync(path.join(this.repoPath, '.gitignore'))) {
        console.log("📄 Preserved existing .gitignore file");
      } else {
        console.log("📄 Created default .gitignore file");
        await this.createGitignore();
      }
    } catch (error) {
      console.warn(`⚠️  Error creating .gitignore: ${error.message}`);
    }
    
    // Create commits in batches for better progress reporting
    const batchSize = Math.ceil(commitDates.length / 100);
    const batches = Math.ceil(commitDates.length / batchSize);
    
    console.log(`⚡ Creating commits in ${batches} batches for maximum uniformity...`);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, commitDates.length);
      const batchDates = commitDates.slice(start, end);
      
      // Create commits for this batch
      for (let j = 0; j < batchDates.length; j++) {
        const date = batchDates[j];
        const dateString = date.toISOString();
        const message = `${this.version}: Uniform activity ${start + j + 1}`;
        
        try {
          // Create the commit
          await this.createCommit(dateString, message);
        } catch (error) {
          console.error(`❌ Error creating commit: ${error.message}`);
          throw error;
        }
      }
      
      // Report progress
      const progress = Math.round(((i + 1) / batches) * 100);
      console.log(`📈 Batch ${i + 1}/${batches} complete (${progress}%)`);
    }
    
    console.log("💡 Branch cleanup completed");
  }

  // Create a single commit with the specified date
  async createCommit(dateString, message) {
    if (this.options.dryRun) {
      return;
    }
    
    const activityFile = path.join(this.repoPath, 'ai-engineer-activity.txt');
    
    // Append to the activity file
    fs.appendFileSync(activityFile, `${message}\n`);
    
    // Add and commit with the specified date
    try {
      execSync(`git add "${activityFile}"`, { cwd: this.repoPath });
      execSync(`GIT_AUTHOR_DATE="${dateString}" GIT_COMMITTER_DATE="${dateString}" git commit -m "${message}"`, { cwd: this.repoPath });
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  // Create a README.md file with pattern information
  async createReadme() {
    const readmePath = path.join(this.repoPath, 'README.md');
    const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
    
    const content = `# AI Engineer GitHub Activity Display

## Current Message: "${this.version}"

This repository creates a GitHub activity graph pattern displaying "${this.version}".

### Configuration
- **Message**: ${this.version}
- **Width**: ${this.calculateMessageWidth()} weeks
- **Intensity**: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)
- **Total Commits**: ${this.generateUniformCommitDates().length}
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
node cli.js replace "NEW MESSAGE" --intensity=${this.options.intensity} --force-replace
\`\`\`

### Created: ${new Date().toLocaleDateString()}

*Generated by AI Engineer Activity Generator v3.0*`;

    fs.writeFileSync(readmePath, content);
  }

  // Create an ACTIVITY-PATTERN.md file with pattern information
  async createActivityPatternFile() {
    const filePath = path.join(this.repoPath, 'ACTIVITY-PATTERN.md');
    const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
    
    const content = `# AI Engineer GitHub Activity Pattern

## Current Message: "${this.version}"

This file contains information about the GitHub activity graph pattern.

### Configuration
- **Message**: ${this.version}
- **Width**: ${this.calculateMessageWidth()} weeks
- **Intensity**: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)
- **Total Commits**: ${this.generateUniformCommitDates().length}
- **Positioning**: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}

### Current GitHub Window
- **Start**: ${windowStart.toDateString()}
- **End**: ${windowEnd.toDateString()}
- **Pattern Start**: ${this.startDate.toDateString()}

### Created: ${new Date().toLocaleDateString()}

*Generated by AI Engineer Activity Generator v3.0*`;

    fs.writeFileSync(filePath, content);
  }

  // Create a .gitignore file
  async createGitignore() {
    const gitignorePath = path.join(this.repoPath, '.gitignore');
    const content = `# Activity generator config
.github-activity-config.json

# Node.js
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Editor files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;

    fs.writeFileSync(gitignorePath, content);
  }
}

module.exports = { AIEngineerActivityGenerator };
