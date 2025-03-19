const fetch = require("node-fetch");

async function analyzeGithubIssues(specialIssues) {
  if (!Array.isArray(specialIssues) || specialIssues.length === 0) {
    throw new Error("Invalid or empty specialIssues array.");
  }

  const prompt = `Provide a structured JSON output based on the following GitHub issues. The JSON should include:
  - "name": The title of the issue.
  - "labels": A list of relevant labels with their name, description, and color.
  - "core_problem": A brief summary of the main problem.
  - "risk_rate": A risk assessment score from 1 (low) to 10 (critical), based on complexity and potential impact.
  - "priority": Categorized as "Low", "Medium", or "High" based on urgency.
  - "recommended_steps": A step-by-step approach to resolving the issue.
  - "estimated_time": Approximate time required to fix the issue (e.g., hours or days).

  **Output strictly in JSON format. Do not include any explanations, introductions, or additional text.**  

  Here are the issues:  
  ${JSON.stringify(specialIssues)}
  `;

  try {
    const url = process.env.URLL;
    const response = await fetch(`${url}/${encodeURIComponent(prompt)}`);

    const data = await response.text();

    const cleanData = data.replace(/```json|```/g, "").trim();
    const jsonData = JSON.parse(cleanData);

    return jsonData.priority;
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
    return null;
  }
}

module.exports = analyzeGithubIssues;
