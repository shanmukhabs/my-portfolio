(function () {
    const STORAGE_KEYS = {
        profile: 'portfolioProfileData',
        projects: 'portfolioProjects',
        skills: 'portfolioSkills',
        learning: 'portfolioLearning',
        certifications: 'portfolioCertifications'
    };

    function safeJSONParse(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function readStorage(key, fallback) {
        try {
            const rawValue = localStorage.getItem(key);
            return rawValue === null ? fallback : safeJSONParse(rawValue, fallback);
        } catch (error) {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    async function logout() {
        try {
            const { auth, signOut } = await import('./firebase-auth.js');
            await signOut(auth);
        } catch (error) {
            console.error('Could not sign out via Firebase module:', error);
            localStorage.removeItem('portfolioAdminUser');
            window.location.href = 'login.html';
        }
    }

    function getDefaultProfile() {
        return {
            name: 'Shanmukha BS',
            title: 'Full Stack Developer',
            about: 'I am a Full Stack Developer interested in building modern, responsive and user-friendly web applications.',
            email: 'shanmukha@example.com',
            github: 'https://github.com/',
            linkedin: 'https://linkedin.com/',
            education: 'Bachelor of Engineering from BIET',
            image: 'assets/IMG-20250923-WA0002.jpg'
        };
    }

    function getProfileData() {
        const stored = readStorage(STORAGE_KEYS.profile, getDefaultProfile());
        return {
            ...getDefaultProfile(),
            ...stored
        };
    }

    function updateIndexContent() {
        const profile = getProfileData();
        const heroName = document.getElementById('heroName');
        const heroTitle = document.getElementById('heroTitle');
        const heroSummary = document.getElementById('heroSummary');
        const profileImage = document.getElementById('editProfileImage');

        if (heroName) {
            heroName.textContent = profile.name || getDefaultProfile().name;
        }

        if (heroTitle) {
            heroTitle.textContent = profile.title || getDefaultProfile().title;
        }

        if (heroSummary) {
            heroSummary.textContent = profile.about || getDefaultProfile().about;
        }

        if (profileImage && profile.image) {
            profileImage.src = profile.image;
        }
    }

    function populateProfileForm() {
        const profile = getProfileData();
        const fields = [
            ['profileName', profile.name],
            ['profileTitle', profile.title],
            ['profileAbout', profile.about],
            ['profileEmail', profile.email],
            ['profileGithub', profile.github],
            ['profileLinkedin', profile.linkedin],
            ['profileEducation', profile.education]
        ];

        fields.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value || '';
            }
        });

        const profileImage = document.getElementById('editProfileImage');
        if (profileImage && profile.image) {
            profileImage.src = profile.image;
        }
    }

    function initProfilePage() {
        const profileForm = document.getElementById('profileForm');
        const uploadInput = document.getElementById('profileUpload');

        if (profileForm) {
            populateProfileForm();

            profileForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const profile = {
                    name: document.getElementById('profileName')?.value || '',
                    title: document.getElementById('profileTitle')?.value || '',
                    about: document.getElementById('profileAbout')?.value || '',
                    email: document.getElementById('profileEmail')?.value || '',
                    github: document.getElementById('profileGithub')?.value || '',
                    linkedin: document.getElementById('profileLinkedin')?.value || '',
                    education: document.getElementById('profileEducation')?.value || '',
                    image: document.getElementById('editProfileImage')?.getAttribute('src') || 'assets/IMG-20250923-WA0002.jpg'
                };

                writeStorage(STORAGE_KEYS.profile, profile);
                updateIndexContent();
                const successMessage = document.getElementById('saveMessage');
                if (successMessage) {
                    successMessage.textContent = 'Profile saved successfully.';
                }
            });
        }

        if (uploadInput) {
            uploadInput.addEventListener('change', function (event) {
                const file = event.target.files && event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (loadEvent) {
                    const profileImage = document.getElementById('editProfileImage');
                    if (profileImage) {
                        profileImage.src = loadEvent.target.result;
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }

    function getDefaultProjects() {
        return [
            {
                name: 'Smart Shopping Cart',
                description: 'An interactive modern e-commerce shopping platform featuring real-time cart manipulation, quantity controls, instant total & tax calculations, search filtering, and modular component breakdown.',
                tech: 'React.js, JavaScript (ES6+), CSS3, LocalStorage',
                category: 'frontend',
                github: 'https://github.com/shanmukhabs',
                badge: 'WEB APPLICATION',
                icon: '🛒'
            },
            {
                name: '3D Interactive Developer Portfolio',
                description: 'High-performance personal developer portfolio featuring 3D tilt micro-interactions, dark glassmorphism, dynamic GitHub API integration, and admin portal.',
                tech: 'JavaScript (ES6+), HTML5, CSS3, GitHub API',
                category: 'frontend',
                github: 'https://github.com/shanmukhabs',
                badge: 'PORTFOLIO',
                icon: '⚡'
            }
        ];
    }

    function getProjects() {
        const stored = readStorage(STORAGE_KEYS.projects, null);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            const hasCart = stored.some(p => p.name && p.name.toLowerCase().includes('cart'));
            if (!hasCart) {
                return getDefaultProjects();
            }
            return stored;
        }
        return getDefaultProjects();
    }

    function renderProjects() {
        const projectList = document.getElementById('adminProjects');
        if (!projectList) return;

        const projects = getProjects();
        projectList.innerHTML = '';

        if (!projects.length) {
            projectList.innerHTML = '<p class="empty-state">No projects added yet.</p>';
            return;
        }

        projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'project-card';
            item.innerHTML = `
                <h3>${project.name || 'Untitled Project'}</h3>
                <p>${project.description || ''}</p>
                <div class="project-meta">
                    <span>${project.tech || 'N/A'}</span>
                </div>
                <div class="project-actions">
                    <a href="${project.github || '#'}" target="_blank" rel="noreferrer">GitHub</a>
                    <button type="button" data-index="${index}" class="danger-btn remove-project-btn">Remove</button>
                </div>
            `;
            projectList.appendChild(item);
        });

        const removeButtons = document.querySelectorAll('.remove-project-btn');
        removeButtons.forEach((button) => {
            button.addEventListener('click', function () {
                const currentProjects = getProjects();
                const index = Number(button.getAttribute('data-index'));
                currentProjects.splice(index, 1);
                writeStorage(STORAGE_KEYS.projects, currentProjects);
                renderProjects();
                renderDashboardStats();
            });
        });
    }

    function renderDashboardStats() {
        const projectCount = document.getElementById('projectCount');
        const skillCount = document.getElementById('skillCount');
        const certificateCount = document.getElementById('certificateCount');

        if (projectCount) {
            projectCount.textContent = String(getProjects().length);
        }

        if (skillCount) {
            skillCount.textContent = String(getSkillEntries().length);
        }

        if (certificateCount) {
            certificateCount.textContent = String(getCertificationEntries().length);
        }
    }

    function initDashboardPage() {
        const projectForm = document.getElementById('projectForm');
        const dashboardProjectCount = document.getElementById('projectCount');

        if (dashboardProjectCount) {
            renderDashboardStats();
        }

        if (projectForm) {
            projectForm.addEventListener('submit', function (event) {
                event.preventDefault();
                const nextProject = {
                    name: document.getElementById('projectName')?.value || '',
                    description: document.getElementById('projectDescription')?.value || '',
                    tech: document.getElementById('projectTech')?.value || '',
                    github: document.getElementById('projectGithub')?.value || '#'
                };

                const projects = getProjects();
                projects.push(nextProject);
                writeStorage(STORAGE_KEYS.projects, projects);
                renderProjects();
                renderDashboardStats();
                projectForm.reset();
                closeProjectForm();
            });
        }

        renderProjects();
    }

    function openProjectForm() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    function closeProjectForm() {
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    function getSkillEntries() {
        const stored = readStorage(STORAGE_KEYS.skills, [
            'React.js', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Java', 'Spring Boot', 'MySQL', 'MongoDB', 'Git & GitHub'
        ]);
        return Array.isArray(stored) ? stored : [];
    }

    function getLearningEntries() {
        const stored = readStorage(STORAGE_KEYS.learning, [
            'Next.js & Server Components', 'Docker & Cloud Deployment', 'TypeScript for Web Systems', 'Microservices Architecture'
        ]);
        return Array.isArray(stored) ? stored : [];
    }

    function getCertificationEntries() {
        const stored = readStorage(STORAGE_KEYS.certifications, [
            'Provisional Diploma in Computer Science & Engineering (Bapuji Polytechnic)',
            'MongoDB Skill: Relational (SQL) to Document Model',
            'Spring Boot & Microservices (Infosys Springboard)',
            'Full Stack Web Development & Java (Abeyaantrix)'
        ]);
        return Array.isArray(stored) ? stored : [];
    }

    function renderCollection(containerId, entries, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        entries.forEach((entry, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'collection-row';
            wrapper.innerHTML = `
                <input type="text" value="${entry}" data-index="${index}" data-type="${type}" aria-label="${type} item" />
                <button type="button" data-index="${index}" data-type="${type}" class="remove-item-btn">Remove</button>
            `;
            container.appendChild(wrapper);
        });

        const inputs = container.querySelectorAll('input');
        inputs.forEach((input) => {
            input.addEventListener('input', function () {
                const index = Number(input.getAttribute('data-index'));
                const type = input.getAttribute('data-type');
                const items = readCollection(type);
                items[index] = input.value.trim() || 'Item';
                writeCollection(type, items);
            });
        });

        const removeButtons = container.querySelectorAll('.remove-item-btn');
        removeButtons.forEach((button) => {
            button.addEventListener('click', function () {
                const index = Number(button.getAttribute('data-index'));
                const type = button.getAttribute('data-type');
                const items = readCollection(type);
                items.splice(index, 1);
                writeCollection(type, items);
                renderCollection(containerId, items, type);
                renderDashboardStats();
            });
        });
    }

    function readCollection(type) {
        if (type === 'skill') return getSkillEntries();
        if (type === 'learning') return getLearningEntries();
        if (type === 'certification') return getCertificationEntries();
        return [];
    }

    function writeCollection(type, items) {
        const keyMap = {
            skill: STORAGE_KEYS.skills,
            learning: STORAGE_KEYS.learning,
            certification: STORAGE_KEYS.certifications
        };
        writeStorage(keyMap[type], items);
        renderDashboardStats();
    }

    function addSkill() {
        const skills = getSkillEntries();
        skills.push('New Skill');
        writeStorage(STORAGE_KEYS.skills, skills);
        renderCollection('skillsEditor', skills, 'skill');
        renderDashboardStats();
    }

    function addLearning() {
        const learning = getLearningEntries();
        learning.push('New Learning Item');
        writeStorage(STORAGE_KEYS.learning, learning);
        renderCollection('learningEditor', learning, 'learning');
        renderDashboardStats();
    }

    function addCertification() {
        const certifications = getCertificationEntries();
        certifications.push('New Certification');
        writeStorage(STORAGE_KEYS.certifications, certifications);
        renderCollection('certificationEditor', certifications, 'certification');
        renderDashboardStats();
    }

    function resetProfile() {
        const defaultProfile = getDefaultProfile();
        writeStorage(STORAGE_KEYS.profile, defaultProfile);
        populateProfileForm();
        updateIndexContent();
        const successMessage = document.getElementById('saveMessage');
        if (successMessage) {
            successMessage.textContent = 'Profile reset to the default values.';
        }
    }

    function initProfileEditors() {
        const skillsEditor = document.getElementById('skillsEditor');
        const learningEditor = document.getElementById('learningEditor');
        const certificationEditor = document.getElementById('certificationEditor');

        if (skillsEditor) {
            renderCollection('skillsEditor', getSkillEntries(), 'skill');
        }

        if (learningEditor) {
            renderCollection('learningEditor', getLearningEntries(), 'learning');
        }

        if (certificationEditor) {
            renderCollection('certificationEditor', getCertificationEntries(), 'certification');
        }
    }

    /* =====================================================
       INDEX PAGE ENGINE: SKILLS, PROJECTS, GITHUB & 3D INTERACTION
    ===================================================== */
    const SKILLS_DATA = [
        // Frontend
        { name: 'React.js', category: 'frontend', categoryLabel: 'Frontend', level: 90, icon: '⚛️', desc: 'Component Architecture, Hooks, State Management & Virtual DOM' },
        { name: 'JavaScript (ES6+)', category: 'frontend', categoryLabel: 'Frontend', level: 92, icon: '⚡', desc: 'Asynchronous Programming, Closures, DOM & Event Handling' },
        { name: 'HTML5 & Semantic Web', category: 'frontend', categoryLabel: 'Frontend', level: 95, icon: '🌐', desc: 'Modern Semantic Architecture, Web Accessibility & SEO Standards' },
        { name: 'CSS3 & Modern Styling', category: 'frontend', categoryLabel: 'Frontend', level: 92, icon: '🎨', desc: 'Flexbox, CSS Grid, Glassmorphism, Micro-interactions & Keyframes' },
        { name: 'Responsive UI Design', category: 'frontend', categoryLabel: 'Frontend', level: 90, icon: '📱', desc: 'Fluid Layouts, Mobile-First Paradigm & Cross-Device Optimization' },

        // Backend
        { name: 'Spring Boot', category: 'backend', categoryLabel: 'Backend', level: 85, icon: '🍃', desc: 'REST Controllers, Dependency Injection, Spring MVC & Microservices' },
        { name: 'RESTful API Engineering', category: 'backend', categoryLabel: 'Backend', level: 88, icon: '🔗', desc: 'Clean Endpoint Architecture, JSON Serialization & HTTP Protocols' },
        { name: 'Node.js & Express Concepts', category: 'backend', categoryLabel: 'Backend', level: 78, icon: '🟩', desc: 'Event-driven I/O, Express Routing & Middleware Architectures' },

        // Database
        { name: 'MySQL', category: 'database', categoryLabel: 'Database', level: 88, icon: '🐬', desc: 'Relational Schema Design, Complex Joins, Indexing & Query Tuning' },
        { name: 'Relational Modeling', category: 'database', categoryLabel: 'Database', level: 86, icon: '🗄️', desc: 'Database Normalization (1NF—3NF), ER Diagrams & Constraint Rules' },
        { name: 'JPA & Hibernate', category: 'database', categoryLabel: 'Database', level: 82, icon: '💾', desc: 'ORM Entity Mapping, Repository Patterns & Transaction Management' },

        // Tools & DevOps
        { name: 'Git & GitHub', category: 'tools', categoryLabel: 'Tools & DevOps', level: 92, icon: '🐙', desc: 'Distributed Version Control, Branching, Rebase & Pull Requests' },
        { name: 'VS Code & Developer Tools', category: 'tools', categoryLabel: 'Tools & DevOps', level: 95, icon: '💻', desc: 'Code Debugging, Extensions, Workspace Configs & Linting' }
    ];

    const LEARNING_DATA = [
        { title: 'Next.js & Server Components', icon: '⚡' },
        { title: 'Cloud Infrastructure & Docker', icon: '🐳' },
        { title: 'TypeScript for Scalable Web', icon: '📘' },
        { title: 'Microservices & Event-Driven Systems', icon: '🧩' },
        { title: 'System Architecture & Design Patterns', icon: '📐' }
    ];

    const CERTIFICATIONS_DATA = [
        {
            title: 'Provisional Diploma Certificate — Computer Science & Engineering',
            issuer: 'Dept. of Technical Education, Karnataka / Bapuji Polytechnic Davangere',
            date: 'June 2025',
            image: 'assets/diploma-certificate.jpg',
            icon: '🎓',
            summary: 'Completed 3-year technical Diploma course in Computer Science & Engineering (2023 — 2025) with First Class honours (66.9% / 7.44 CGPA). Roll No: 335CS22039. Digitally certified via DigiLocker.'
        },
        {
            title: 'MongoDB Skill: From Relational Model (SQL) to MongoDB Document Model',
            issuer: 'MongoDB, Inc.',
            date: 'May 19, 2026',
            image: 'assets/certificate-mongodb.jpg',
            icon: '🍃',
            verifyUrl: 'https://www.credly.com/badges/92048ff7-d631-481e-a74b-216cba03ca51',
            summary: 'Official proof of completion awarded by Raghu Viswanathan (VP, Education at MongoDB) demonstrating mastery in transforming SQL relational models into scalable MongoDB document models.'
        },
        {
            title: 'Spring Boot & Microservices Training',
            issuer: 'Infosys Springboard',
            date: 'September 2024',
            image: 'assets/certificate-infosys.jpg',
            icon: '🏆',
            summary: 'Comprehensive hands-on training covering Spring Boot architecture, REST APIs, Spring Data JPA, and secure microservices design.'
        },
        {
            title: 'Full Stack Web Development & Java',
            issuer: 'Abeyaantrix SoftLab',
            date: 'August 2024',
            image: 'assets/certificate-abeyaantrix.jpg',
            icon: '📜',
            summary: 'Rigorous engineering training in Core Java, OOP architectures, modern frontend development, and MySQL relational database management.'
        }
    ];

    const GITHUB_LANG_COLORS = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Python': '#3572A5',
        'C++': '#f34b7d',
        'C': '#555555',
        'Shell': '#89e051',
        'SQL': '#e38c00',
        'Default': '#00ff87'
    };

    const FALLBACK_GITHUB_REPOS = [
        {
            name: 'smart-shopping-cart',
            html_url: 'https://github.com/shanmukhabs',
            description: 'Interactive e-commerce shopping platform featuring real-time cart manipulation, quantity controls, automatic total calculation, and responsive modern UI.',
            language: 'JavaScript',
            stargazers_count: 5,
            forks_count: 2,
            updated_at: '2026-10-18T10:30:00Z'
        },
        {
            name: 'shanmukha-developer-portfolio',
            html_url: 'https://github.com/shanmukhabs',
            description: 'Modern 3D personal developer portfolio with Obsidian & Lime aesthetics, canvas particle animations, GitHub API repository explorer, and admin suite.',
            language: 'JavaScript',
            stargazers_count: 12,
            forks_count: 3,
            updated_at: '2026-10-25T11:00:00Z'
        },
        {
            name: 'java-dsa-algorithms',
            html_url: 'https://github.com/shanmukhabs',
            description: 'Comprehensive repository of Data Structures and Algorithms solutions in Java, covering trees, graphs, dynamic programming, and sorting paradigms.',
            language: 'Java',
            stargazers_count: 6,
            forks_count: 1,
            updated_at: '2026-08-30T09:40:00Z'
        },
        {
            name: 'spring-boot-rest-api-service',
            html_url: 'https://github.com/shanmukhabs',
            description: 'Scalable RESTful microservice backend with Spring Data JPA, JWT authentication, MySQL transactional schema, and Swagger documentation.',
            language: 'Java',
            stargazers_count: 7,
            forks_count: 2,
            updated_at: '2026-09-14T16:20:00Z'
        },
        {
            name: 'react-ui-micro-interactions',
            html_url: 'https://github.com/shanmukhabs',
            description: 'Collection of modern interactive UI components featuring glassmorphism, 3D tilt effects, animated loaders, and responsive cards.',
            language: 'JavaScript',
            stargazers_count: 9,
            forks_count: 2,
            updated_at: '2026-10-05T18:05:00Z'
        }
    ];

    let cachedGithubRepos = [];

    function renderIndexProjects(filter = 'all') {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        const allProjects = getProjects();
        const filtered = filter === 'all'
            ? allProjects
            : allProjects.filter(p => (p.category || 'fullstack').toLowerCase() === filter.toLowerCase());

        container.innerHTML = '';

        if (!filtered.length) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No projects found in this category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel tilt-card stagger-card';
            card.style.animationDelay = `${index * 0.08}s`;

            const techTags = (project.tech || 'Modern Web Stack')
                .split(',')
                .map(t => `<span class="tech-tag">${t.trim()}</span>`)
                .join('');

            const badgeText = project.badge || (project.category === 'frontend' ? 'WEB APPLICATION' : 'FULL STACK');
            const icon = project.icon || (project.category === 'frontend' ? '🛒' : '🏥');

            card.innerHTML = `
                <div class="card-glass-sheen"></div>
                <div class="project-card-header">
                    <span class="project-tag">${badgeText}</span>
                    <span class="project-icon-top">${icon}</span>
                </div>
                <h3 class="project-title">${project.name || 'Featured Project'}</h3>
                <p class="project-desc">${project.description || 'High-performance web software crafted with modern engineering standards.'}</p>
                <div class="project-tech-stack">
                    ${techTags}
                </div>
                <div class="project-actions">
                    <a href="${project.github || 'https://github.com/shanmukhabs'}" target="_blank" rel="noopener noreferrer" class="btn btn-lime btn-sm">
                        <span>Explore Code</span>
                        <span>↗</span>
                    </a>
                    <a href="#contact" class="btn btn-glass btn-sm">
                        <span>Details / Demo</span>
                    </a>
                </div>
            `;

            container.appendChild(card);
            attachTiltEffect(card);
        });
    }

    function initProjectFilterTabs() {
        const buttons = document.querySelectorAll('.project-filter-controls .proj-filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter') || 'all';
                renderIndexProjects(filter);
            });
        });
    }

    function renderIndexSkills(filter = 'all') {
        const container = document.getElementById('skillsContainer');
        if (!container) return;

        const filtered = filter === 'all'
            ? SKILLS_DATA
            : SKILLS_DATA.filter(s => s.category === filter);

        container.innerHTML = '';

        filtered.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = 'skill-card glass-panel tilt-card stagger-card';
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
                <div class="card-glass-sheen"></div>
                <div class="skill-card-top">
                    <div class="skill-icon-wrap">${skill.icon}</div>
                    <span class="skill-category-badge">${skill.categoryLabel}</span>
                </div>
                <h3 class="skill-name">${skill.name}</h3>
                <div class="skill-progress-wrap">
                    <div class="skill-progress-info">
                        <span>Proficiency</span>
                        <span class="skill-pct-val">${skill.level}%</span>
                    </div>
                    <div class="skill-progress-bar-bg">
                        <div class="skill-progress-fill" style="width: 0%;" data-target-width="${skill.level}%"></div>
                    </div>
                </div>
                <p class="skill-desc-text">${skill.desc}</p>
            `;

            container.appendChild(card);
            attachTiltEffect(card);
        });

        // Animate the progress bars filling up sequentially
        setTimeout(() => {
            const fills = container.querySelectorAll('.skill-progress-fill');
            fills.forEach((fill, idx) => {
                setTimeout(() => {
                    fill.style.width = fill.getAttribute('data-target-width') || '85%';
                }, idx * 35);
            });
        }, 60);
    }

    function initSkillsFilterTabs() {
        const tabs = document.querySelectorAll('.skills-filter-tabs .filter-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.getAttribute('data-filter') || 'all';
                renderIndexSkills(filter);
            });
        });
    }

    function renderIndexLearning() {
        const container = document.getElementById('learningContainer');
        if (!container) return;

        container.innerHTML = '';
        LEARNING_DATA.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'learning-card stagger-card';
            card.style.animationDelay = `${index * 0.06}s`;
            card.innerHTML = `
                <span class="learning-icon" style="font-size: 1.3rem;">${item.icon}</span>
                <span>${item.title}</span>
            `;
            container.appendChild(card);
        });
    }

    function renderIndexCertifications() {
        const container = document.getElementById('certificationsContainer');
        if (!container) return;

        container.innerHTML = '';
        CERTIFICATIONS_DATA.forEach((cert, index) => {
            const card = document.createElement('div');
            card.className = 'cert-card glass-panel tilt-card stagger-card';
            card.style.animationDelay = `${index * 0.08}s`;
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="card-glass-sheen"></div>
                <div class="cert-icon">${cert.icon}</div>
                <div class="cert-details" style="flex: 1;">
                    <h4>${cert.title}</h4>
                    <p>${cert.issuer} • ${cert.date}</p>
                    <span class="cert-summary" style="display: block; margin-top: 4px; font-size: 0.84rem; color: var(--text-muted);">${cert.summary}</span>
                </div>
                <button type="button" class="btn btn-outline-lime btn-sm view-cert-btn" style="pointer-events: none;">
                    <span>View</span>
                </button>
            `;

            card.addEventListener('click', () => {
                openCertificateModal(cert);
            });

            container.appendChild(card);
            attachTiltEffect(card);
        });
    }

    function openCertificateModal(cert) {
        const modal = document.getElementById('certificateModal');
        const modalTitle = document.getElementById('certModalTitle');
        const modalIssuer = document.getElementById('certModalIssuer');
        const modalDate = document.getElementById('certModalDate');
        const modalImg = document.getElementById('certModalImage');
        const modalIcon = document.getElementById('certModalIcon');
        const verifyBtn = document.getElementById('certModalVerifyBtn');
        const downloadBtn = document.getElementById('certModalDownloadBtn');

        if (!modal) return;

        if (modalTitle) modalTitle.textContent = cert.title;
        if (modalIssuer) modalIssuer.textContent = cert.issuer;
        if (modalDate) modalDate.textContent = cert.date;
        if (modalImg) modalImg.src = cert.image;
        if (modalIcon && cert.icon) modalIcon.textContent = cert.icon;

        if (verifyBtn) {
            if (cert.verifyUrl) {
                verifyBtn.href = cert.verifyUrl;
                verifyBtn.style.display = 'inline-flex';
            } else {
                verifyBtn.style.display = 'none';
            }
        }

        if (downloadBtn) {
            downloadBtn.href = cert.image;
            downloadBtn.download = `${cert.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`;
        }

        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }

    async function fetchGitHubRepos(username = 'shanmukhabs') {
        const container = document.getElementById('githubReposContainer');
        if (!container) return;

        // Display animated loading spinner with pulse effect and dynamic dots
        container.innerHTML = `
            <div class="loading-spinner-wrap">
                <div class="glow-spinner"></div>
                <p class="fetching-text">Fetching repositories from GitHub API<span class="animated-dots">...</span></p>
                <span class="fetching-subtext">Querying public repositories for @${username}</span>
            </div>
        `;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const [userRes, reposRes] = await Promise.allSettled([
                fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { signal: controller.signal }),
                fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`, { signal: controller.signal })
            ]);

            clearTimeout(timeoutId);

            // Update user profile mini-card if available
            if (userRes.status === 'fulfilled' && userRes.value.ok) {
                const userData = await userRes.value.json();
                updateGitHubUserBar(userData);
            }

            // Handle Repositories
            if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
                const reposData = await reposRes.value.json();
                if (Array.isArray(reposData) && reposData.length > 0) {
                    cachedGithubRepos = reposData;
                    renderGitHubRepos(cachedGithubRepos);
                    return;
                }
            }

            // Fallback for empty or rate-limited API
            cachedGithubRepos = FALLBACK_GITHUB_REPOS;
            renderGitHubRepos(cachedGithubRepos);

        } catch (error) {
            console.warn('GitHub API fetch failed, displaying fallback repositories:', error);
            cachedGithubRepos = FALLBACK_GITHUB_REPOS;
            renderGitHubRepos(cachedGithubRepos);
        }
    }

    function updateGitHubUserBar(userData) {
        const ghUserName = document.getElementById('ghUserName');
        const ghUserBio = document.getElementById('ghUserBio');
        const ghReposCount = document.getElementById('ghReposCount');
        const ghFollowersCount = document.getElementById('ghFollowersCount');
        const ghProfileUrl = document.getElementById('ghProfileUrl');
        const ghAvatar = document.getElementById('ghUserAvatar');

        if (ghUserName && userData.name) ghUserName.textContent = userData.name;
        if (ghUserBio && userData.bio) ghUserBio.textContent = userData.bio;
        if (ghReposCount && typeof userData.public_repos !== 'undefined') ghReposCount.textContent = `${userData.public_repos}+`;
        if (ghFollowersCount && typeof userData.followers !== 'undefined') ghFollowersCount.textContent = `${userData.followers} Followers`;
        if (ghProfileUrl && userData.html_url) {
            ghProfileUrl.href = userData.html_url;
            ghProfileUrl.innerHTML = `<span>${userData.html_url.replace('https://', '')} ↗</span>`;
        }
        if (ghAvatar && userData.avatar_url) ghAvatar.src = userData.avatar_url;
    }

    function renderGitHubRepos(repos) {
        const container = document.getElementById('githubReposContainer');
        if (!container) return;

        container.innerHTML = '';

        if (!repos || !repos.length) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <p>No repositories found matching your criteria.</p>
                </div>
            `;
            return;
        }

        repos.forEach((repo, index) => {
            const card = document.createElement('div');
            card.className = 'repo-card glass-panel tilt-card stagger-card';
            card.style.animationDelay = `${index * 0.07}s`;

            const lang = repo.language || 'Code';
            const langColor = GITHUB_LANG_COLORS[lang] || GITHUB_LANG_COLORS['Default'];
            const stars = repo.stargazers_count ?? 0;
            const forks = repo.forks_count ?? 0;
            const desc = repo.description || 'Full stack repository showcasing modern engineering patterns and clean code principles.';

            card.innerHTML = `
                <div class="card-glass-sheen"></div>
                <div class="repo-card-header">
                    <h3 class="repo-card-title">
                        <span class="repo-link-icon">📁</span>
                        <span>${repo.name}</span>
                    </h3>
                    <span class="repo-visibility">Public</span>
                </div>
                <p class="repo-card-desc">${desc}</p>
                <div class="repo-card-footer">
                    <div class="repo-lang-meta">
                        <span class="lang-color-dot" style="background-color: ${langColor};"></span>
                        <span>${lang}</span>
                    </div>
                    <div class="repo-stats-meta">
                        <span>⭐ ${stars}</span>
                        <span>🍴 ${forks}</span>
                    </div>
                </div>
                <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
                    <a href="${repo.html_url || 'https://github.com/shanmukhabs'}" target="_blank" rel="noopener noreferrer" class="repo-card-external-btn">
                        <span>Explore Repository</span>
                        <span>↗</span>
                    </a>
                </div>
            `;

            container.appendChild(card);
            attachTiltEffect(card);
        });
    }

    function initGitHubExplorer() {
        const lookupBtn = document.getElementById('lookupRepoBtn');
        const resetBtn = document.getElementById('resetGithubBtn');
        const userInput = document.getElementById('githubUsernameInput');
        const filterKeywordInput = document.getElementById('filterRepoKeyword');

        if (lookupBtn && userInput) {
            lookupBtn.addEventListener('click', () => {
                const user = userInput.value.trim() || 'shanmukhabs';
                fetchGitHubRepos(user);
            });

            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const user = userInput.value.trim() || 'shanmukhabs';
                    fetchGitHubRepos(user);
                }
            });
        }

        if (resetBtn && userInput) {
            resetBtn.addEventListener('click', () => {
                userInput.value = 'shanmukhabs';
                if (filterKeywordInput) filterKeywordInput.value = '';
                fetchGitHubRepos('shanmukhabs');
            });
        }

        if (filterKeywordInput) {
            filterKeywordInput.addEventListener('input', (e) => {
                const q = e.target.value.toLowerCase().trim();
                if (!q) {
                    renderGitHubRepos(cachedGithubRepos);
                    return;
                }
                const filtered = cachedGithubRepos.filter(r => {
                    const name = (r.name || '').toLowerCase();
                    const desc = (r.description || '').toLowerCase();
                    const lang = (r.language || '').toLowerCase();
                    return name.includes(q) || desc.includes(q) || lang.includes(q);
                });
                renderGitHubRepos(filtered);
            });
        }

        // Initial fetch on page load
        fetchGitHubRepos('shanmukhabs');
    }

    /* 3D Tilt Card Physics */
    function attachTiltEffect(card) {
        if (!card) return;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    }

    function initTiltCards() {
        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach(card => attachTiltEffect(card));
    }

    /* Canvas Particles Background */
    function initParticleCanvas() {
        const canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particleCount = Math.min(Math.floor(width / 22), 65);
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 2 + 1,
                color: Math.random() > 0.4 ? 'rgba(0, 255, 135, ' : 'rgba(56, 189, 248, '
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.6)';
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 255, 135, ${0.15 * (1 - dist / 110)})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        requestAnimationFrame(draw);
    }

    /* Scroll Progress Indicator & Back to Top */
    function initScrollProgress() {
        const progressBar = document.getElementById('scrollProgress');
        const backToTopBtn = document.getElementById('backToTopBtn');

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

            if (progressBar) {
                progressBar.style.width = `${pct}%`;
            }

            if (backToTopBtn) {
                if (scrollTop > 400) {
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.pointerEvents = 'auto';
                } else {
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.pointerEvents = 'none';
                }
            }
        });

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    /* Modals & Popups */
    function initModals() {
        const resumeModal = document.getElementById('resumeModal');
        const navResumeBtn = document.getElementById('navResumeBtn');
        const heroResumeBtn = document.getElementById('openResumeHeroBtn');
        const resumeModalOpenBtn = document.getElementById('openResumeModalBtn');
        const closeResumeBtn = document.getElementById('closeResumeModalBtn');

        function openResume() {
            if (resumeModal) {
                resumeModal.classList.add('show');
                resumeModal.setAttribute('aria-hidden', 'false');
            }
        }

        function closeResume() {
            if (resumeModal) {
                resumeModal.classList.remove('show');
                resumeModal.setAttribute('aria-hidden', 'true');
            }
        }

        if (navResumeBtn) navResumeBtn.addEventListener('click', openResume);
        if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);
        if (resumeModalOpenBtn) resumeModalOpenBtn.addEventListener('click', openResume);
        if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResume);

        if (resumeModal) {
            resumeModal.addEventListener('click', (e) => {
                if (e.target === resumeModal) closeResume();
            });
        }

        // Certificate modal close
        const certModal = document.getElementById('certificateModal');
        const closeCertBtn = document.getElementById('closeCertModalBtn');

        function closeCert() {
            if (certModal) {
                certModal.classList.remove('show');
                certModal.setAttribute('aria-hidden', 'true');
            }
        }

        if (closeCertBtn) closeCertBtn.addEventListener('click', closeCert);
        if (certModal) {
            certModal.addEventListener('click', (e) => {
                if (e.target === certModal) closeCert();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeResume();
                closeCert();
            }
        });
    }

    /* Toast Helper */
    function showToast(message, icon = '✓') {
        const toast = document.getElementById('toastNotification');
        const toastMsg = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        if (!toast) return;
        if (toastMsg) toastMsg.textContent = message;
        if (toastIcon) toastIcon.textContent = icon;

        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    /* Contact Form & Clipboard */
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const copyEmailBtn = document.getElementById('copyEmailBtn');
        const formFeedback = document.getElementById('formFeedback');

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = contactForm.querySelector('button[type="submit"]');

                const name    = (document.getElementById('senderName')?.value || '').trim();
                const email   = (document.getElementById('senderEmail')?.value || '').trim();
                const subject = (document.getElementById('senderSubject')?.value || '').trim();
                const message = (document.getElementById('senderMessage')?.value || '').trim();

                if (!name || !email || !subject || !message) {
                    if (formFeedback) {
                        formFeedback.textContent = 'Please fill in all required fields.';
                        formFeedback.style.color = '#ff6b6b';
                    }
                    return;
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>📨 Opening Email Client...</span>';
                }

                // Build mailto: link — opens system email client pre-filled
                const body = `Hi Shanmukha,\n\nMy name is ${name} (${email}).\n\n${message}\n\n— ${name}`;
                const mailtoLink = `mailto:sshanmukhabas@gmail.com`
                    + `?subject=${encodeURIComponent(subject)}`
                    + `&body=${encodeURIComponent(body)}`;

                window.location.href = mailtoLink;

                setTimeout(() => {
                    if (formFeedback) {
                        formFeedback.textContent = '✅ Your email client has been opened with the message pre-filled. Just hit Send!';
                        formFeedback.style.color = 'var(--accent-lime)';
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>🚀 Send Message</span>';
                    }
                    contactForm.reset();
                    showToast('Email client opened! Click Send to deliver your message.');
                }, 800);
            });
        }

        if (copyEmailBtn) {
            copyEmailBtn.addEventListener('click', async () => {
                const email = 'sshanmukhabas@gmail.com';
                try {
                    await navigator.clipboard.writeText(email);
                    showToast('Email address copied to clipboard!', '📋');
                } catch (err) {
                    showToast('Copied sshanmukhabas@gmail.com', '📋');
                }
            });
        }
    }

    /* Mobile Navigation */
    function initMobileNav() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                menuToggle.setAttribute('aria-expanded', String(!isExpanded));
                navMenu.classList.toggle('open');
            });

            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('open');
                    menuToggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }

    /* Hero Typewriter Animation */
    function initHeroTyping() {
        const heroTitle = document.getElementById('heroTitle');
        if (!heroTitle) return;

        const roles = [
            'Full Stack Developer',
            'Java & Spring Boot Engineer',
            'React & Modern UI Architect',
            'Information Science @ BIET'
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentRole = roles[roleIndex];

            if (isDeleting) {
                heroTitle.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                heroTitle.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 90;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 400;
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    function initIndexPage() {
        updateIndexContent();
        renderIndexSkills('all');
        initSkillsFilterTabs();
        renderIndexProjects('all');
        initProjectFilterTabs();
        renderIndexLearning();
        renderIndexCertifications();
        initGitHubExplorer();
        initTiltCards();
        initParticleCanvas();
        initScrollProgress();
        initModals();
        initContactForm();
        initMobileNav();
        initHeroTyping();

        const viewDiplomaCertBtn = document.getElementById('viewDiplomaCertBtn');
        if (viewDiplomaCertBtn) {
            viewDiplomaCertBtn.addEventListener('click', () => {
                const diplomaCert = CERTIFICATIONS_DATA.find(c => c.image.includes('diploma'));
                if (diplomaCert) openCertificateModal(diplomaCert);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        const pathname = window.location.pathname.split('/').pop() || 'index.html';
        const currentPage = pathname.replace(/\.[^/.]+$/, '') || 'index';

        if (currentPage === 'dashboard') {
            import('./firebase-auth.js').then(({ auth, adminEmail, onAuthStateChanged, signOut }) => {
                if (!auth) {
                    window.location.replace('login.html');
                    return;
                }
                onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        window.location.replace('login.html');
                        return;
                    }
                    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
                        await signOut(auth);
                        window.location.replace('index.html');
                        return;
                    }
                    initDashboardPage();
                });
            }).catch((error) => {
                console.error('Could not initialize dashboard authentication:', error);
                window.location.replace('login.html');
            });
        }

        if (currentPage === 'profile') {
            import('./firebase-auth.js').then(({ auth, adminEmail, onAuthStateChanged, signOut }) => {
                if (!auth) {
                    window.location.replace('login.html');
                    return;
                }
                onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        window.location.replace('login.html');
                        return;
                    }
                    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
                        await signOut(auth);
                        window.location.replace('index.html');
                        return;
                    }
                    initProfilePage();
                    initProfileEditors();
                });
            }).catch((error) => {
                console.error('Could not initialize profile authentication:', error);
                window.location.replace('login.html');
            });
        }

        if (currentPage === 'index' || currentPage === '') {
            initIndexPage();
        }

        window.logout = logout;
        window.openProjectForm = openProjectForm;
        window.closeProjectForm = closeProjectForm;
        window.addSkill = addSkill;
        window.addLearning = addLearning;
        window.addCertification = addCertification;
        window.resetProfile = resetProfile;
    });
})();

