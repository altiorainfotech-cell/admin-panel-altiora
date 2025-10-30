#!/usr/bin/env node

/**
 * Test script to verify blog synchronization between admin panel and Altiora website
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Blog Post Schema (simplified for testing)
const BlogPostSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  href: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  author: { type: String, default: 'Admin' },
  content: { type: String, default: '' },
  excerpt: { type: String }
}, {
  timestamps: true,
  collection: 'blogposts'
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

async function testBlogSync() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Count total blog posts
    const totalPosts = await BlogPost.countDocuments();
    console.log(`📊 Total blog posts in database: ${totalPosts}`);

    // Test 2: Count published posts (what Altiora website should show)
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    console.log(`📊 Published blog posts: ${publishedPosts}`);

    // Test 3: List recent published posts
    const recentPosts = await BlogPost.find({ status: 'published' })
      .select('id title category date status')
      .sort({ date: -1 })
      .limit(5);

    console.log('\n📝 Recent published posts:');
    recentPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.category}) - ${new Date(post.date).toLocaleDateString()}`);
    });

    // Test 4: Check categories
    const categories = await BlogPost.distinct('category', { status: 'published' });
    console.log(`\n🏷️  Available categories: ${categories.join(', ')}`);

    // Test 5: Test Altiora API endpoint
    console.log('\n🌐 Testing Altiora API endpoint...');
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:3000/api/blogs?limit=5');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Altiora API working - returned ${data.data?.posts?.length || 0} posts`);
        
        if (data.data?.posts?.length > 0) {
          console.log('📝 First post from API:', data.data.posts[0].title);
        }
      } else {
        console.log(`❌ Altiora API error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log(`❌ Altiora API connection failed: ${apiError.message}`);
      console.log('💡 Make sure Altiora website is running on http://localhost:3000');
    }

    // Test 6: Create a test blog post to verify sync
    console.log('\n🧪 Creating test blog post...');
    const testPost = new BlogPost({
      id: `test-sync-${Date.now()}`,
      title: `Test Sync Post - ${new Date().toLocaleString()}`,
      href: `/blog/test-sync-${Date.now()}`,
      image: '/images/blog/test.jpg',
      category: 'WEB3',
      date: new Date().toISOString(),
      status: 'published',
      author: 'Test Script',
      content: 'This is a test post to verify blog synchronization between admin panel and Altiora website.',
      excerpt: 'Test post for blog synchronization verification.'
    });

    await testPost.save();
    console.log(`✅ Test post created with ID: ${testPost.id}`);

    // Wait a moment and then check if it appears in the API
    console.log('⏳ Waiting 2 seconds before checking API...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:3000/api/blogs?limit=1');
      
      if (response.ok) {
        const data = await response.json();
        const latestPost = data.data?.posts?.[0];
        
        if (latestPost && latestPost.id === testPost.id) {
          console.log('✅ Blog sync working! Test post appears in Altiora API');
        } else {
          console.log('⚠️  Test post not found in API response. Latest post:', latestPost?.title || 'None');
        }
      }
    } catch (apiError) {
      console.log(`❌ API check failed: ${apiError.message}`);
    }

    // Clean up test post
    await BlogPost.deleteOne({ id: testPost.id });
    console.log('🧹 Test post cleaned up');

    console.log('\n✅ Blog sync test completed!');
    console.log('\n💡 If you see any issues:');
    console.log('   1. Make sure both projects use the same MONGODB_URI');
    console.log('   2. Check that Altiora website is running on port 3000');
    console.log('   3. Verify that blog posts have status: "published"');
    console.log('   4. Clear any browser cache or restart the Altiora dev server');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBlogSync().catch(console.error);