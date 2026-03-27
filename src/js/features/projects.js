let current;
let currentHighlight = "projects";
let columnCount = 3;
let projects, projectsArr, rowCount, lastRowStart;


const scrollProjects = () => {

    const scrollContainer = document.querySelector("#🫆lsdev-projects__grid");
    const scrollContainerRect = scrollContainer.getBoundingClientRect();

    let scrollJumped = false;
    let ticking = false;

    /**
     * ✨ Get First Visible Project Row
     */
    const getVisibleRowIndex = () =>
        projectsArr.findIndex((project) => {
            const { top, bottom } = project.getBoundingClientRect();
            return bottom > scrollContainer.getBoundingClientRect().top && top < window.innerHeight;
        });

    /**
     * ✨ Adjust Navigation Position
     */
    const adjustNavPosition = () => {
        
        const lastRowProject = projectsArr[lastRowStart];
        const { top: lastRowTop } = lastRowProject.getBoundingClientRect();
        
        if (lastRowTop > scrollContainer.getBoundingClientRect().top + 106){
            return;
        } 

        const container = document.querySelector("#🫆lsdev-stage > main > div > div:nth-child(3)");
        const firstChild = container.children[0];
        
        if (firstChild) {
            firstChild.insertAdjacentElement("afterend", mainNav);
        }

        if (!scrollJumped) {
            scrollJumped = true;
        }
    };

    /**
     * ✨ Handle Scroll Behavior (Now Allows Page Scrolling After Container)
     */

    let scrolledPast = false;
    let scrolledPastAbout = false;

    const handleScroll = (event) => {

        if (event.target.closest("#🫆lsdev-projects__menu")) return;
            
        const { deltaY } = event;
        const scrollContainerRect = scrollContainer.getBoundingClientRect();

        const projectExample = document.querySelector('.🎨lsdev-projects__project');
        const projectExampleHeight = projectExample.getBoundingClientRect().height;

        const atBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 10;
        const atTop = scrollContainerRect.top <= window.innerHeight;

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

            if (mainNav.getBoundingClientRect().top >= scrollContainerRect.top - projectExampleHeight) {
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
                            moveCaret(firstLink.closest("li"), true);
                        }
                        return;
                    }

                    const currentlyVisible = [...visibleSections];
                    if (!currentlyVisible.length) return;

                    // pick the lowest visible section in the viewport
                    let activeSection = currentlyVisible.sort((a, b) => {
                        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
                    })[currentlyVisible.length - 1];

                    // OR, if you want the most visible one instead, use this instead:
                    /*
                    let activeSection = currentlyVisible
                        .map(section => ({
                            section,
                            visibleHeight: getVisibleHeight(section)
                        }))
                        .sort((a, b) => b.visibleHeight - a.visibleHeight)[0]?.section;
                    */

                    if (!activeSection) return;

                    const activeLink = linkMap.get(activeSection.id);
                    if (!activeLink) return;

                    moveCaret(activeLink.closest("li"), true);
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

const filterProjects = () => {
    
    nav.addEventListener("click", (event) => {
        const a = event.target.closest("a");
        if (!a) return;

        const filter = a.dataset.filter;

        const container = document.querySelector("#🫆scroll-container > div");

        // Step 1: Lock container height
        const currentHeight = container.offsetHeight;
        //container.style.height = `${currentHeight}px`;

        // Step 2: Hide all projects
        projects.forEach(project => {
            project.style.display = "none";
        });

        // Step 3: Show only filtered ones
        setTimeout(() => {
            projects.forEach(project => {
                const filters = project.dataset.filterby.split(",");

                if (filter === "all" || filters.includes(filter)) {
                    project.style.display = "flex";
                }
            });

            // Update grid math
            projectsArr = Array.from(document.querySelectorAll(".🎨lsdev-projects__project")).filter(
                project => window.getComputedStyle(project).display !== "none"
            );
            rowCount = Math.ceil(projectsArr.length / columnCount);
            lastRowStart = (rowCount - 1) * columnCount;

            // Step 4: Unlock height after transition
            setTimeout(() => {
                container.style.height = "";
            }, 300);
        }, 0);
    });
};
