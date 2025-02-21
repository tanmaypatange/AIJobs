import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/jobs');
        const data = await response.json();

        if (response.ok) {
          setJobs(Array.isArray(data.jobs) ? data.jobs : []);
          setIsLoading(false);
        } else {
          throw new Error(data.error || 'Failed to fetch jobs');
        }
      } catch (err) {
        console.error('Fetching jobs failed:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (isLoading) {
    return <div>Loading OpenAI job listings...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Head>
        <title>OpenAI Job Listings</title>
      </Head>

      <main>
        <h1>OpenAI Job Listings</h1>
        
        {jobs.length === 0 ? (
          <p>No job listings available.</p>
        ) : (
          <ul>
            {jobs.map((job, index) => (
              <li key={index}>
                <h2>{job.title}</h2>
                <p>Location: {job.location}</p>
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
