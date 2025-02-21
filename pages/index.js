import { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import styles from '../styles/Jobs.module.css';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [visibleJobs, setVisibleJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    locations: [],
    departments: [],
    employmentTypes: [],
    remoteStatus: [],
    salaryRange: null
  });
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [],
    departments: [],
    employmentTypes: [],
    remoteStatus: [],
    salaryRange: null
  });
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
        
        // Prepare filter options
        const uniqueLocations = [...new Set(fetchedJobs.map(job => job.location))];
        const uniqueDepartments = [...new Set(fetchedJobs.map(job => job.department))];
        const uniqueEmploymentTypes = [...new Set(fetchedJobs.map(job => job.employmentType))];
        const remoteOptions = [...new Set(fetchedJobs.map(job => job.isRemote ? 'Remote' : 'On-site'))];

        setFilters({
          locations: uniqueLocations,
          departments: uniqueDepartments,
          employmentTypes: uniqueEmploymentTypes,
          remoteStatus: remoteOptions,
          salaryRange: {
            min: Math.min(...fetchedJobs.map(job => job.compensation?.minValue || 0)),
            max: Math.max(...fetchedJobs.map(job => job.compensation?.maxValue || 1000000))
          }
        });

        setVisibleJobs(fetchedJobs.slice(0, jobsPerPage));
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Fetching jobs failed:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocations = selectedFilters.locations.length === 0 || 
        selectedFilters.locations.includes(job.location);

      const matchesDepartments = selectedFilters.departments.length === 0 || 
        selectedFilters.departments.includes(job.department);

      const matchesEmploymentTypes = selectedFilters.employmentTypes.length === 0 || 
        selectedFilters.employmentTypes.includes(job.employmentType);

      const matchesRemoteStatus = selectedFilters.remoteStatus.length === 0 || 
        (selectedFilters.remoteStatus.includes('Remote') && job.isRemote) ||
        (selectedFilters.remoteStatus.includes('On-site') && !job.isRemote);

      return matchesSearch && 
             matchesLocations && 
             matchesDepartments && 
             matchesEmploymentTypes && 
             matchesRemoteStatus;
    });
  }, [jobs, searchTerm, selectedFilters]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[filterType];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter(f => f !== value)
        : [...currentFilters, value];
      
      return {
        ...prev,
        [filterType]: newFilters
      };
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      locations: [],
      departments: [],
      employmentTypes: [],
      remoteStatus: [],
      salaryRange: null
    });
    setSearchTerm('');
  };

  const fixApplyUrl = (url) => {
    return url.replace(/\/application$/, '');
  };

  if (error) {
    return (
      <div className={styles.container}>
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

      <div className={styles.pageLayout}>
        {/* Sidebar Filters */}
        <aside className={styles.filterSidebar}>
          <div className={styles.filterSection}>
            <h3>Locations</h3>
            {filters.locations.map(location => (
              <label key={location} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFilters.locations.includes(location)}
                  onChange={() => handleFilterChange('locations', location)}
                />
                {location}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h3>Departments</h3>
            {filters.departments.map(department => (
              <label key={department} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFilters.departments.includes(department)}
                  onChange={() => handleFilterChange('departments', department)}
                />
                {department}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h3>Employment Type</h3>
            {filters.employmentTypes.map(type => (
              <label key={type} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFilters.employmentTypes.includes(type)}
                  onChange={() => handleFilterChange('employmentTypes', type)}
                />
                {type}
              </label>
            ))}
          </div>

          <div className={styles.filterSection}>
            <h3>Work Type</h3>
            {filters.remoteStatus.map(status => (
              <label key={status} className={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedFilters.remoteStatus.includes(status)}
                  onChange={() => handleFilterChange('remoteStatus', status)}
                />
                {status}
              </label>
            ))}
          </div>

          <button 
            className={styles.resetFiltersButton}
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <h1>AI Job Opportunities</h1>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Search jobs by title, location, or department" 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </header>

          <main className={styles.jobGrid}>
            {filteredJobs.slice(0, page * jobsPerPage).map((job, index) => (
              <div key={index} className={styles.jobCard}>
                <h2 className={styles.jobTitle}>{job.title}</h2>
                <div className={styles.jobDetails}>
                  {job.location && (
                    <p className={styles.jobLocation}>
                      📍 {job.location}
                    </p>
                  )}
                  {job.department && (
                    <p className={styles.jobDepartment}>
                      🏢 {job.department}
                    </p>
                  )}
                  {job.isRemote !== undefined && (
                    <p className={styles.jobRemote}>
                      {job.isRemote ? '🌐 Remote' : '🏢 On-site'}
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

          {filteredJobs.length > page * jobsPerPage && (
            <div className={styles.loadMoreContainer}>
              <button 
                onClick={() => setPage(prev => prev + 1)}
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
      </div>
    </div>
  );
}
