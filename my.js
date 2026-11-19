document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("popup");
    const openButton = document.getElementById("openForm");
    const closeButton = document.getElementById("closeForm");
    const form = document.getElementById("contactForm");
    const message = document.getElementById("formMessage");
    const submitButton = document.getElementById("submitButton");

    const formUrl = "https://api.slapform.com/9JqZnoHJ1";
    const storageKey = "contactFormData";
    let formIsOpen = false;

    function showMessage(text, type) {
        message.textContent = text;
        message.className = "form-message " + type;
    }

    function openPopup(changeHistory) {
        if (formIsOpen) {
            return;
        }

        popup.classList.add("active");
        popup.setAttribute("aria-hidden", "false");
        formIsOpen = true;

        if (changeHistory) {
            history.pushState({ contactForm: true }, "", "#contact");
        }

        const firstInput = form.querySelector("input");
        firstInput.focus();
    }

    function closePopup(changeHistory) {
        if (!formIsOpen) {
            return;
        }

        popup.classList.remove("active");
        popup.setAttribute("aria-hidden", "true");
        formIsOpen = false;

        if (changeHistory && location.hash === "#contact") {
            history.back();
        }
    }

    function saveForm() {
        const data = {};

        form.querySelectorAll("input, textarea").forEach(function (field) {
            if (field.type === "checkbox") {
                data[field.name] = field.checked;
            } else {
                data[field.name] = field.value;
            }
        });

        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    function restoreForm() {
        const savedData = localStorage.getItem(storageKey);

        if (!savedData) {
            return;
        }

        try {
            const data = JSON.parse(savedData);

            form.querySelectorAll("input, textarea").forEach(function (field) {
                if (Object.prototype.hasOwnProperty.call(data, field.name)) {
                    if (field.type === "checkbox") {
                        field.checked = data[field.name];
                    } else {
                        field.value = data[field.name];
                    }
                }
            });
        } catch (error) {
            localStorage.removeItem(storageKey);
        }
    }

    openButton.addEventListener("click", function () {
        openPopup(true);
    });

    closeButton.addEventListener("click", function () {
        closePopup(true);
    });

    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            closePopup(true);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && formIsOpen) {
            closePopup(true);
        }
    });

    window.addEventListener("popstate", function () {
        if (formIsOpen) {
            closePopup(false);
        }
    });

    form.addEventListener("input", saveForm);
    form.addEventListener("change", saveForm);

    restoreForm();

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Отправка...";
        showMessage("", "");

        const formData = new FormData(form);
        const formDataObject = Object.fromEntries(formData.entries());

        fetch(formUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formDataObject)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Ошибка отправки формы");
                }

                return response.text();
            })
            .then(function () {
                form.reset();
                localStorage.removeItem(storageKey);
                showMessage("Сообщение успешно отправлено!", "success");
            })
            .catch(function () {
                showMessage(
                    "Не удалось отправить сообщение. Попробуйте ещё раз.",
                    "error"
                );
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = "Отправить";
            });
    });

    if (location.hash === "#contact") {
        openPopup(false);
    }
});
