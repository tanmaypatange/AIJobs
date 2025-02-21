export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      // Log more detailed error information
      const errorBody = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate data structure
    if (!data || !Array.isArray(data.jobs)) {
      throw new Error('Invalid data structure received from API');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Detailed Job Fetching Error:', error);
    res.status(500).json({ 
      error: 'Unable to fetch job listings', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
