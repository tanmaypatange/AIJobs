export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Job fetching error:', error);
    res.status(500).json({ 
      error: 'Unable to fetch job listings', 
      details: error.message 
    });
  }
}
