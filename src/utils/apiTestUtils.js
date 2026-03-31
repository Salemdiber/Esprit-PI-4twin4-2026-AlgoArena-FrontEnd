/**
 * API Test Utility - Permet de tester les endpoints du Playground
 * 
 * Utilisation dans le navigateur:
 * - Ouvrir la console (F12)
 * - Importer ce fichier ou copier les fonctions
 * - Appeler: testPlaygroundAPI()
 */

async function testAPIHealth() {
  console.log('🔍 Testing API health...');
  try {
    const res = await fetch('/api/playground/challenges', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (res.ok) {
      console.log('✅ API is reachable');
      return true;
    } else {
      console.error(`❌ API responded with status ${res.status}`);
      return false;
    }
  } catch (err) {
    console.error('❌ API is not reachable:', err.message);
    return false;
  }
}

async function testGetChallenges() {
  console.log('\n📋 Testing GET /playground/challenges');
  try {
    const res = await fetch('/api/playground/challenges');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const data = await res.json();
    console.log(`✅ Got ${data.length || 0} challenges`);
    console.table(data.slice(0, 3).map(c => ({
      id: c._id || c.id,
      title: c.title,
      difficulty: c.difficulty,
      tags: c.tags?.join(', ') || 'N/A'
    })));
    
    return data;
  } catch (err) {
    console.error('❌ Failed to get challenges:', err.message);
    return null;
  }
}

async function testGetChallenge(id) {
  console.log(`\n🎯 Testing GET /playground/challenges/${id}`);
  try {
    const res = await fetch(`/api/playground/challenges/${id}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Challenge loaded:');
    console.log({
      id: data._id || data.id,
      title: data.title,
      difficulty: data.difficulty,
      tags: data.tags,
      description: data.description?.substring(0, 100) + '...',
      examples: data.examples?.length || 0
    });
    
    return data;
  } catch (err) {
    console.error('❌ Failed to get challenge:', err.message);
    return null;
  }
}

async function testRandomChallenge() {
  console.log('\n🎲 Testing GET /playground/challenges/random');
  try {
    const res = await fetch('/api/playground/challenges/random');
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Random challenge loaded:');
    console.log({
      id: data._id || data.id,
      title: data.title,
      difficulty: data.difficulty
    });
    
    return data;
  } catch (err) {
    console.error('❌ Failed to get random challenge:', err.message);
    return null;
  }
}

/**
 * Run all tests
 */
export async function testPlaygroundAPI() {
  console.clear();
  console.log('🧪 AlgoArena Playground API Tests');
  console.log('='.repeat(50));
  
  // 1. Health check
  const healthy = await testAPIHealth();
  if (!healthy) {
    console.error('\n🚨 API is not accessible. Make sure:');
    console.error('  1. Backend is running on http://localhost:3000');
    console.error('  2. Frontend is running on http://localhost:5173');
    console.error('  3. Vite proxy is configured');
    return;
  }
  
  // 2. Get all challenges
  const challenges = await testGetChallenges();
  if (!challenges || challenges.length === 0) {
    console.warn('\n⚠️ No challenges found in database');
    return;
  }
  
  // 3. Get specific challenge
  const firstId = challenges[0]._id || challenges[0].id;
  await testGetChallenge(firstId);
  
  // 4. Get random challenge
  await testRandomChallenge();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📊 Summary:');
  console.log(`  - Total challenges: ${challenges.length}`);
  console.log(`  - Easy: ${challenges.filter(c => c.difficulty === 'Easy').length}`);
  console.log(`  - Medium: ${challenges.filter(c => c.difficulty === 'Medium').length}`);
  console.log(`  - Hard: ${challenges.filter(c => c.difficulty === 'Hard').length}`);
}

// Exporter les fonctions individuelles pour usage modulaire
export {
  testAPIHealth,
  testGetChallenges,
  testGetChallenge,
  testRandomChallenge
};
