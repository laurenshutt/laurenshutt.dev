export const contactForm = () => {

    document.querySelectorAll("fieldset").forEach(function(fieldset){
        fieldset.style.transitionDelay = "0s";
    });

    const form = document.querySelector("form");
    const submitButton = document.querySelector(".🎨lsdev-button[type='submit']");
    const errorMsg = document.querySelector(".🎨lsdev-contact__error");

    // `required` only rejects a genuinely empty value, so a field holding nothing but spaces
    // passes natively. Treat whitespace-only as empty for anything required.
    const isBlank = (input) =>
        input.required && typeof input.value === "string" && input.value.trim() === "";

    // Work out every invalid fieldset in one pass, then apply the class to all of them together.
    // Marking them per input let a valid field strip the marker that a previous invalid field —
    // or the radio group — had just set on the same fieldset.
    const validateForm = () => {

        const invalidFieldsets = new Set();

        form.querySelectorAll("input, textarea, select").forEach(input => {

            if (input.type === "radio") return; // radios are checked as groups below

            if (!isBlank(input) && input.checkValidity()) return;

            const fieldset = input.closest("fieldset");

            if (fieldset) invalidFieldsets.add(fieldset);
        });

        const radioNames = new Set();

        form.querySelectorAll("input[type='radio']").forEach(radio => radioNames.add(radio.name));

        radioNames.forEach(name => {

            const group = form.querySelectorAll(`input[type="radio"][name="${name}"]`);

            if (Array.from(group).some(radio => radio.checked)) return;

            const fieldset = group[0]?.closest("fieldset");

            if (fieldset) invalidFieldsets.add(fieldset);
        });

        form.querySelectorAll("fieldset").forEach(fieldset => {
            fieldset.classList.toggle("has-invalid", invalidFieldsets.has(fieldset));
        });

        errorMsg.style.opacity = invalidFieldsets.size ? "1" : "0";

        return invalidFieldsets.size === 0;
    };

    // Re-check as the visitor fixes things, but only once they have tried to submit. Bound once
    // here rather than inside the submit handler, which stacked a fresh listener every attempt.
    ["focusout", "change"].forEach(type => {

        form.addEventListener(type, () => {
            if (form.classList.contains("was-submitted")) validateForm();
        });
    });

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        form.classList.add("was-submitted");

        setTimeout(function(){

            if (!validateForm()) return;

            // Built before the fields are disabled — disabled controls are omitted from FormData.
            const formData = new FormData(form);

            form.querySelectorAll("input, textarea, select, button").forEach(input => {
                input.disabled = true;
            });

            submitButton.classList.add("is-sending");
            submitButton.disabled = true;
            submitButton.innerHTML = "Message sending";

            submitButton.addEventListener("mouseleave", () => {
                submitButton.classList.add("is-idle");
            });

            fetch('https://formsubmit.co/ajax/dae31ce907c2e0bb6d4f029f67ece4c7', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                submitButton.classList.remove("is-sending");
                submitButton.innerHTML = "Sent!";
                console.log(data);
            })
            .catch(err => console.log(err));
        },300);
    });

    const textarea = document.querySelector(".🎨lsdev-contact textarea");
    
    const autoResize = () => {
        textarea.style.height = "0px";
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    document.querySelectorAll(".🎨lsdev-contact__message-option").forEach(function(button){
        
        button.addEventListener("click",function(e){
            
            e.preventDefault();
            
            textarea.value = e.currentTarget.value;
            
            document
                .querySelectorAll(".🎨lsdev-contact__message-option.is-selected")
                .forEach((selected) => selected !== button && selected.classList.remove("is-selected"));
            
                button.classList.toggle("is-selected");
            
            if (!button.classList.contains("is-selected")){
                
                button.classList.add("is-toggled");

                function removeToggle() {
                    button.blur();
                    button.classList.remove("is-toggled");
                }

                button.addEventListener("mouseout", removeToggle, { once: true });
                button.addEventListener("click", removeToggle, { once: true });
            }
            autoResize();
        });
    });

    textarea.addEventListener("input", function(){

        const textarea = document.querySelector("textarea");
        const isEmpty = textarea.value.trim() === "";

        if (isEmpty){
            document.querySelectorAll(".🎨lsdev-contact__message-option").forEach(function(button){
                button.classList.remove("is-selected");
            });
        }

        autoResize();
    });
}