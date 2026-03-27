import "./vendors/convForm.js";

import { 
    mainNavItems,
    windows,
    contactEls
} from './dom.js';

export const setElementIndices = () => {
    
    mainNavItems.forEach((li, i) => {
        li.style.setProperty('--i', i);
    });

    windows.forEach((windowEl, i) => {
        windowEl.style.setProperty('--i', i);
    });

    contactEls.forEach(function(el, i){
        el.style.setProperty("--i", i);
    });    

    return mainNavItems.length - 1;
};

export const addProjects = (() => {

    const container = document.querySelector("#🫆lsdev-projects__grid");

    const projectsObj = {
        "Carbon Colab Webpage":[
            "Virginia Tech",
            "img/projects/carbon-colab.png",
            ["developed","aem"]],
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

    container.innerHTML = Object
        .entries(projectsObj)
        .map(([title, [client, imgSrc, filterBy]]) => `
            <div class="🎨lsdev-projects__project" data-filterBy="${filterBy}">
                <div class="🎨lsdev-project_client-info">
                    <span>
                        ${client}
                    </span>
                    <span></span>
                </div>
                <p>
                    ${title}
                </p>
                <div class="🎨lsdev-project_img-bg">
                    <img src="${imgSrc}" alt="${title}" loading="eager" fetchpriority="high">
                </div>
            </div>
        `).join('');

    document.querySelector("#🫆lsdev-projects__grid").insertAdjacentHTML("beforeend", "<div class='🎨lsdev-window__status-bar'>Status</div>");

    /*projects = document.querySelectorAll(".🎨lsdev-projects__project");
    projectsArr = Array.from(document.querySelectorAll(".🎨lsdev-projects__project"));
    rowCount = Math.ceil(projectsArr.length / columnCount);
    lastRowStart = (rowCount - 1) * columnCount;*/
})();

export const populateSkills = (() => {
    
    const skills = {
        "HTML":         100,
        "CSS":          100,
        "jQuery":       90,
        "JavaScript":   80,
        "PHP":          50,
        "SQL":          50,
        "XP":           100,
        "CP":           90,
        "HP":           90
    }

    const skillKeys = Object.keys(skills);
    const numSkills = skillKeys.length;
    const splitIndex = Math.ceil(numSkills / 2);

    skillKeys.forEach(function(skill, index){

        const percent = Math.ceil(skills[skill] / 10);
        const $column = index < splitIndex 
            ? $("#🫆lsdev-skills__col-1")
            : $("#🫆lsdev-skills__col-2");
        const $skillNameContainer = $column.find(".🎨lsdev-skills__skill");
        const $barContainer = $column.find(".🎨lsdev-skills__skill-meter-container");
        const $bar = $("<div class='🎨lsdev-skills__skill-meter'></div>").appendTo($barContainer);

        $skillNameContainer.append(`<h3>${skill}</h3>`);

        for (let i = 0; i < 10; i++) {

            const $tenth = $("<div class='🎨lsdev-skill-meter__segment'></div>").appendTo($bar);

            if (i < percent){
                $tenth.addClass("is-filled");
            }
        }
    });
})();

export const catbotWindow = (() => {  
    const convform = $("#🫆lsdev-catbot-window__chat").convform();
})(); 

    

        
  