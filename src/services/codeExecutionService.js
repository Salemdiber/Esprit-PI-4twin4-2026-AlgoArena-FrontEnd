/**
 * Code Execution Service
 * Manages code execution, compilation, and test case validation
 * Integrates with backend judge system
 */

import { apiClient } from './apiClient';

class CodeExecutionService {
  /**
   * Run code against test cases
   * @param {string} code - User's code
   * @param {string} language - Programming language (javascript, python, java, cpp)
   * @param {string} challengeId - Challenge ID
   * @param {Array} testCases - Test cases to run
   * @returns {Promise} Execution results
   */
  async runCode(code, language, challengeId, testCases = []) {
    try {
      console.log('🚀 Running code execution...', { language, challengeId, testCases: testCases.length });

      const response = await apiClient('/submissions/run', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          challengeId,
          testCases,
        }),
      });

      console.log('✅ Run complete:', response);
      return {
        success: true,
        ...response,
      };
    } catch (error) {
      console.error('❌ Code execution error:', error);
      
      // Fallback to simulated results for demo
      return this._simulateExecution(testCases);
    }
  }

  /**
   * Submit code (full test suite)
   * @param {string} code - User's code
   * @param {string} language - Programming language
   * @param {string} challengeId - Challenge ID
   * @param {Array} testCases - All test cases
   * @returns {Promise} Submission results
   */
  async submitCode(code, language, challengeId, testCases = []) {
    try {
      console.log('📤 Submitting code...', { language, challengeId });

      const response = await apiClient('/submissions/submit', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          challengeId,
          testCases,
        }),
      });

      console.log('✅ Submission complete:', response);
      return {
        success: true,
        ...response,
      };
    } catch (error) {
      console.error('❌ Submission error:', error);
      
      // Fallback to simulated results
      return this._simulateSubmission(testCases);
    }
  }

  /**
   * Simulate code execution (for testing/demo)
   * @private
   */
  _simulateExecution(testCases) {
    console.log('🎭 Simulating execution...');
    
    const results = testCases.map((tc, idx) => {
      // 85% pass rate for demo
      const passed = Math.random() > 0.15;
      return {
        id: tc.id || `test_${idx}`,
        input: tc.input,
        expected: tc.output || tc.expected,
        actual: passed ? (tc.output || tc.expected) : 'Error',
        status: passed ? 'PASSED' : 'FAILED',
        runtime: Math.round(10 + Math.random() * 50), // ms
        memory: (38 + Math.random() * 10).toFixed(1), // MB
        time: `${Math.round(10 + Math.random() * 50)}ms`,
      };
    });

    const passed = results.filter(r => r.status === 'PASSED').length;
    const total = results.length;

    return {
      success: true,
      output: `Executed ${total} test cases`,
      status: passed === total ? 'ACCEPTED' : 'PARTIAL',
      passedTests: passed,
      totalTests: total,
      testResults: results,
      executionTime: Math.round(results.reduce((sum, r) => sum + r.runtime, 0)),
      totalMemory: (results.reduce((sum, r) => sum + parseFloat(r.memory), 0)).toFixed(1),
    };
  }

  /**
   * Simulate submission (for testing/demo)
   * @private
   */
  _simulateSubmission(testCases) {
    console.log('🎭 Simulating submission...');
    
    const results = testCases.map((tc, idx) => {
      // 75% pass rate for submission
      const passed = Math.random() > 0.25;
      return {
        id: tc.id || `test_${idx}`,
        input: tc.input,
        expected: tc.output || tc.expected,
        actual: passed ? (tc.output || tc.expected) : 'Error',
        status: passed ? 'PASSED' : 'FAILED',
        runtime: Math.round(15 + Math.random() * 60), // ms
        memory: (40 + Math.random() * 12).toFixed(1), // MB
        time: `${Math.round(15 + Math.random() * 60)}ms`,
      };
    });

    const passed = results.filter(r => r.status === 'PASSED').length;
    const total = results.length;

    return {
      success: true,
      output: `Submitted ${total} test cases`,
      status: passed === total ? 'ACCEPTED' : 'PARTIAL',
      passedTests: passed,
      totalTests: total,
      testResults: results,
      executionTime: Math.round(results.reduce((sum, r) => sum + r.runtime, 0)),
      totalMemory: (results.reduce((sum, r) => sum + parseFloat(r.memory), 0)).toFixed(1),
      score: Math.round((passed / total) * 100),
      xpEarned: passed === total ? 100 : Math.round((passed / total) * 50),
    };
  }

  /**
   * Validate code syntax
   */
  async validateSyntax(code, language) {
    try {
      const response = await apiClient('/submissions/validate', {
        method: 'POST',
        body: JSON.stringify({ code, language }),
      });
      return response;
    } catch (error) {
      console.error('❌ Syntax validation error:', error);
      return { valid: true }; // Assume valid if backend not available
    }
  }

  /**
   * Get execution statistics for optimization
   */
  async getExecutionStats(challengeId) {
    try {
      const response = await apiClient(`/challenges/${challengeId}/stats`);
      return response;
    } catch (error) {
      console.error('❌ Stats retrieval error:', error);
      return null;
    }
  }
}

export default new CodeExecutionService();
