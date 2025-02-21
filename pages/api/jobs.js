export default async function handler(req, res) {
  try {
    const apiUrl = 'https://api.ashbyhq.com/posting-api/job-board/openai';
    const response = await fetch(`${apiUrl}?includeCompensation=true`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const data = await response.json();
    
    // Basic data validation
    if (!data || !data.jobs || !Array.isArray(data.jobs)) {
      throw new Error('Invalid job data received');
    }

    // Sanitize and transform job data
    const sanitizedJobs = data.jobs.map(job => ({
      title: job.title || 'Untitled Position',
      location: job.location || 'Location Not Specified',
      department: job.department || 'Department Not Specified',
      company: job.company || 'OpenAI',
      applyUrl: job.applyUrl || '',
      isRemote: job.isRemote || false,
      employmentType: job.employmentType || 'Not Specified',
      compensation: job.compensation ? {
        minValue: job.compensation.summaryComponents?.find(c => c.compensationType === 'Salary')?.minValue || 0,
        maxValue: job.compensation.summaryComponents?.find(c => c.compensationType === 'Salary')?.maxValue || 0,
        currencyCode: job.compensation.summaryComponents?.find(c => c.compensationType === 'Salary')?.currencyCode || 'USD'
      } : null
    }));

    res.status(200).json({ jobs: sanitizedJobs });
  } catch (error) {
    console.error('Job Fetching Error:', error);
    res.status(500).json({ 
      error: 'Unable to fetch job listings', 
      message: error.message 
    });
  }
}
