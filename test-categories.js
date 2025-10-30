// Quick test to verify categories are loaded correctly
const { useAllCategories } = require('./lib/hooks/useCategories.ts');

console.log('Testing categories...');

try {
  const { categories } = useAllCategories();
  console.log('Categories found:', categories.length);
  console.log('Category list:');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (id: ${cat.id})`);
  });
  
  const web3Category = categories.find(cat => cat.name === 'WEB3');
  if (web3Category) {
    console.log('✅ WEB3 category found:', web3Category);
  } else {
    console.log('❌ WEB3 category NOT found');
  }
} catch (error) {
  console.error('Error loading categories:', error);
}