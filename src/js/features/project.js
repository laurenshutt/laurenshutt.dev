export const project = () => {
    
    document
        .querySelectorAll(".🎨lsdev-projects__project")
        .forEach(el => {
            el.addEventListener("click", e => {
                console.log("clicked", e.currentTarget);
            });
        });
}