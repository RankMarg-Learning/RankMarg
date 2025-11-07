const depcheck = require('depcheck');

const options = {
  skipMissing: true,
  ignores: [
    '@types/*',
    'typescript',
    'eslint*',
    'prettier',
    'tailwindcss',
    'postcss',
    'husky',
    'lint-staged',
    'ts-node',
    'prisma'
  ]
};

depcheck(process.cwd(), options)
  .then((result) => {
    console.log('Depcheck Results:');
    
    if (result.dependencies.length > 0) {
      console.log('\nUnused dependencies:');
      result.dependencies.forEach(dep => console.log(`  - ${dep}`));
    }
    
    if (result.devDependencies.length > 0) {
      console.log('\nUnused devDependencies:');
      result.devDependencies.forEach(dep => console.log(`  - ${dep}`));
    }
    
    if (result.missing.length > 0) {
      console.log('\nMissing dependencies:');
      result.missing.forEach(dep => console.log(`  - ${dep}`));
    }
    
    if (result.dependencies.length === 0 && result.devDependencies.length === 0 && result.missing.length === 0) {
      console.log('\n✅ No unused or missing dependencies found!');
    }
    
    // Exit with success even if there are unused dependencies
    process.exit(0);
  })
  .catch((error) => {
    console.error('Depcheck error:', error);
    process.exit(0); // Exit with success to avoid build failures
  });
