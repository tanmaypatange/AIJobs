import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import styles from '../styles/Jobs.module.css';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Fetching jobs failed:', err);
      setError(err.message);
    } finally {
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
    return url.replace(/\/application$/, '');
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Job Opportunities</title>
        <meta name="description" content="Discover Exciting AI Jobs" />
      </Head>

      <header className={styles.header}>
        <h1>AI Job Opportunities</h1>
      </header>

      <main className={styles.jobGrid}>
        {visibleJobs.map((job, index) => (
          <div key={index} className={styles.jobCard}>
            <h2 className={styles.jobTitle}>{job.title}</h2>
            <div className={styles.jobDetails}>
              {job.location && (
                <p className={styles.jobLocation}>
                  <span>📍</span> {job.location}
                </p>
              )}
              {job.department && (
                <p className={styles.jobDepartment}>
                  <span>🏢</span> {job.department}
                </p>
              )}
            </div>
            <a 
              href={fixApplyUrl(job.applyUrl)} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.applyButton}
            >
              View Job Details
            </a>
          </div>
        ))}
      </main>

      {visibleJobs.length < jobs.length && (
        <div className={styles.loadMoreContainer}>
          <button 
            onClick={loadMoreJobs}
            className={styles.loadMoreButton}
          >
            Load More Jobs
          </button>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} AI Job Opportunities</p>
      </footer>
    </div>
  );
}
