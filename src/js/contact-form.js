export const contactForm = () => {

    document.querySelectorAll("fieldset").forEach(function(fieldset){
        fieldset.style.transitionDelay = "0s";
    });

    const form = document.querySelector("form");

    form.addEventListener("submit", (e) => {

        e.preventDefault();

        form.querySelectorAll(".has-invalid")
            .forEach(f => f.classList.remove("has-invalid"));

        form.classList.add("was-submitted");

        let isInvalid = false;

        const checkInputValidity = (input) => {
            
            if (!input.checkValidity()) {
                input.closest("fieldset")?.classList.add("has-invalid");
                isInvalid = true;
            }
            else {
                input.closest("fieldset")?.classList.remove("has-invalid");
            }
        }

        const checkRadioButtons = () => {
            
            const radios = new Set();

            document.querySelectorAll("input[type='radio']").forEach(function(button){
                radios.add(button.name);
            });

            radios.forEach(name => {

                const group = form.querySelectorAll(`input[type="radio"][name="${name}"]`);

                const isChecked = Array.from(group).some(r => r.checked);

                if (!isChecked) {
                    group[0]?.closest("fieldset")?.classList.add("has-invalid");
                    isInvalid = true;
                }
            });
        }

        setTimeout(function(){
            
            form.querySelectorAll("input, textarea, select").forEach(input => {
                checkInputValidity(input);
                checkRadioButtons();
            });

            if (isInvalid){
                document.querySelector(".🎨lsdev-contact__col p").style.opacity = "1";
            } 

            const invalidFieldsets = document.querySelectorAll("fieldset.has-invalid");

            invalidFieldsets.forEach(function(fieldset){

                fieldset.addEventListener("focusout", () => {
                    
                    const input = fieldset.querySelector("textarea, input");
                    
                    checkInputValidity(input);

                    if (fieldset.querySelector("input[type='radio']") != null){
                        checkRadioButtons();
                    }
                });
            });



            isInvalid = false;

            // AJAX only runs if valid
            /*$.ajax({
                method: 'POST',
                url: 'https://formsubmit.co/ajax/dae31ce907c2e0bb6d4f029f67ece4c7',
                dataType: 'json',
                accepts: 'application/json',
                data: $(form).serialize(),
                success: (data) => console.log(data),
                error: (err) => console.log(err)
            });*/
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