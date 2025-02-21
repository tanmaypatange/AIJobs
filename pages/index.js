import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const jobsPerPage = 6;

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (response.ok) {
        const fetchedJobs = Array.isArray(data.jobs) ? data.jobs : [];
        setJobs(fetchedJobs);
        
        // Initially load first set of jobs
        setVisibleJobs(fetchedJobs.slice(0, jobsPerPage));
        setIsLoading(false);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Fetching jobs failed:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const loadMoreJobs = () => {
    const nextPage = page + 1;
    const startIndex = nextPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    
    const newVisibleJobs = [
      ...visibleJobs, 
      ...jobs.slice(startIndex, endIndex)
    ];
    
    setVisibleJobs(newVisibleJobs);
    setPage(nextPage);
  };

  const fixApplyUrl = (url) => {
    // Remove '/application' from the end of the URL
    return url.replace(/\/application$/, '');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '15px'
          }}></div>
          <span style={{ fontSize: '1.5rem' }}>Loading AI Jobs...</span>
        </div>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
        backgroundColor: '#121212',
        color: 'white'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#1E1E1E',
          borderRadius: '10px'
        }}>
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#FF6B6B',
            marginBottom: '15px'
          }}>
            Oops! Something went wrong
          </h2>
          <p style={{ 
            fontSize: '1rem', 
            color: '#A9A9A9' 
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#121212',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
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
          fontSize: '3rem',
          background: 'linear-gradient(to right, #00b4db, #0083b0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '40px'
        }}>
          AI Jobs Horizon
        </h1>

        {visibleJobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '18px'
          }}>
            No job listings available at the moment.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {visibleJobs.map((job, index) => (
                <div 
                  key={index} 
                  style={{
                    backgroundColor: '#1E1E1E',
                    borderRadius: '12px',
                    padding: '25px',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                >
                  <h2 style={{
                    fontSize: '1.5rem',
                    color: '#00b4db',
                    marginBottom: '15px'
                  }}>
                    {job.title}
                  </h2>
                  <div style={{
                    color: '#A9A9A9',
                    marginBottom: '20px'
                  }}>
                    {job.location && (
                      <p style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <span style={{ 
                          marginRight: '10px', 
                          color: '#00b4db' 
                        }}>
                          📍
                        </span>
                        {job.location}
                      </p>
                    )}
                    {job.department && (
                      <p style={{ 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}>
                        <span style={{ 
                          marginRight: '10px', 
                          color: '#00b4db' 
                        }}>
                          🏢
                        </span>
                        {job.department}
                      </p>
                    )}
                  </div>
                  <a 
                    href={fixApplyUrl(job.applyUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      backgroundColor: '#00b4db',
                      color: 'white',
                      textAlign: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#0083b0';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#00b4db';
                    }}
                  >
                    Explore Job Details
                  </a>
                </div>
              ))}
            </div>

            {visibleJobs.length < jobs.length && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '30px'
              }}>
                <button 
                  onClick={loadMoreJobs}
                  style={{
                    backgroundColor: '#00b4db',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#0083b0';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#00b4db';
                  }}
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{
        backgroundColor: '#1E1E1E',
        color: '#A9A9A9',
        textAlign: 'center',
        padding: '20px',
        marginTop: '30px'
      }}>
        <p>© {new Date().getFullYear()} AI Jobs Horizon</p>
      </footer>
    </div>
  );
}
