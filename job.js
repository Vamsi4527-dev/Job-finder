const allJobs = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "TechCorp",
        logo: "TC",
        location: "Mumbai",
        type: "full-time",
        remote: true,
        salary: "₹8,00,000 - ₹12,00,000",
        description: "We are looking for a skilled Frontend Developer to join our team. You will work with modern technologies like React and JavaScript.",
        requirements: ["3+ years experience", "React knowledge", "JavaScript skills", "Team player"],
        posted: "2 days ago"
    },
    {
        id: 2,
        title: "UI/UX Designer",
        company: "DesignPro",
        logo: "DP",
        location: "Remote",
        type: "full-time",
        remote: true,
        salary: "₹7,00,000 - ₹10,00,000",
        description: "Join our design team to create beautiful user experiences. Work with Figma and collaborate with developers.",
        requirements: ["2+ years experience", "Figma skills", "Creative thinking", "Portfolio required"],
        posted: "1 day ago"
    },
    {
        id: 3,
        title: "Backend Developer",
        company: "DataSoft",
        logo: "DS",
        location: "New York",
        type: "full-time",
        remote: false,
        salary: "₹9,00,000 - ₹13,00,000",
        description: "Build powerful backend systems using Python and databases. Work on scalable applications.",
        requirements: ["4+ years experience", "Python knowledge", "Database skills", "API development"],
        posted: "3 days ago"
    },
    {
        id: 4,
        title: "Marketing Manager",
        company: "GrowthCo",
        logo: "GC",
        location: "London",
        type: "full-time",
        remote: false,
        salary: "₹4,50,000 - ₹6,50,000",
        description: "Lead our marketing team and create campaigns that drive growth. Experience with digital marketing required.",
        requirements: ["5+ years experience", "Digital marketing", "Team leadership", "Analytics skills"],
        posted: "4 days ago"
    },
    {
        id: 5,
        title: "Part-time Writer",
        company: "ContentHub",
        logo: "CH",
        location: "Toronto",
        type: "part-time",
        remote: true,
        salary: "₹2,500 - ₹4,000 /hour",
        description: "Write engaging content for our blog and social media. Flexible hours and creative freedom.",
        requirements: ["Writing experience", "SEO knowledge", "Creative skills", "Self-motivated"],
        posted: "1 week ago"
    },
    {
        id: 6,
        title: "Project Manager",
        company: "BuildTech",
        logo: "BT",
        location: "Remote",
        type: "contract",
        remote: true,
        salary: "₹6,000 - ₹8,000 /hour",
        description: "Manage software projects from start to finish. Work with development teams and clients.",
        requirements: ["Project management", "Agile experience", "Communication skills", "Problem solving"],
        posted: "5 days ago"
    },
    {
        id: 7,
        title: "Full Stack Developer",
        company: "BuildTech",
        logo: "BT",
        location: "Hyderabad",
        type: "contract",
        remote: true,
        salary: "₹6,000 - ₹8,000 /hour",
        description: "Manage software projects from start to finish. Work with development teams and clients.",
        requirements: ["HTML", "CSS", "JavaScript", "Java or Python", "Databases like MySQL, MongoDB, or Oracle"],
        posted: "5 days ago"
    },
    {
        id: 8,
        title: "Data Analyst",
        company: "DataCorp",
        logo: "DC",
        location: "Bengaluru",
        type: "full-time",
        remote: false,
        salary: "₹5,00,000 - ₹7,00,000",
        description: "Analyze data to provide insights for business decisions. Work with SQL and visualization tools.",
        requirements: ["SQL knowledge", "Excel skills", "Data visualization", "Analytical thinking"],
        posted: "1 week ago"
    },
    {
        id: 9,
        title: "DevOps Engineer",
        company: "CloudTech",
        logo: "CT",
        location: "Mumbai",
        type: "full-time",
        remote: true,
        salary: "₹10,00,000 - ₹15,00,000",
        description: "Manage cloud infrastructure and deployment pipelines. Experience with AWS/Azure required.",
        requirements: ["DevOps experience", "AWS/Azure knowledge", "Docker/Kubernetes", "CI/CD pipelines"],
        posted: "3 days ago"
    },
    {
        id: 10,
        title: "Content Writer",
        company: "MediaHub",
        logo: "MH",
        location: "Rajahmundry",
        type: "part-time",
        remote: true,
        salary: "₹1,500 - ₹2,500 /hour",
        description: "Create engaging content for websites and social media platforms.",
        requirements: ["Content writing", "SEO basics", "Research skills", "Creative writing"],
        posted: "6 days ago"
    }
];

let showJobs = allJobs;
let jobCount = 6;
let isUserLoggedIn = true; 

//show jobs on page
function displayJobs() {
    let html = '';
    for (let i = 0; i < Math.min(jobCount, showJobs.length); i++) {
        let job = showJobs[i];
        html += `
            <div class="job-card" onclick="showDetails(${job.id})">
                <div class="job-header">
                    <div class="company-logo">${job.logo}</div>
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <div class="company-name">${job.company}</div>
                    </div>
                </div>
                <div class="job-details">
                    <span class="job-tag ${job.type}">${job.type === 'full-time' ? 'Full Time' : job.type === 'part-time' ? 'Part Time' : 'Contract'}</span>
                    ${job.remote ? '<span class="job-tag remote">Remote</span>' : ''}
                    <span class="job-tag">${job.location}</span>
                </div>
                <div class="job-salary">${job.salary}</div>
                <div class="job-description">${job.description}</div>
                <div class="job-footer">
                    <span class="job-date">Posted ${job.posted}</span>
                    <button class="apply-btn" onclick="event.stopPropagation(); applyJob(${job.id})">Apply Now</button>
                </div>
            </div>
        `;
    }
    document.getElementById('jobsContainer').innerHTML = html;
    
    document.getElementById('totalJobs').textContent = showJobs.length;
    document.getElementById('newJobs').textContent = Math.floor(showJobs.length * 0.2);
    document.getElementById('companies').textContent = new Set(showJobs.map(job => job.company)).size;
}

function searchJobs() {
    let search = document.getElementById('searchInput').value.toLowerCase();
    let location = document.getElementById('locationSelect').value;
    let type = document.getElementById('typeSelect').value;
    
    showJobs = allJobs.filter(job => {
        let matchText = search === '' || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search);
        let matchLocation = location === '' || job.location.toLowerCase().replace(' ', '') === location || (location === 'remote' && job.remote);
        let matchType = type === '' || job.type === type;
        return matchText && matchLocation && matchType;
    });
    
    jobCount = 6;
    displayJobs();
}

function loadMoreJobs() {
    jobCount += 6;
    displayJobs();
}

function showDetails(jobId) {
    let job = allJobs.find(j => j.id === jobId);
    let requirements = job.requirements.map(req => `<li>${req}</li>`).join('');
    
    document.getElementById('modalContent').innerHTML = `
        <h2>${job.title}</h2>
        <h3>${job.company}</h3>
        <p><strong>Location:</strong> ${job.location}</p>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Remote:</strong> ${job.remote ? 'Yes' : 'No'}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Description:</strong> ${job.description}</p>
        <p><strong>Requirements:</strong></p>
        <ul>${requirements}</ul>
        <p><strong>Posted:</strong> ${job.posted}</p>
        <button class="apply-btn" onclick="applyJob(${job.id})">Apply Now</button>
    `;
    document.getElementById('jobModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('jobModal').style.display = 'none';
}

function applyJob(jobId) {
    let job = allJobs.find(j => j.id === jobId);
    alert(`Applied for ${job.title} at ${job.company}!`);
    closeModal();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        isUserLoggedIn = false;
        updateLogoutVisibility();
        alert('You have been logged out successfully!');
        window.location.href = 'login12.html';
    }
}

// Update logout button visibility based on login state
function updateLogoutVisibility() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (isUserLoggedIn) {
        logoutBtn.classList.remove('hidden');
    } else {
        logoutBtn.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    displayJobs();
    updateLogoutVisibility();
    
    document.getElementById('searchInput').addEventListener('input', searchJobs);
    document.getElementById('locationSelect').addEventListener('change', searchJobs);
    document.getElementById('typeSelect').addEventListener('change', searchJobs);
    
    document.getElementById('jobModal').addEventListener('click', function(e) {
        if (e.target.id === 'jobModal') closeModal();
    });
});