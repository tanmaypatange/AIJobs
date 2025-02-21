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

  // Salary information extraction
  const extractSalaryInfo = useCallback((job) => {
    try {
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
    } catch (error) {
      console.error('Salary extraction error:', error);
    }
    return null;
  }, []);

  // Fetch jobs with comprehensive error handling
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.jobs)) {
        throw new Error('Invalid job data received');
      }

      // Enhance job data
      const enhancedJobs = data.jobs.map(job => ({
        ...job,
        salaryInfo: extractSalaryInfo(job),
        company: job.company || 'OpenAI',
        location: job.location || 'Location Not Specified',
        department: job.department || 'Department Not Specified'
      }));

      // Prepare filter options
      const uniqueLocations = [...new Set(enhancedJobs.map(job => job.location))];
      const uniqueDepartments = [...new Set(enhancedJobs.map(job => job.department))];
      const uniqueCompanies = [...new Set(enhancedJobs.map(job => job.company))];
      const uniqueEmploymentTypes = [...new Set(enhancedJobs.map(job => job.employmentType || 'Not Specified'))];
      const remoteOptions = [...new Set(enhancedJobs.map(job => job.isRemote ? 'Remote' : 'On-site'))];
      
      // Salary ranges
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

      setJobs(enhancedJobs);
      setVisibleJobs(enhancedJobs.slice(0, jobsPerPage));
    } catch (err) {
      console.error('Comprehensive job fetching error:', err);
      setError(err.message);
    }
  }, [extractSalaryInfo]);

  // Initial job fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Comprehensive filtering logic
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

  // Load more jobs
  const loadMoreJobs = () => {
    const nextPage = page + 1;
    const startIndex = nextPage * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    
    const newVisibleJobs = [
      ...visibleJobs, 
      ...filteredJobs.slice(startIndex, endIndex)
    ];
    
    setVisibleJobs(newVisibleJobs);
    setPage(nextPage);
  };

  // Salary formatting
  const formatSalaryRange = (job) => {
    if (!job.salaryInfo || job.salaryInfo.minValue === 0 || job.salaryInfo.maxValue === 0) {
      return 'Salary not disclosed';
    }
    return `$${job.salaryInfo.minValue.toLocaleString()} - $${job.salaryInfo.maxValue.toLocaleString()} ${job.salaryInfo.currencyCode}`;
  };

  // Error rendering
  if (error) {
    return (
      <div className={styles.container}>
        <p>Error: {error}</p>
        <button onClick={fetchJobs}>Retry Fetching</button>
      </div>
    );
  }

  // Main render
  return (
    <div className={styles.container}>
      <Head>
        <title>AI Job Opportunities</title>
        <meta name="description" content="Discover Exciting AI Jobs" />
      </Head>

      <header>
        <h1>AI Job Opportunities</h1>
        <input 
          type="text"
          placeholder="Search jobs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <main>
        {visibleJobs.map((job, index) => (
          <div key={index}>
            <h2>{job.title}</h2>
            <p>Company: {job.company}</p>
            <p>Location: {job.location}</p>
            <p>Department: {job.department}</p>
            <p>Salary: {formatSalaryRange(job)}</p>
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply Now
            </a>
          </div>
        ))}
      </main>

      {filteredJobs.length > visibleJobs.length && (
        <button onClick={loadMoreJobs}>Load More</button>
      )}
    </div>
  );
}
