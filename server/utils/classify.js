const fetch = require("node-fetch");

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
