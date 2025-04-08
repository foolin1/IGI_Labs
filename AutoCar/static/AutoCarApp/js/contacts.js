document.addEventListener("DOMContentLoaded", function () {
    const contactsTable = document.getElementById("contacts-table");
    const tbody = contactsTable.querySelector("tbody");
    const preloader = document.getElementById("preloader");
    const addContactButton = document.getElementById("add-contact");
    const contactForm = document.getElementById("contact-form");
    const addContactForm = document.getElementById("add-contact-form");
    const filterInput = document.getElementById("filter-input");
    const filterButton = document.getElementById("filter-button");
    const removeFilterButton = document.getElementById("remove-filter-button");
    const rewardButton = document.getElementById("reward-button");
    const rewardOutput = document.getElementById("reward-output");
    const customizeCheckbox = document.getElementById("customize-page-checkbox");
    const customizationControls = document.getElementById("customization-controls");
    const fontSizeSelector = document.getElementById("font-size-selector");
    const textColorInput = document.getElementById("text-color-input");
    const backgroundColorInput = document.getElementById("background-color-input");

    let sortDirection = 1; 
    let sortColumn = null;

    let contacts = [];
    let currentPage = 1;
    const itemsPerPage = 3;

    function loadContacts() {
        preloader.style.display = "block";
        fetch("/autocar/get_contacts")
            .then(response => response.json())
            .then(data => {
                contacts = data;
                renderTable();
                preloader.style.display = "none";
            });
    }

    function renderTable() {
        console.log(contacts)
        tbody.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const paginatedContacts = contacts.slice(start, end);

        if (sortColumn) {
            paginatedContacts.sort((a, b) => {
                if (a[sortColumn] < b[sortColumn]) return -1 * sortDirection;
                if (a[sortColumn] > b[sortColumn]) return 1 * sortDirection;
                return 0;
            });
        }

        for (const contact of paginatedContacts) {
            const row = document.createElement("tr");
            row.dataset.id = contact.id;
            console.log(contact.photo)
            row.innerHTML = `
                <td>${contact.name}</td>
                <td><img src="http://127.0.0.1:8000/media/${contact.photo}" alt="${contact.name}" style="width: 50px; height: 50px;"></td>
                <td>${contact.job_description}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
                <td><input type="checkbox" class="select-contact"></td>
            `;

            tbody.appendChild(row);

            row.addEventListener("click", () => {
                const infoDiv = document.getElementById("selected-contact-info");
                infoDiv.innerHTML = `
                    <h3>${contact.name}</h3>
                    <p>Описание: ${contact.job_description}</p>
                    <p>Телефон: ${contact.phone}</p>
                    <p>Email: ${contact.email}</p>
                `;
            });
        }
        renderPagination();
    }

    function applyFilter() {
        const filterValue = filterInput.value.toLowerCase();
        contacts = contacts.filter(contact =>
            Object.values(contact).some(value =>
                value.toString().toLowerCase().includes(filterValue)
            )
        );
        currentPage = 1; 
        renderTable();
    }

    function removeFilter() {
        sortColumn = null;
        filterInput.value = ""; 
        loadContacts()
        renderTable();
    }

    function rewardSelected() {
        const selectedContacts = Array.from(
            document.querySelectorAll(".select-contact:checked")
        ).map(checkbox => {
            const row = checkbox.closest("tr");
            return row.querySelector("td").textContent;
        });

        if (selectedContacts.length === 0) {
            rewardOutput.textContent = "Никто не выбран для премирования.";
        } else {
            rewardOutput.textContent = `Премированы: ${selectedContacts.join(", ")}.`;
        }
    }

    function addSorting() {
        const headers = contactsTable.querySelectorAll("thead th");
        const rows = contactsTable.querySelectorAll("tbody tr");
    
        headers.forEach((header, index) => {
            header.addEventListener("click", () => {
                const column = index; 
                const isSameColumn = header.classList.contains("sorted");
    
                if (isSameColumn) {
                    sortDirection *= -1; 
                } else {
                    headers.forEach(h => h.classList.remove("sorted"));
                    header.classList.add("sorted");
                    sortDirection = 1;
                }
    
                
                sortColumn = column;
                renderTable();
    
                
                headers.forEach(h => h.classList.remove("asc", "desc"));
                header.classList.add(sortDirection === 1 ? "asc" : "desc");
    
                
                rows.forEach(row => {
                    row.querySelectorAll("td").forEach(cell => cell.classList.remove("highlight"));
                });
    
                
                rows.forEach(row => {
                    row.querySelectorAll("td")[column].classList.add("highlight");
                });
            });
        });
    }
    

    function renderPagination() {
        const paginationControls = document.getElementById("pagination-controls");
        paginationControls.innerHTML = "";

        const totalPages = Math.ceil(contacts.length / itemsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = i === currentPage ? "active" : "";
            button.addEventListener("click", () => {
                currentPage = i;
                renderTable();
            });
            paginationControls.appendChild(button);
        }
    }

    
    document.getElementById("add-contact-btn").addEventListener("click", () => {
        addContactForm.style.display = "block";
    });

    
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        console.log(JSON.stringify(contactForm))

        
        const phone = formData.get("phone");
        const name = formData.get("name");
        const email = formData.get("email");
        const photo = formData.get("photo")
        const jobDescription = formData.get("job_description")

        
        if (!phone || phone.trim() === "") {
            alert("Поле 'Телефон' обязательно для заполнения.");
            return;
        }

        if (!name || name.trim() === "") {
            alert("Поле 'ФИО' обязательно для заполнения.");
            return;
        }

        if (!email || email.trim() === "") {
            alert("Поле 'Электронная почта' обязательно для заполнения.");
            return;
        }

        if (!jobDescription || jobDescription.trim() === "") {
            alert("Поле 'Описание выполняемых работ' обязательно для заполнения.");
            return;
        }

        
        if (!photo || photo.size === 0) {
            alert("Необходимо загрузить фотографию.");
            return;
        }


        if (!phone || !name)
        console.log(phone, name, email)
        if (!validatePhone(phone)) {
            alert("Номер телефона невалиден.");
            return;
        }

        
        const url = formData.get("url");
        console.log(url)
        if (!validateURL(url)) {
            alert("URL невалиден.");
            return;
        }

        preloader.style.display = "block";

        
        fetch("/autocar/add_contact", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then(response => response.json())
            .then(data => {
                preloader.style.display = "none";
                if (data.success) {
                    alert("Контакт успешно добавлен.");
                    loadContacts(); 
                    contactForm.reset();
                    addContactForm.style.display = "none";
                } else {
                    alert("Ошибка при добавлении контакта.");
                }
            })
            .catch(error => {
                preloader.style.display = "none";
                alert("Ошибка сети.");
            });
    });

    function validatePhone(phone) {
        const phoneRegex = /^(8|\+375)[\d\s\(\)-]{9,}$/
        return phoneRegex.test(phone);
    }

    function validateURL(url) {
        const urlRegex = /^(http:\/\/|https:\/\/).*(\.php|\.html)$/;
        return urlRegex.test(url);
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(
                        cookie.substring(name.length + 1)
                    );
                    break;
                }
            }
        }
        return cookieValue;
    }


    filterButton.addEventListener("click", applyFilter);
    rewardButton.addEventListener("click", rewardSelected);
    removeFilterButton.addEventListener("click", removeFilter);

    loadContacts();
    addSorting();

    
    customizeCheckbox.addEventListener("change", function () {
        if (customizeCheckbox.checked) {
            customizationControls.style.display = "block";
        } else {
            customizationControls.style.display = "none";
            resetCustomization();
        }
    });

    
    fontSizeSelector.addEventListener("change", function () {
        document.body.style.fontSize = fontSizeSelector.value;
    });

    
    textColorInput.addEventListener("input", function () {
        document.body.style.color = textColorInput.value;
    });

    
    backgroundColorInput.addEventListener("input", function () {
        document.body.style.backgroundColor = backgroundColorInput.value;
    });

    
    function resetCustomization() {
        document.body.style.fontSize = "";
        document.body.style.color = "";
        document.body.style.backgroundColor = "";
        fontSizeSelector.value = "16px";
        textColorInput.value = "#000000";
        backgroundColorInput.value = "#ffffff";
    }
});
