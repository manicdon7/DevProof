/**
 * Analyzes GitHub issues using CoreMate AI with axios
 * @module analyzeGithubIssues
 */

const axios = require('axios');

/**
 * Analyzes GitHub issues and returns priority data
 * @param {Array} specialIssues - Array of GitHub issues to analyze
 * @returns {Promise<string|null>} - Priority string ("High", "Medium", "Low") or null on error
 * @throws {Error} - If specialIssues is invalid or empty
 */
async function analyzeGithubIssues(specialIssues) {
  if (!Array.isArray(specialIssues) || specialIssues.length === 0) {
    throw new Error("Invalid or empty specialIssues array.");
  }

  const prompt = `Provide a structured JSON output based on the following GitHub issues. The JSON must include:
  - "name": The title of the issue.
  - "labels": A list of relevant labels with their name, description, and color.
  - "core_problem": A brief summary of the main problem.
  - "risk_rate": A risk assessment score from 1 (low) to 10 (critical), based on complexity and potential impact.
  - "priority": STRICTLY one of "High", "Medium", or "Low" — no other values are allowed.
  - "recommended_steps": A step-by-step approach to resolving the issue.
  - "estimated_time": Approximate time required to fix the issue (e.g., hours or days).

  **Output must be strictly valid JSON. Do not include any explanations, introductions, or extra text. The "priority" value must be ONLY "High", "Medium", or "Low". Any deviation is not allowed.**  

  Here are the issues:  
  ${JSON.stringify(specialIssues)}
  `;

  try {
    const url = process.env.URLL; // Fallback to default if URLL not set
    const response = await axios.get(`${url}/${encodeURIComponent(prompt)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CoreMate-Issue-Analyzer/1.0',
      },
      timeout: 10000, // 10-second timeout
    });

    const data = response.data;

    // Clean and parse the response
    const cleanData = data.replace(/```json|```/g, "").trim();
    const jsonData = JSON.parse(cleanData);

    return jsonData.priority; // Returning only priority as per original code
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error.message);
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received');
    }
    return null;
  }
}

module.exports = analyzeGithubIssues;