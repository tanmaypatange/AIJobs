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
    companies: [],
    employmentTypes: [],
    remoteStatus: [],
    salaryRanges: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [],
    departments: [],
    companies: [],
    employmentTypes: [],
    remoteStatus: [],
    salaryRanges: []
  });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const jobsPerPage = 6;

  // Extract salary information from job data
  const extractSalaryInfo = (job) => {
    if (job.compensation && job.compensation.summaryComponents) {
      const salaryComponent = job.compensation.summaryComponents.find(
        comp => comp.compensationType === 'Salary'
      );
      return {
        minValue: salaryComponent?.minValue || 0,
        maxValue: salaryComponent?.maxValue || 0,
        currencyCode: salaryComponent?.currencyCode || 'USD'
      };
    }
    return null;
  };

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (response.ok) {
        // Enhance job data with additional properties
        let fetchedJobs = Array.isArray(data.jobs) ? data.jobs.map(job => ({
          ...job,
          salaryInfo: extractSalaryInfo(job),
          company: job.company || 'OpenAI' // Default company name if not provided
        })) : [];

        // Prepare filter options
        const uniqueLocations = [...new Set(fetchedJobs.map(job => job.location))];
        const uniqueDepartments = [...new Set(fetchedJobs.map(job => job.department))];
        const uniqueCompanies = [...new Set(fetchedJobs.map(job => job.company))];
        const uniqueEmploymentTypes = [...new Set(fetchedJobs.map(job => job.employmentType))];
        const remoteOptions = [...new Set(fetchedJobs.map(job => job.isRemote ? 'Remote' : 'On-site'))];
        
        // Prepare salary ranges
        const salaryRanges = [
          { label: 'Under $50K', min: 0, max: 50000 },
          { label: '$50K - $100K', min: 50000, max: 100000 },
          { label: '$100K - $150K', min: 100000, max: 150000 },
          { label: 'Over $150K', min: 150000, max: Infinity }
        ];

        setFilters({
          locations: uniqueLocations,
          departments: uniqueDepartments,
          companies: uniqueCompanies,
          employmentTypes: uniqueEmploymentTypes,
          remoteStatus: remoteOptions,
          salaryRanges: salaryRanges
        });

        setJobs(fetchedJobs);
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

  // Filtering logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocations = selectedFilters.locations.length === 0 || 
        selectedFilters.locations.includes(job.location);

      const matchesDepartments = selectedFilters.departments.length === 0 || 
        selectedFilters.departments.includes(job.department);

      const matchesCompanies = selectedFilters.companies.length === 0 || 
        selectedFilters.companies.includes(job.company);

      const matchesEmploymentTypes = selectedFilters.employmentTypes.length === 0 || 
        selectedFilters.employmentTypes.includes(job.employmentType);

      const matchesRemoteStatus = selectedFilters.remoteStatus.length === 0 || 
        (selectedFilters.remoteStatus.includes('Remote') && job.isRemote) ||
        (selectedFilters.remoteStatus.includes('On-site') && !job.isRemote);

      const matchesSalaryRange = selectedFilters.salaryRanges.length === 0 || 
        (job.salaryInfo && selectedFilters.salaryRanges.some(range => 
          job.salaryInfo.minValue >= range.min && 
          job.salaryInfo.maxValue <= range.max
        ));

      return matchesSearch && 
             matchesLocations && 
             matchesDepartments && 
             matchesCompanies &&
             matchesEmploymentTypes && 
             matchesRemoteStatus &&
             matchesSalaryRange;
    });
  }, [jobs, searchTerm, selectedFilters]);

  // Handle filter changes
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

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({
      locations: [],
      departments: [],
      companies: [],
      employmentTypes: [],
      remoteStatus: [],
      salaryRanges: []
    });
    setSearchTerm('');
  };

  // Format salary range for display
  const formatSalaryRange = (job) => {
    if (!job.salaryInfo || job.salaryInfo.minValue === 0 || job.salaryInfo.maxValue === 0) {
      return 'Salary not disclosed';
    }
    return `$${job.salaryInfo.minValue.toLocaleString()} - $${job.salaryInfo.maxValue.toLocaleString()} ${job.salaryInfo.currencyCode}`;
  };

  // Fix apply URL
  const fixApplyUrl = (url) => {
    return url.replace(/\/application$/, '');
  };

  // Error handling
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
          <div className={styles.filterScrollContainer}>
            {/* Locations Filter */}
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

            {/* Companies Filter */}
            <div className={styles.filterSection}>
              <h3>Companies</h3>
              {filters.companies.map(company => (
                <label key={company} className={styles.filterCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.companies.includes(company)}
                    onChange={() => handleFilterChange('companies', company)}
                  />
                  {company}
                </label>
              ))}
            </div>

            {/* Departments Filter */}
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

            {/* Employment Type Filter */}
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

            {/* Remote Status Filter */}
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

            {/* Salary Range Filter */}
            <div className={styles.filterSection}>
              <h3>Salary Range</h3>
              {filters.salaryRanges.map(range => (
                <label key={range.label} className={styles.filterCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedFilters.salaryRanges.some(r => r.label === range.label)}
                    onChange={() => handleFilterChange('salaryRanges', range)}
                  />
                  {range.label}
                </label>
              ))}
            </div>

            {/* Reset Filters Button */}
            <button 
              className={styles.resetFiltersButton}
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <h1>AI Job Opportunities</h1>
            <div className={styles.searchContainer}>
              <input 
                type="text" 
                placeholder="Search jobs by title, location, company, or department" 
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
                  {job.company && (
                    <p className={styles.jobCompany}>
                      🏢 {job.company}
                    </p>
                  )}
                  {job.location && (
                    <p className={styles.jobLocation}>
                      📍 {job.location}
                    </p>
                  )}
                  {job.department && (
                    <p className={styles.jobDepartment}>
                      📋 {job.department}
                    </p>
                  )}
                  {job.isRemote !== undefined && (
                    <p className={styles.jobRemote}>
                      {job.isRemote ? '🌐 Remote' : '🏠 On-site'}
                    </p>
                  )}
                  {job.salaryInfo && (
                    <p className={styles.jobSalary}>
                      💰 {formatSalaryRange(job)}
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
