const username = 'MasutaK';
const repoList = document.getElementById('repo-list');
const sortSelect = document.getElementById('sort');
const languageSelect = document.getElementById('language');
const toggleThemeBtn = document.getElementById('toggle-theme');

let repos = [];
let languages = new Set();

// Set dark mode based on system preference
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    document.body.classList.add('dark');
}

// Toggle theme button
toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
});

// Fetch GitHub repositories
fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    .then(res => res.json())
    .then(data => {
        repos = data;
        extractLanguages(repos);
        populateLanguageFilter();
        displayRepos();
    })
    .catch(err => console.error(err));

// Extract unique languages
function extractLanguages(repos) {
    repos.forEach(repo => {
        if(repo.language) languages.add(repo.language);
    });
}

// Populate language filter dropdown
function populateLanguageFilter() {
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelect.appendChild(option);
    });
}

// Listen to filter and sort changes
sortSelect.addEventListener('change', displayRepos);
languageSelect.addEventListener('change', displayRepos);

// Display repositories
function displayRepos() {
    repoList.innerHTML = '';

    let filteredRepos = repos;

    const selectedLang = languageSelect.value;
    if(selectedLang !== 'all'){
        filteredRepos = filteredRepos.filter(r => r.language === selectedLang);
    }

    const sortBy = sortSelect.value;
    if(sortBy === 'stars'){
        filteredRepos.sort((a,b) => b.stargazers_count - a.stargazers_count);
    } else {
        filteredRepos.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    filteredRepos.forEach((repo, i) => {
        const repoDiv = document.createElement('div');
        repoDiv.classList.add('repo');
        repoDiv.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description available"}</p>
            <p>Main language: ${repo.language || "Unknown"}</p>
            <p>⭐ ${repo.stargazers_count} - Last updated: ${new Date(repo.updated_at).toLocaleDateString()}</p>
            <a href="${repo.html_url}" target="_blank">View on GitHub</a>
        `;
        repoList.appendChild(repoDiv);

        // Fade-in animation
        setTimeout(() => {
            repoDiv.style.transform = 'translateY(0)';
            repoDiv.style.opacity = '1';
        }, i * 100);
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(".repo").forEach((repo) => {
    observer.observe(repo);
});
