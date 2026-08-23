const { Octokit } = require("@octokit/rest");

exports.handler = async function(event, context) {
  // Netlify/AWS Lambda style handler: event.body contains JSON string
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const headers = (event.headers || {});
  const adminSecret = headers['x-admin-secret'] || headers['X-Admin-Secret'];
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let parsedData;
  try {
    parsedData = event.body && typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!parsedData) return { statusCode: 400, body: JSON.stringify({ error: 'No data provided' }) };

  const owner = 'gobraking2013-hue';
  const repo = 'Nagarajan-1985';
  const path = 'kpi-data.json';
  const branch = process.env.REPO_BRANCH || 'main';

  const octokit = new Octokit({ auth: process.env.GH_PAT });

  try {
    const content = Buffer.from(JSON.stringify(parsedData, null, 2)).toString('base64');

    // Try to get existing file sha
    let sha = null;
    try {
      const existing = await octokit.repos.getContent({ owner, repo, path, ref: branch });
      sha = existing.data.sha;
    } catch (err) {
      if (err.status !== 404) throw err; // ignore not found
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Publish KPI data ${new Date().toISOString()}`,
      content,
      branch,
      ...(sha ? { sha } : {})
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Commit failed' }) };
  }
};
