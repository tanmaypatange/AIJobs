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
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4'
      }}>
        <div style={{
          fontSize: '24px',
          color: '#666'
        }}>Loading AI Jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4'
      }}>
        <div style={{
          fontSize: '24px',
          color: 'red'
        }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#f4f4f4',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>AI Jobs</title>
        <meta name="description" content="Latest AI Job Openings" />
      </Head>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          color: '#333',
          marginBottom: '30px'
        }}>
          AI Jobs
        </h1>

        {jobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '18px'
          }}>
            No job listings available at the moment.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {jobs.map((job, index) => (
              <div 
                key={index} 
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  padding: '20px',
                  transition: 'box-shadow 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              >
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '10px'
                }}>
                  {job.title}
                </h2>
                <div style={{
                  color: '#666',
                  marginBottom: '15px'
                }}>
                  {job.location && (
                    <p style={{ marginBottom: '5px' }}>
                      📍 {job.location}
                    </p>
                  )}
                  {job.department && (
                    <p>🏢 {job.department}</p>
                  )}
                </div>
                <a 
                  href={job.applyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    textAlign: 'center',
                    padding: '10px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{
        backgroundColor: 'white',
        padding: '20px',
        textAlign: 'center',
        marginTop: '20px',
        color: '#666'
      }}>
        <p>© {new Date().getFullYear()} AI Jobs Platform</p>
      </footer>
    </div>
  );
}
