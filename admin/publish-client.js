// Admin-side publish client helper
// Call this after you parsed the Excel into `parsedData` object
async function publishLive(parsedData) {
  try {
    // Replace with your deployed serverless endpoint if not using relative path
    const endpoint = window.PUBLISH_ENDPOINT || '/.netlify/functions/publish-kpi';

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': window.ADMIN_SECRET || prompt('Enter admin secret to publish:')
      },
      body: JSON.stringify(parsedData)
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || 'Publish failed');

    // show status (your admin UI has showMessage or showStatus)
    if (typeof showMessage === 'function') {
      showMessage('adminMessage', '✅ Published live successfully', 'success');
    } else {
      alert('Published live successfully');
    }
  } catch (err) {
    if (typeof showMessage === 'function') {
      showMessage('adminMessage', '❌ Publish failed: ' + err.message, 'error');
    } else {
      alert('Publish failed: ' + err.message);
    }
    console.error(err);
  }
}

// Example wiring: call publishLive(parsedData) after your existing "Save/Publish" action
