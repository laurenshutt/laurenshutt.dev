let current;
let currentHighlight = "projects";
let columnCount = 3;
let projects, projectsArr, rowCount, lastRowStart;


const projectsObj = {
    "Carbon Colab Webpage":[
        "Virginia Tech",
        "img/projects/carbon-colab.webp",
        [
            "developed",
            "aem"
        ],
        [
            "img/projects/carbon-colab-mobile.png",
            "img/projects/carbon-colab-tablet.png"
        ]],
    "AI Summit Webpage":[
        "Virginia Tech",
        "img/projects/ai-summit.png",
        ["developed","aem"]],
    "Phase, Inc. Website":[
        "Phase, Inc.",
        "img/projects/phase.png",
        ["designed-developed","surreal"]],
    "Institute for the Study of Eastern Christianity Website":[
        "The Catholic University of America",
        "img/projects/isec.png",
        ["designed-developed","wp"]],
    "G.K. Chesterton Entertainment Website": [
        "G.K. Chesterton Entertainment",
        "img/projects/gkce.png",
        ["designed-developed"]],
    "From Pests to Protein": [
        "CALS Magazine",
        "img/projects/pests.png",
        ["developed"]],
    "Ukrainian Catholic Crisis Media Center Website":[
        "Ukrainian Greek Catholic Archeparchy of Philadelphia",
        "img/projects/uccmc.png",
        ["wp"]],
    "School of Theology and Religious Studies Website":[
        "The Catholic University of America",
        "img/projects/trs.png",
        ["designed-developed","cascade"]],
    "School of Theology and Religious Studies Rollover Classes App":[
        "The Catholic University of America",
        "img/projects/rollover-app.png",
        ["designed-developed","cascade"]],
    "Google Scholar Plugin":[
        "Virginia Tech",
        "img/projects/scholar.png",
        ["developed"]],
    "CALS Strategic Plan Website":[
        "Virginia Tech",
        "img/projects/strategic-plan.png",
        ["developed"]],
    "CALS Sequicentennial Webpage":[
        "Virginia Tech",
        "img/projects/sesqui.png",
        ["designed-developed","aem"]],
    "CALS Digital Yearbook":[
        "Virginia Tech",
        "img/projects/digital-yearbook.png",
        ["designed-developed","aem"]],
    "CALS Homepage":[
        "Virginia Tech",
        "img/projects/cals-homepage.png",
        ["designed-developed","aem"]],
    "CPES Conference Website":[
        "Virginia Tech",
        "img/projects/cpes-conference.png",
        ["designed-developed"]]
};


export const scrollProjects = () => {

    const scrollContainer = document.getElementById("🫆lsdev-projects__grid-container");

    /**
     * ✨ Get First Visible Project Row
     */
    const getVisibleRowIndex = () =>
        projectsArr.findIndex((project) => {
            const { top, bottom } = project.getBoundingClientRect();
            return bottom > scrollContainer.getBoundingClientRect().top && top < window.innerHeight;
        });

    /**
     * ✨ Handle Scroll Behavior (Now Allows Page Scrolling After Container)
     */

    let scrolledPast = false;

    const handleScroll = (event) => {

        if (event.target.closest("#🫆lsdev-projects__menu")) return;
            
        const { deltaY } = event;
        const scrollContainerRect = scrollContainer.getBoundingClientRect();

        const projectExample = document.querySelector('.🎨lsdev-projects__project');
        const projectExampleHeight = projectExample.getBoundingClientRect().height;

        const atBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 10;

        //If the user is scrolling down and the container hasn’t reached the bottom
        if (deltaY > 0 && !atBottom) { 

            //Continue scrolling the container
            event.preventDefault();
            scrollContainer.scrollTop += deltaY;
        } 
        //If the user is scrolling up, and the bottom of the container is below the visible window
        else if (deltaY < 0 && scrollContainerRect.bottom <= window.innerHeight && scrollContainerRect.top >= 0 ) { 
        
            event.preventDefault();
            scrollContainer.scrollTop += deltaY;

            if (nav.getBoundingClientRect().top >= scrollContainerRect.top - projectExampleHeight) {
                scrollJumped = false;
            }
        }
        else {
            
            if (scrolledPast === false){

                scrolledPast = true;

                const sections = [
                    "🫆lsdev-window--projects",
                    "🫆lsdev-window--about",
                    "🫆lsdev-window--reviews",
                    "🫆lsdev-contact"
                ].map(id => document.getElementById(id)).filter(Boolean);

                const menuLinks = [...document.querySelectorAll('.🎨lsdev-nav a[href^="#"]')];

                const linkMap = new Map(
                    menuLinks.map(link => [
                        decodeURIComponent(link.getAttribute("href").slice(1)),
                        link
                    ])
                );

                const visibleSections = new Set();

                const getVisibleHeight = el => {
                    const rect = el.getBoundingClientRect();
                    const visibleTop = Math.max(rect.top, 0);
                    const visibleBottom = Math.min(rect.bottom, window.innerHeight);
                    return Math.max(0, visibleBottom - visibleTop);
                };

                const updateActiveSection = () => {
                    
                    const scrollTop = window.scrollY || window.pageYOffset;

                    // top-of-page fallback
                    if (scrollTop <= 10) {
                        const firstLink = linkMap.get("🫆lsdev-window--projects");
                        if (firstLink) {
                            //moveCaret(firstLink.closest("li"), true);
                        }
                        return;
                    }

                    const currentlyVisible = [...visibleSections];
                    if (!currentlyVisible.length) return;

                    // pick the lowest visible section in the viewport
                    let activeSection = currentlyVisible.sort((a, b) => {
                        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
                    })[currentlyVisible.length - 1];

                    if (!activeSection) return;

                    const activeLink = linkMap.get(activeSection.id);
                    if (!activeLink) return;

                    //moveCaret(activeLink.closest("li"), true);
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            visibleSections.add(entry.target);
                        } else {
                            visibleSections.delete(entry.target);
                        }
                    });

                    updateActiveSection();
                }, {
                    threshold: 0
                });

                sections.forEach(section => observer.observe(section));

                window.addEventListener("scroll", updateActiveSection, { passive: true });
                window.addEventListener("resize", updateActiveSection, { passive: true });
                document.addEventListener("wheel", updateActiveSection, { passive: true });
                scrollContainer.addEventListener("scroll", updateActiveSection, { passive: true });
            }
        }
    };

    document.addEventListener("wheel", handleScroll, { passive: false });
};

export const filterProjects = () => {

    const nav = document.getElementById("🫆lsdev-projects__menu");
    const projects = document.querySelectorAll(".🎨lsdev-projects__project");
    
    nav.addEventListener("click", (event) => {
        
        const button = event.target.closest("button");

        if (!button) return;

        const filter = button.dataset.filter;

        // Step 2: Hide all projects
        projects.forEach(project => {
            project.classList.add("is-filtered");
        });

        // Step 3: Show only filtered ones
        setTimeout(() => {
            
            projects.forEach(project => {
                
                const filters = project.dataset.filterby.split(",");

                if (filter === "all" || filters.includes(filter)) {
                    project.style.display = "";
                    project.classList.remove("is-filtered");
                }
            });

            // Update grid math
            /*projectsArr = Array.from(document.querySelectorAll(".🎨lsdev-projects__project")).filter(
                project => window.getComputedStyle(project).display !== "none"
            );
            rowCount = Math.ceil(projectsArr.length / columnCount);
            lastRowStart = (rowCount - 1) * columnCount;

            // Step 4: Unlock height after transition
            setTimeout(() => {
                container.style.height = "";
            }, 300);*/
        }, 0);
    });
};
