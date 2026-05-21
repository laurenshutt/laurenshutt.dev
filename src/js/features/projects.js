import {
    createMouseTracker
} from "../hud/mouse-coords.js";

export const scrollProjects = () => {

    const scrollContainer = document.getElementById("🫆lsdev-projects__grid-container");
    const tracker = createMouseTracker();

    /**
     * ✨ Handle Scroll Behavior (Now Allows Page Scrolling After Container)
     */

    let scrolledPast = false;

    const handleScroll = (event) => {

        if (document.querySelector(".🎨lsdev-window.is-maximized")) return;

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
            tracker.setExtraScroll(scrollContainer.scrollTop);
        } 
        //If the user is scrolling up, and the bottom of the container is below the visible window
        else if (deltaY < 0 && scrollContainerRect.bottom <= window.innerHeight && scrollContainerRect.top >= 0 ) { 
        
            event.preventDefault();
            scrollContainer.scrollTop += deltaY;
            tracker.setExtraScroll(scrollContainer.scrollTop);

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

                const updateActiveSection = () => {
                    
                    const scrollTop = window.scrollY || window.pageYOffset;

                    // top-of-page fallback
                    if (scrollTop <= 10 && window.innerWidth > 992) {
                        return;
                    }

                    const currentlyVisible = [...visibleSections];
                    
                    // pick the lowest visible section in the viewport
                    let activeSection = currentlyVisible.sort((a, b) => {
                        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
                    })[currentlyVisible.length - 1];

                    if (!activeSection) return;

                    const activeLink = linkMap.get(activeSection.id);
                    if (!activeLink) return;
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
        }, 0);
    });
};
