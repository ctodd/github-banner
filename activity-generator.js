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
    this.options = {
      commitsPerDay: options.commitsPerDay || 15,
      keepInView: options.keepInView || false,
      intensity: options.intensity || 'ultra',
      startDate: options.startDate || null,
      centerMessage: options.centerMessage !== false,
      forceReplace: options.forceReplace || false,
      ...options
    };
    
    this.letterPatterns = letterPatterns;
    this.startDate = this.options.startDate || this.calculateCenteredStartDate();
    
    // Enhanced intensity levels for maximum uniformity
    this.intensityLevels = {
      'low': 3,
      'medium': 8,
      'high': 15,
      'max': 20,
      'ultra': 25,
      'extreme': 30
    };
    
    if (this.intensityLevels[this.options.intensity]) {
      this.options.commitsPerDay = this.intensityLevels[this.options.intensity];
    }
    
    this.recommendedVersions = {
      'AI': { width: 11, visibility: 'excellent', description: 'Ultra clean and professional' },
      'ML': { width: 11, visibility: 'excellent', description: 'Machine Learning focus' },
      'DL': { width: 11, visibility: 'excellent', description: 'Deep Learning specialist' },
      'LLM': { width: 17, visibility: 'good', description: 'Large Language Model expert' },
      'GPT': { width: 17, visibility: 'good', description: 'Generative AI specialist' },
      'NLP': { width: 17, visibility: 'good', description: 'Natural Language Processing' },
      'AIE': { width: 17, visibility: 'good', description: 'AI Engineer abbreviated' },
      'AIDEV': { width: 29, visibility: 'fair', description: 'AI Developer - more descriptive' },
      'NEURAL': { width: 35, visibility: 'fair', description: 'Neural networks specialist' },
      'BRAIN': { width: 29, visibility: 'fair', description: 'Creative AI reference' },
      'PROMPT': { width: 35, visibility: 'fair', description: 'Prompt engineering focus' },
      'AWS': { width: 17, visibility: 'good', description: 'Amazon Web Services' },
      'HERO': { width: 23, visibility: 'good', description: 'Hero designation' },
      'AWS HERO': { width: 45, visibility: 'challenging', description: 'AWS Hero - may need wrapping' }
    };
  }

  getCurrentGitHubWindow() {
    // GitHub shows the last 53 weeks (371 days) of activity
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
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

  calculateRefreshSchedule() {
    const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
    const messageWidth = this.calculateMessageWidth();
    
    // Calculate when the message will start to move out of view
    const refreshDate = new Date(this.startDate);
    refreshDate.setDate(refreshDate.getDate() - 7); // Refresh one week before it starts to disappear
    
    // Calculate when the message will be completely out of view
    const outOfViewDate = new Date(this.startDate);
    outOfViewDate.setDate(outOfViewDate.getDate() + (messageWidth * 7));
    
    return [refreshDate, outOfViewDate];
  }

  async createActivityPattern() {
    console.log(`🤖 Creating AI Engineer activity pattern: "${this.version}"`);
    console.log(`🔥 Intensity: ${this.options.intensity} (${this.options.commitsPerDay} commits per pixel)`);
    
    const commitDates = this.generateUniformCommitDates();
    console.log(`📅 ${commitDates.length} total commits scheduled`);
    console.log(`📊 Message width: ${this.calculateMessageWidth()} weeks`);
    console.log(`🎯 Message positioning: ${this.options.centerMessage ? 'Centered' : 'Left-aligned'}`);
    
    const { startDate: windowStart, endDate: windowEnd } = this.getCurrentGitHubWindow();
    console.log(`📅 Current visible window: ${windowStart.toDateString()} to ${windowEnd.toDateString()}`);
    
    // Create README.md with pattern information
    console.log('\n📄 Created new README.md with activity pattern information');
    await this.createReadme();
    
    // Create .gitignore
    console.log('📄 Created default .gitignore file');
    await this.createGitignore();
    
    // Create commits
    await this.createCommits();
    
    console.log('\n✅ AI Engineer activity pattern created successfully!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Push to GitHub: git push -f origin main');
    console.log('2. Wait 5-10 minutes for GitHub to update the activity graph');
    console.log('3. Visit your GitHub profile to see the result');
    console.log(`4. Your activity graph will display: "${this.version}"`);
    
    console.log('\n🔥 Pattern intensity: ' + this.options.intensity + ' (uniform distribution)');
    console.log(`💡 Total commits created: ${commitDates.length}`);
    
    if (this.options.centerMessage) {
      console.log('🎯 Pattern is centered in current GitHub window');
    }
    
    if (this.options.keepInView) {
      const [refreshDate] = this.calculateRefreshSchedule();
      console.log(`🔄 Schedule next refresh: ${refreshDate.toDateString()}`);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Make sure you have a GitHub repository set up:');
    console.log('   git remote add origin https://github.com/USERNAME/REPO.git');
    console.log('2. Push your changes:');
    console.log('   git push -f origin main  # Force push for replacements');
    console.log('3. Check your GitHub profile in 5-10 minutes!');
  }

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
- **Custom Pattern**

### Message Replacement
To replace this message with a new one:
\`\`\`bash
node cli.js replace "NEW MESSAGE" --intensity=${this.options.intensity} --force-replace
\`\`\`

### Created: ${new Date().toLocaleDateString()}

*Generated by AI Engineer Activity Generator v3.0*`;

    fs.writeFileSync(readmePath, content);
  }

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
