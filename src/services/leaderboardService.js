/**
 * Leaderboard Service
 * Manages leaderboard data, rankings, and live updates
 */

import { apiClient } from './apiClient';

class LeaderboardService {
  /**
   * Get global leaderboard
   * @param {Object} options - Filter options
   * @param {number} options.limit - Maximum entries (default: 50)
   * @param {string} options.timeframe - 'all' | 'month' | 'week' | 'day'
   * @returns {Promise} Leaderboard entries
   */
  async getGlobalLeaderboard(options = {}) {
    try {
      const { limit = 50, timeframe = 'all' } = options;
      console.log('📊 Fetching global leaderboard...');

      const response = await apiClient(`/leaderboard/global?limit=${limit}&timeframe=${timeframe}`);
      
      console.log('✅ Leaderboard fetched:', response.length, 'entries');
      return {
        success: true,
        data: response || [],
        count: response?.length || 0,
      };
    } catch (error) {
      console.error('❌ Leaderboard fetch error:', error);
      return this._getMockLeaderboard();
    }
  }

  /**
   * Get live leaderboard for a specific challenge
   * @param {string} challengeId - Challenge ID
   * @param {Object} options - Filter options
   * @returns {Promise} Live leaderboard data
   */
  async getLiveLeaderboard(challengeId, options = {}) {
    try {
      const { limit = 10 } = options;
      console.log('🔴 Fetching live leaderboard for challenge:', challengeId);

      const response = await apiClient(`/leaderboard/live/${challengeId}?limit=${limit}`);
      
      console.log('✅ Live leaderboard fetched:', response.length, 'players');
      return {
        success: true,
        data: response || [],
        count: response?.length || 0,
        challengeId,
      };
    } catch (error) {
      console.error('❌ Live leaderboard fetch error:', error);
      return this._getMockLiveLeaderboard();
    }
  }

  /**
   * Get user rank and stats
   * @param {string} userId - User ID
   * @returns {Promise} User rank data
   */
  async getUserRank(userId) {
    try {
      console.log('👤 Fetching user rank:', userId);

      const response = await apiClient(`/leaderboard/user/${userId}`);
      
      console.log('✅ User rank fetched:', response);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ User rank fetch error:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get leaderboard for specific challenge
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} Challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId, options = {}) {
    try {
      const { limit = 10 } = options;
      console.log('🏆 Fetching challenge leaderboard:', challengeId);

      const response = await apiClient(`/leaderboard/challenge/${challengeId}?limit=${limit}`);
      
      console.log('✅ Challenge leaderboard fetched');
      return {
        success: true,
        data: response || [],
        challengeId,
      };
    } catch (error) {
      console.error('❌ Challenge leaderboard fetch error:', error);
      return {
        success: false,
        data: [],
      };
    }
  }

  /**
   * Record a submission
   * @param {Object} submissionData - Submission info
   * @returns {Promise} Recording result
   */
  async recordSubmission(submissionData) {
    try {
      console.log('📝 Recording submission...', submissionData);

      const response = await apiClient('/leaderboard/submit', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
      
      console.log('✅ Submission recorded');
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error('❌ Submission recording error:', error);
      return {
        success: false,
        data: null,
      };
    }
  }

  /**
   * Get top performers for a challenge
   * @param {string} challengeId - Challenge ID
   * @param {number} limit - Top count
   * @returns {Promise} Top performers
   */
  async getTopPerformers(challengeId, limit = 5) {
    try {
      console.log('⭐ Fetching top performers:', challengeId);

      const response = await apiClient(`/leaderboard/top/${challengeId}?limit=${limit}`);
      
      return {
        success: true,
        data: response || [],
      };
    } catch (error) {
      console.error('❌ Top performers fetch error:', error);
      return this._getMockTopPerformers(limit);
    }
  }

  /**
   * Mock leaderboard data (for demo/testing)
   * @private
   */
  _getMockLeaderboard() {
    console.log('🎭 Using mock leaderboard data');
    
    const mockUsers = [
      { rank: 1, username: 'AlgoMaster', xp: 12500, wins: 45, accuracy: 98.5 },
      { rank: 2, username: 'CodeNinja', xp: 11200, wins: 42, accuracy: 97.2 },
      { rank: 3, username: 'BinaryBeast', xp: 10800, wins: 39, accuracy: 96.8 },
      { rank: 4, username: 'DebugDemon', xp: 9500, wins: 35, accuracy: 95.1 },
      { rank: 5, username: 'LoopLord', xp: 8900, wins: 32, accuracy: 94.3 },
      { rank: 6, username: 'RefactorRookie', xp: 7600, wins: 28, accuracy: 92.5 },
      { rank: 7, username: 'SyntaxSuperstar', xp: 6800, wins: 25, accuracy: 91.2 },
      { rank: 8, username: 'DataDancer', xp: 5900, wins: 22, accuracy: 89.7 },
      { rank: 9, username: 'StackSmash', xp: 5100, wins: 19, accuracy: 88.1 },
      { rank: 10, username: 'HeapHero', xp: 4300, wins: 16, accuracy: 86.5 },
    ];

    return {
      success: true,
      data: mockUsers,
      count: mockUsers.length,
    };
  }

  /**
   * Mock live leaderboard data
   * @private
   */
  _getMockLiveLeaderboard() {
    console.log('🎭 Using mock live leaderboard data');
    
    const mockPlayers = [
      { 
        rank: 1, 
        username: 'FastCoder99', 
        status: 'solving', 
        progress: 85,
        testsPassed: 8,
        totalTests: 10,
        time: '2:45'
      },
      { 
        rank: 2, 
        username: 'QuickThink', 
        status: 'solving', 
        progress: 70,
        testsPassed: 7,
        totalTests: 10,
        time: '3:20'
      },
      { 
        rank: 3, 
        username: 'BugHunter', 
        status: 'solving', 
        progress: 60,
        testsPassed: 6,
        totalTests: 10,
        time: '4:10'
      },
      { 
        rank: 4, 
        username: 'OptimizeKing', 
        status: 'solved', 
        progress: 100,
        testsPassed: 10,
        totalTests: 10,
        time: '1:55'
      },
    ];

    return {
      success: true,
      data: mockPlayers,
      count: mockPlayers.length,
    };
  }

  /**
   * Mock top performers data
   * @private
   */
  _getMockTopPerformers(limit = 5) {
    const performers = [
      { rank: 1, username: 'AlgoMaster', time: '0:45', runtime: '5ms', memory: '2.1MB' },
      { rank: 2, username: 'CodeNinja', time: '0:52', runtime: '6ms', memory: '2.3MB' },
      { rank: 3, username: 'BinaryBeast', time: '1:12', runtime: '7ms', memory: '2.5MB' },
      { rank: 4, username: 'DebugDemon', time: '1:28', runtime: '8ms', memory: '2.8MB' },
      { rank: 5, username: 'LoopLord', time: '1:45', runtime: '9ms', memory: '3.1MB' },
    ];

    return {
      success: true,
      data: performers.slice(0, limit),
    };
  }
}

export default new LeaderboardService();
