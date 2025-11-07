#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Bundle analysis script
function analyzeBundle() {
  console.log('🔍 Analyzing bundle size...\n');
  
  const bundlePath = path.join(__dirname, '../.next/static/chunks');
  
  if (!fs.existsSync(bundlePath)) {
    console.log('❌ Bundle not found. Run "npm run build" first.');
    return;
  }
  
  const files = fs.readdirSync(bundlePath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  console.log('📊 Bundle Analysis Results:\n');
  
  jsFiles.forEach(file => {
    const filePath = path.join(bundlePath, file);
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    
    console.log(`${file}: ${sizeInKB} KB`);
  });
  
  console.log('\n💡 Optimization Recommendations:');
  console.log('1. Use dynamic imports for heavy components');
  console.log('2. Implement code splitting for routes');
  console.log('3. Optimize images and assets');
  console.log('4. Remove unused dependencies');
  console.log('5. Use tree shaking effectively');
}

analyzeBundle();
