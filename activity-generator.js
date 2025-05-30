const { execSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    
    this.letterPatterns = this.defineLetterPatterns();
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

  defineLetterPatterns() {
    return {
      'A': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1]
      ],
      'B': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0]
      ],
      'C': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,1],
        [0,1,1,1,0]
      ],
      'D': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0]
      ],
      'E': [
        [1,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1]
      ],
      'F': [
        [1,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0]
      ],
      'G': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
        [1,0,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0]
      ],
      'H': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1]
      ],
      'I': [
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [1,1,1,1,1]
      ],
      'L': [
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1]
      ],
      'M': [
        [1,0,0,0,1],
        [1,1,0,1,1],
        [1,0,1,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1]
      ],
      'N': [
        [1,0,0,0,1],
        [1,1,0,0,1],
        [1,0,1,0,1],
        [1,0,0,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1]
      ],
      'O': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0]
      ],
      'P': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0]
      ],
      'R': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,1,0,0],
        [1,0,0,1,0],
        [1,0,0,0,1]
      ],
      'S': [
        [0,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [0,1,1,1,0],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [1,1,1,1,0]
      ],
      'T': [
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0]
      ],
      'U': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0]
      ],
      'V': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,0,1,0],
        [0,0,1,0,0]
      ],
      'W': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,1,0,1],
        [1,1,0,1,1],
        [1,0,0,0,1]
      ],
      'Y': [
        [1,0,0,0,1],
        [0,1,0,1,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0]
      ],
      ' ': [
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0]
      ]
    };
  }

  // Calculate current GitHub rolling window
  getCurrentGitHubWindow() {
    const now = new Date();
    const endDate = new Date(now);
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
      }
    }
    return totalWidth;
  }

  calculateRefreshSchedule() {
    const messageWidth = this.calculateMessageWidth();
    const refreshDates = [];
    
    const messageEndDate = new Date(this.startDate);
    messageEndDate.setDate(messageEndDate.getDate() + (messageWidth * 7));
    
    let nextRefresh = new Date(messageEndDate);
    nextRefresh.setDate(nextRefresh.getDate() - (6 * 7));
    
    for (let i = 0; i < 12; i++) {
      refreshDates.push(new Date(nextRefresh));
      nextRefresh.setDate(nextRefresh.getDate() + (6 * 7));
    }
    
    return refreshDates;
  }

  static showAvailableVersions() {
    console.log("🤖 AI ENGINEER - AVAILABLE VERSIONS & SETTINGS");
    console.log("=".repeat(60));
    
    const generator = new AIEngineerActivityGenerator('', 'AI');
    
    console.log("📋 RECOMMENDED VERSIONS:");
    Object.entries(generator.recommendedVersions).forEach(([version, info]) => {
      const icon = info.visibility === 'excellent' ? '🟢' : 
                   info.visibility === 'good' ? '🟡' : 
                   info.visibility === 'fair' ? '🟠' : '🔴';
      console.log(`${icon} "${version}" - ${info.width} weeks - ${info.description}`);
    });
    
    console.log("\n🔥 INTENSITY LEVELS (Enhanced for Uniformity):");
    console.log("• low: 3 commits per pixel");
    console.log("• medium: 8 commits per pixel");
    console.log("• high: 15 commits per pixel");
    console.log("• max: 20 commits per pixel");
    console.log("• ultra: 25 commits per pixel ⭐ recommended for uniformity");
    console.log("• extreme: 30 commits per pixel (maximum possible)");
    
    console.log("\n⚙️ ADVANCED OPTIONS:");
    console.log("• centerMessage: Center message in GitHub window (default: true)");
    console.log("• forceReplace: Replace existing pattern completely");
    console.log("• keepInView: Auto-refresh to stay in rolling window");
    console.log("• startDate: Custom start date (overrides centering)");
    
    console.log("\n🔄 MESSAGE REPLACEMENT:");
    console.log("• Use --force-replace to completely replace existing patterns");
    console.log("• Old commits are removed and replaced with new pattern");
    console.log("• Push with -f flag: git push -f origin main");
    
    return generator.recommendedVersions;
  }
}

module.exports = { AIEngineerActivityGenerator };
