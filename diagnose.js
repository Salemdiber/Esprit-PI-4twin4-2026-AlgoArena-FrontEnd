#!/usr/bin/env node

/**
 * AlgoArena Frontend - Diagnostic Script
 * Usage: node diagnose.js
 * 
 * This script runs a comprehensive diagnostic to identify issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

// Helper functions
const log = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}=== ${text} ===${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.dim}ℹ ${text}${colors.reset}`),
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// ============================================================================
// TESTS
// ============================================================================

function testNodeVersion() {
  log.title('1. Node.js Version');
  try {
    const version = execSync('node --version').toString().trim();
    const [major] = version.slice(1).split('.');
    
    if (parseInt(major) >= 18) {
      log.success(`Node.js ${version} (✓ >= 18.x)`);
      results.passed++;
    } else {
      log.error(`Node.js ${version} (✗ < 18.x required)`);
      results.failed++;
    }
  } catch (err) {
    log.error('Node.js not found');
    results.failed++;
  }
}

function testNpmVersion() {
  log.title('2. npm Version');
  try {
    const version = execSync('npm --version').toString().trim();
    const [major] = version.split('.');
    
    if (parseInt(major) >= 9) {
      log.success(`npm ${version} (✓ >= 9.x)`);
      results.passed++;
    } else {
      log.warning(`npm ${version} (✓ but < 9.x recommended)`);
      results.warnings++;
    }
  } catch (err) {
    log.error('npm not found');
    results.failed++;
  }
}

function testProjectFolder() {
  log.title('3. Project Folder Structure');
  
  const requiredFiles = [
    'package.json',
    'vite.config.js',
    'index.html',
  ];
  
  const requiredFolders = [
    'src',
    'public',
  ];
  
  let folderOk = true;
  
  // Check files
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log.success(`Found: ${file}`);
      results.passed++;
    } else {
      log.error(`Missing: ${file}`);
      results.failed++;
      folderOk = false;
    }
  });
  
  // Check folders
  requiredFolders.forEach(folder => {
    if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
      log.success(`Found: ${folder}/`);
      results.passed++;
    } else {
      log.error(`Missing: ${folder}/`);
      results.failed++;
      folderOk = false;
    }
  });
}

function testNodeModules() {
  log.title('4. Dependencies (node_modules)');
  
  if (fs.existsSync('node_modules')) {
    const count = fs.readdirSync('node_modules').length;
    log.success(`node_modules exists (${count} packages)`);
    results.passed++;
    
    // Check critical packages
    const critical = ['react', 'react-dom', 'vite', '@chakra-ui/react'];
    critical.forEach(pkg => {
      if (fs.existsSync(path.join('node_modules', pkg))) {
        log.success(`  ✓ ${pkg}`);
      } else {
        log.warning(`  ⚠ ${pkg} not found, try: npm install`);
        results.warnings++;
      }
    });
  } else {
    log.error('node_modules not found - run: npm install');
    results.failed++;
  }
}

function testSourceCode() {
  log.title('5. Source Code Files');
  
  const requiredFiles = [
    'src/main.jsx',
    'src/App.jsx',
    'src/pages/Frontoffice/PlaygroundChallengesPage.jsx',
    'src/services/playgroundChallengesService.js',
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      log.success(`Found: ${file} (${size} bytes)`);
      results.passed++;
    } else {
      log.error(`Missing: ${file}`);
      results.failed++;
    }
  });
}

function testDocumentation() {
  log.title('6. Documentation Files');
  
  const docs = [
    '00_START_HERE.md',
    'README_PLAYGROUND.md',
    'QUICK_START.md',
    'PLAYGROUND_SETUP.md',
    'PLAYGROUND_FAQ.md',
    'ARCHITECTURE.md',
  ];
  
  const found = docs.filter(doc => fs.existsSync(doc));
  
  if (found.length === docs.length) {
    log.success(`All ${docs.length} main documentation files found`);
    results.passed++;
  } else {
    log.warning(`Found ${found.length}/${docs.length} documentation files`);
    log.info('Missing: ' + docs.filter(d => !found.includes(d)).join(', '));
    results.warnings++;
  }
}

function testScripts() {
  log.title('7. Auto-Start Scripts');
  
  const scripts = [
    { name: 'start.sh', required: false },
    { name: 'start.bat', required: false },
  ];
  
  scripts.forEach(({ name, required }) => {
    if (fs.existsSync(name)) {
      log.success(`Found: ${name}`);
      results.passed++;
    } else if (required) {
      log.error(`Missing: ${name}`);
      results.failed++;
    } else {
      log.warning(`Optional: ${name} not found`);
    }
  });
}

function testBackendConnection() {
  log.title('8. Backend Connection Test');
  
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/playground/challenges 2>&1 || echo "FAIL"').toString().trim();
    
    if (response === '200' || response === '201' || response === '404') {
      log.success(`Backend accessible on port 3000 (HTTP ${response})`);
      results.passed++;
    } else if (response === 'FAIL') {
      log.error('Backend NOT accessible on port 3000 - make sure NestJS is running');
      results.failed++;
    } else {
      log.warning(`Backend responded with HTTP ${response}`);
      results.warnings++;
    }
  } catch (err) {
    // Curl might not be available on Windows
    log.warning('Could not test backend (curl not available)');
    log.info('Please ensure backend is running on port 3000');
  }
}

function testPorts() {
  log.title('9. Port Availability');
  
  const ports = [3000, 5173];
  
  ports.forEach(port => {
    try {
      if (process.platform === 'win32') {
        // Windows
        const result = execSync(`netstat -ano | findstr :${port} 2>&1 || echo "AVAILABLE"`).toString();
        if (result.includes('LISTENING') || result.includes(port)) {
          log.warning(`Port ${port} might be in use (found in netstat)`);
          results.warnings++;
        } else {
          log.success(`Port ${port} appears available`);
          results.passed++;
        }
      } else {
        // Mac/Linux
        execSync(`lsof -i :${port} 2>&1 | grep LISTEN > /dev/null`);
        log.warning(`Port ${port} is in use`);
        results.warnings++;
      }
    } catch (err) {
      log.success(`Port ${port} appears available`);
      results.passed++;
    }
  });
}

function testPackageJson() {
  log.title('10. package.json Configuration');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check scripts
    const scripts = ['dev', 'build', 'preview'];
    scripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        log.success(`Script found: npm run ${script}`);
        results.passed++;
      } else {
        log.warning(`Script missing: npm run ${script}`);
        results.warnings++;
      }
    });
    
    // Check dependencies
    const deps = ['react', 'react-dom', 'vite', '@chakra-ui/react'];
    log.info('Critical dependencies:');
    deps.forEach(dep => {
      if ((pkg.dependencies && pkg.dependencies[dep]) || (pkg.devDependencies && pkg.devDependencies[dep])) {
        log.success(`  ${dep} configured`);
        results.passed++;
      } else {
        log.error(`  ${dep} missing - run npm install`);
        results.failed++;
      }
    });
  } catch (err) {
    log.error(`Could not read package.json: ${err.message}`);
    results.failed++;
  }
}

function testEnvFile() {
  log.title('11. Environment Configuration');
  
  const envFile = '.env.local';
  
  if (fs.existsSync(envFile)) {
    log.success(`Found: ${envFile}`);
    results.passed++;
  } else {
    log.warning(`${envFile} not found (optional)`);
    log.info('Development will use defaults');
  }
  
  // Check Vite config
  if (fs.existsSync('vite.config.js')) {
    const config = fs.readFileSync('vite.config.js', 'utf8');
    if (config.includes('3000') || config.includes('127.0.0.1')) {
      log.success('Vite proxy configured for backend');
      results.passed++;
    } else {
      log.warning('Vite proxy might need configuration');
      results.warnings++;
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

console.log(`${colors.bright}${colors.blue}AlgoArena Frontend - Diagnostic Tool${colors.reset}`);
console.log(`${colors.dim}Running comprehensive checks...${colors.reset}\n`);

try {
  testNodeVersion();
  testNpmVersion();
  testProjectFolder();
  testNodeModules();
  testSourceCode();
  testDocumentation();
  testScripts();
  testBackendConnection();
  testPorts();
  testPackageJson();
  testEnvFile();
} catch (error) {
  console.error('Diagnostic error:', error.message);
}

// ============================================================================
// SUMMARY
// ============================================================================

log.title('DIAGNOSTIC SUMMARY');

const total = results.passed + results.failed + results.warnings;

console.log(`
${colors.green}✓ Passed: ${results.passed}${colors.reset}
${colors.red}✗ Failed: ${results.failed}${colors.reset}
${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}
${colors.dim}─────────────${colors.reset}
${colors.bright}Total: ${total}${colors.reset}
`);

if (results.failed === 0) {
  if (results.warnings === 0) {
    console.log(`${colors.green}${colors.bright}✓ EVERYTHING LOOKS GOOD!${colors.reset}`);
    console.log(`\n${colors.dim}You can start the app with:${colors.reset}`);
    console.log(`  ${colors.bright}npm run dev${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠ MOSTLY OK (with some warnings)${colors.reset}`);
    console.log(`\n${colors.dim}Review warnings above and try:${colors.reset}`);
    console.log(`  ${colors.bright}npm run dev${colors.reset}`);
  }
} else {
  console.log(`${colors.red}${colors.bright}✗ ISSUES FOUND${colors.reset}`);
  console.log(`\n${colors.dim}Fix the errors above, then try:${colors.reset}`);
  console.log(`  1. ${colors.bright}npm install${colors.reset}`);
  console.log(`  2. Check backend is running on port 3000`);
  console.log(`  3. ${colors.bright}npm run dev${colors.reset}`);
}

console.log(`\n${colors.dim}For detailed help, see: ${colors.reset}${colors.bright}VERIFY_INSTALLATION.md${colors.reset}\n`);

process.exit(results.failed > 0 ? 1 : 0);
