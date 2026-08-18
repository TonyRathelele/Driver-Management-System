document.addEventListener("DOMContentLoaded", function () {
    const menuLinks = document.querySelectorAll(".sidebar-nav-link");

    // Set active link on page load based on current URL
    menuLinks.forEach(link => {
        if (link.href === window.location.href) {
            menuLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        }
    });

    // Change active class when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener("click", function () {
            menuLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const dashboardWrapper = document.getElementById("dashboardWrapper");
    const sidebarToggle = document.getElementById("sidebarToggle");
    const submenuLinks = document.querySelectorAll("[data-submenu]");
    const userDropdownToggle = document.getElementById("userDropdownToggle");
    const userDropdownMenu = document.getElementById("userDropdownMenu");
    const notificationDropdownToggle = document.getElementById("notificationDropdownToggle");
    const notificationDropdownMenu = document.getElementById("notificationDropdownMenu");

    // Function to set initial sidebar state based on screen size
    function setInitialSidebarState() {
        if (window.innerWidth <= 768) {
            dashboardWrapper.classList.add("collapsed");
        } else {
            dashboardWrapper.classList.remove("collapsed");
        }
    }

    // Toggle sidebar on button click
    sidebarToggle.addEventListener("click", function () {
        dashboardWrapper.classList.toggle("collapsed");
    });

    // Toggle submenu visibility
    submenuLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            if (dashboardWrapper.classList.contains('collapsed') && window.innerWidth > 768) {
                return;
            }

            const submenuId = this.dataset.submenu;
            const submenu = document.getElementById(submenuId);

            submenuLinks.forEach(otherLink => {
                const otherSubmenuId = otherLink.dataset.submenu;
                const otherSubmenu = document.getElementById(otherSubmenuId);
                if (otherSubmenu && otherSubmenu !== submenu && otherSubmenu.classList.contains('show')) {
                    otherSubmenu.classList.remove('show');
                    otherLink.classList.remove('expanded');
                    otherSubmenu.style.maxHeight = '0';
                }
            });

            if (submenu) {
                submenu.classList.toggle("show");
                this.classList.toggle("expanded");
                if (submenu.classList.contains('show')) {
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                } else {
                    submenu.style.maxHeight = '0';
                }
            }
        });
    });

    // User Dropdown Functionality
    userDropdownToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        if (notificationDropdownMenu.classList.contains("show")) {
            notificationDropdownMenu.classList.remove("show");
        }
        userDropdownMenu.classList.toggle("show");
    });

    // Notification Dropdown Functionality
    notificationDropdownToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        if (userDropdownMenu.classList.contains("show")) {
            userDropdownMenu.classList.remove("show");
        }
        notificationDropdownMenu.classList.toggle("show");
    });

    // Close dropdowns if clicked outside
    document.addEventListener("click", function (event) {
        if (!userDropdownMenu.contains(event.target) && !userDropdownToggle.contains(event.target)) {
            userDropdownMenu.classList.remove("show");
        }
        if (!notificationDropdownMenu.contains(event.target) && !notificationDropdownToggle.contains(event.target)) {
            notificationDropdownMenu.classList.remove("show");
        }
    });

    // Tab functionality - preserved exactly as is for compatibility
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');

            const targetTabId = button.dataset.tabTarget;
            const targetPane = document.querySelector(targetTabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Warehouse Search functionality
    const warehouseSearch = document.getElementById('warehouseSearch');
    const warehouseTable = document.getElementById('warehouseTable');

    if (warehouseSearch && warehouseTable) {
        warehouseSearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = warehouseTable.querySelectorAll('tbody tr');
            let hasMatches = false;

            rows.forEach(row => {
                // Use class selectors for more reliability
                const nameCell = row.querySelector('.warehouse-name');
                const addressCell = row.querySelector('.warehouse-address');

                if (nameCell && addressCell) {
                    const name = nameCell.textContent.toLowerCase();
                    const address = addressCell.textContent.toLowerCase();

                    const matches = name.includes(searchTerm) || address.includes(searchTerm);
                    row.style.display = matches ? '' : 'none';

                    if (matches) hasMatches = true;
                }
            });

            // Handle no results
            const tbody = warehouseTable.querySelector('tbody');
            let noResultsRow = document.getElementById('noResultsRow');

            if (!hasMatches && rows.length > 0) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noResultsRow';
                    noResultsRow.innerHTML = '<td colspan="5" class="text-center py-4">No matching warehouses found</td>';
                    tbody.appendChild(noResultsRow);
                }
            } else if (noResultsRow) {
                noResultsRow.remove();
            }
        });
    }

    // Warehouse Vehicle Search Functionality
    const vehicleSearch = document.getElementById('warehouseVehicleSearch');
    const vehiclesTable = document.getElementById('warehouseVehicles');

    if (vehicleSearch && vehiclesTable) {
        vehicleSearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = vehiclesTable.querySelectorAll('tbody tr');
            let hasMatches = false;

            rows.forEach(row => {
                // Skip the "no vehicles" rows from search
                if (row.classList.contains('no-vehicles-row')) {
                    row.style.display = searchTerm === '' ? '' : 'none';
                    return;
                }

                const warehouseCell = row.querySelector('.warehouse-name');
                const makeCell = row.querySelector('.vehicle-make');
                const modelCell = row.querySelector('.vehicle-model');
                const licenseCell = row.querySelector('.vehicle-license');
                const driverCell = row.querySelector('.vehicle-driver');

                if (warehouseCell && makeCell && modelCell && licenseCell && driverCell) {
                    const warehouse = warehouseCell.textContent.toLowerCase();
                    const make = makeCell.textContent.toLowerCase();
                    const model = modelCell.textContent.toLowerCase();
                    const license = licenseCell.textContent.toLowerCase();
                    const driver = driverCell.textContent.toLowerCase();

                    const matches = warehouse.includes(searchTerm) ||
                        make.includes(searchTerm) ||
                        model.includes(searchTerm) ||
                        license.includes(searchTerm) ||
                        driver.includes(searchTerm);

                    row.style.display = matches ? '' : 'none';
                    if (matches) hasMatches = true;
                }
            });

            // Handle no results message
            const tbody = vehiclesTable.querySelector('tbody');
            let noResultsRow = document.getElementById('noVehicleResultsRow');

            if (!hasMatches && searchTerm !== '' && rows.length > 0) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noVehicleResultsRow';
                    noResultsRow.innerHTML = '<td colspan="6" class="text-center py-4">No matching vehicles found</td>';
                    tbody.appendChild(noResultsRow);
                }
            } else if (noResultsRow) {
                noResultsRow.remove();
            }

            // Show "no vehicles" rows when search is empty
            if (searchTerm === '') {
                const noVehiclesRows = vehiclesTable.querySelectorAll('.no-vehicles-row');
                noVehiclesRows.forEach(row => {
                    row.style.display = '';
                });
            }
        });
    }

    // Vacancy Search Functionality
    const vacancySearch = document.getElementById('vacancySearch');
    const vacanciesTable = document.getElementById('vacanciesTable');

    if (vacancySearch && vacanciesTable) {
        vacancySearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = vacanciesTable.querySelectorAll('tbody tr');
            let hasMatches = false;

            rows.forEach(row => {
                const nameCell = row.querySelector('.vacancy-name');
                const warehouseCell = row.querySelector('.warehouse-name');
                const descCell = row.querySelector('.vacancy-description');

                if (nameCell && warehouseCell && descCell) {
                    const name = nameCell.textContent.toLowerCase();
                    const warehouse = warehouseCell.textContent.toLowerCase();
                    const description = descCell.textContent.toLowerCase();

                    const matches = name.includes(searchTerm) ||
                        warehouse.includes(searchTerm) ||
                        description.includes(searchTerm);
                    row.style.display = matches ? '' : 'none';

                    if (matches) hasMatches = true;
                }
            });

            // Handle no results
            const tbody = vacanciesTable.querySelector('tbody');
            let noResultsRow = document.getElementById('noVacancyResultsRow');

            if (!hasMatches && searchTerm !== '' && rows.length > 0) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noVacancyResultsRow';
                    noResultsRow.innerHTML = '<td colspan="6" class="text-center py-4">No matching vacancies found</td>';
                    tbody.appendChild(noResultsRow);
                }
            } else if (noResultsRow) {
                noResultsRow.remove();
            }
        });
    }
    // Add Warehouse Modal Functionality 

    const modal = document.getElementById('addWarehouseModal');
    const addWarehouseBtn = document.getElementById('addWarehouseBtn');
    const addFirstWarehouseBtn = document.getElementById('addFirstWarehouseBtn');
    const closeBtn = document.querySelector('.close');


    const addCancelBtn = modal ? document.querySelector('.cancel') : null;

    function openModal() {
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }


    if (addWarehouseBtn) {
        addWarehouseBtn.addEventListener('click', openModal);
    }

    if (addFirstWarehouseBtn) {
        addFirstWarehouseBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (addCancelBtn) {
        addCancelBtn.addEventListener('click', closeModal)
    }


    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Edit Warehouse Modal Functionality
    const editModal = document.getElementById('editWarehouseModal');
    const editWarehouseBtns = document.querySelectorAll('.edit-warehouse-btn');
    const editCloseBtn = editModal ? editModal.querySelector('.close') : null;
    const editCancelBtn = editModal ? editModal.querySelector('.cancel') : null;

    function openEditModal(id, name, address) {
        document.getElementById('editWarehouseId').value = id;
        document.getElementById('editWarehouseName').value = name;
        document.getElementById('editWarehouseAddress').value = address;
        editModal.style.display = 'block';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
    }

    function cancelEdit() {
        editModal.style.display = 'none';
    }

    if (editWarehouseBtns) {
        editWarehouseBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const address = this.getAttribute('data-address');
                openEditModal(id, name, address);
            });
        });
    }

    if (editCloseBtn) {
        editCloseBtn.addEventListener('click', closeEditModal);
    }

    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', cancelEdit)
    }

    const deleteModal = document.getElementById('deleteWarehouseModal');
    const deleteWarehouseBtns = document.querySelectorAll('.delete-warehouse-btn');
    const deleteCloseBtn = deleteModal ? deleteModal.querySelector('.close') : null;
    const deleteCancelBtn = deleteModal ? deleteModal.querySelector('.cancel-btn') : null;

    function openDeleteModal(id, name) {
        document.getElementById('deleteWarehouseId').value = id;
        document.getElementById('deleteWarehouseName').textContent = name;
        deleteModal.style.display = 'block';
    }

    function closeDeleteModal() {
        deleteModal.style.display = 'none';
    }

    if (deleteWarehouseBtns) {
        deleteWarehouseBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                openDeleteModal(id, name);
            });
        });
    }

    if (deleteCloseBtn) {
        deleteCloseBtn.addEventListener('click', closeDeleteModal);
    }

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', closeDeleteModal);
    }

  

    // Add Vehicle Modal Functionality
    const addVehicleModal = document.getElementById('addVehicleModal');
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    const addVehicleEmptyStateBtn = document.querySelector('.empty-state button[data-target="#addVehicleModal"]');
    const addVehicleCloseBtn = addVehicleModal ? addVehicleModal.querySelector('.close') : null;
    const addVehicleCancelBtn = addVehicleModal ? addVehicleModal.querySelector('.cancel-btn') : null;

    function openAddVehicleModal() {
        addVehicleModal.style.display = 'block';
    }

    function closeAddVehicleModal() {
        addVehicleModal.style.display = 'none';
    }

    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', openAddVehicleModal);
    }

    if (addVehicleEmptyStateBtn) {
        addVehicleEmptyStateBtn.addEventListener('click', openAddVehicleModal);
    }

    if (addVehicleCloseBtn) {
        addVehicleCloseBtn.addEventListener('click', closeAddVehicleModal);
    }

    if (addVehicleCancelBtn) {
        addVehicleCancelBtn.addEventListener('click', closeAddVehicleModal);
    }


    // Edit Vehicle Modal
    const editVehicleModal = document.getElementById('editVehicleModal');
    const editVehicleBtns = document.querySelectorAll('.edit-vehicle-btn');
    const editVehicleCloseBtn = editVehicleModal?.querySelector('.close');
    const editVehicleCancelBtn = editVehicleModal?.querySelector('.cancel-btn');

    function openEditVehicleModal(id, make, model, license, warehouse, image) {
        document.getElementById('editVehicleId').value = id;
        document.getElementById('editMake').value = make;
        document.getElementById('editModel').value = model;
        document.getElementById('editLicensePlate').value = license;
        document.getElementById('editWarehouseId').value = warehouse;
        const currentImageSpan = document.getElementById('currentImage');
        const existingImageInput = document.getElementById('existingImagePath');
        if (image) {
            currentImageSpan.innerHTML = `<a href="/${image}" target="_blank">View Image</a>`;
            existingImageInput.value = image;
        } else {
            currentImageSpan.textContent = 'No image';
            existingImageInput.value = '';
        }
        editVehicleModal.style.display = 'block';
    }

    function closeEditVehicleModal() {
        editVehicleModal.style.display = 'none';
    }

    if (editVehicleBtns) {
        editVehicleBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const make = this.getAttribute('data-make');
                const model = this.getAttribute('data-model');
                const license = this.getAttribute('data-license');
                const warehouse = this.getAttribute('data-warehouse');
                const image = this.getAttribute('data-image');
                openEditVehicleModal(id, make, model, license, warehouse, image);
            });
        });
    }

    if (editVehicleCloseBtn) {
        editVehicleCloseBtn.addEventListener('click', closeEditVehicleModal);
    }

    if (editVehicleCancelBtn) {
        editVehicleCancelBtn.addEventListener('click', closeEditVehicleModal);
    }

    // Assign Driver Modal
    const assignDriverModal = document.getElementById('assignDriverModal');
    const assignDriverBtns = document.querySelectorAll('.assign-driver-btn');
    const assignDriverCloseBtn = assignDriverModal?.querySelector('.close');
    const assignDriverCancelBtn = assignDriverModal?.querySelector('.cancel-btn');

    function openAssignDriverModal(id) {
        document.getElementById('assignVehicleId').value = id;
        assignDriverModal.style.display = 'block';
    }

    function closeAssignDriverModal() {
        assignDriverModal.style.display = 'none';
    }

    if (assignDriverBtns) {
        assignDriverBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                openAssignDriverModal(id);
            });
        });
    }

    if (assignDriverCloseBtn) {
        assignDriverCloseBtn.addEventListener('click', closeAssignDriverModal);
    }

    if (assignDriverCancelBtn) {
        assignDriverCancelBtn.addEventListener('click', closeAssignDriverModal);
    }

    // Delete Vehicle Modal
    const deleteVehicleModal = document.getElementById('deleteVehicleModal');
    const deleteVehicleBtns = document.querySelectorAll('.delete-vehicle-btn');
    const deleteVehicleCloseBtn = deleteVehicleModal?.querySelector('.close');
    const deleteVehicleCancelBtn = deleteVehicleModal?.querySelector('.cancel-btn');

    function openDeleteVehicleModal(id, license) {
        document.getElementById('deleteVehicleId').value = id;
        document.getElementById('deleteVehicleLicense').textContent = license;
        deleteVehicleModal.style.display = 'block';
    }

    function closeDeleteVehicleModal() {
        deleteVehicleModal.style.display = 'none';
    }

    if (deleteVehicleBtns) {
        deleteVehicleBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const license = this.getAttribute('data-license');
                openDeleteVehicleModal(id, license);
            });
        });
    }

    if (deleteVehicleCloseBtn) {
        deleteVehicleCloseBtn.addEventListener('click', closeDeleteVehicleModal);
    }

    if (deleteVehicleCancelBtn) {
        deleteVehicleCancelBtn.addEventListener('click', closeDeleteVehicleModal);
    }

    // Add Vacancy Modal Functionality
    const addVacancyModal = document.getElementById('addVacancyModal');
    const addVacancyBtn = document.getElementById('addVacancyBtn');
    const addFirstVacancyBtn = document.getElementById('addFirstVacancyBtn');
    const addVacancyCloseBtn = addVacancyModal ? addVacancyModal.querySelector('.close') : null;
    const addVacancyCancelBtn = addVacancyModal ? addVacancyModal.querySelector('.cancel-btn') : null;

    function openAddVacancyModal() {
        addVacancyModal.style.display = 'block';
    }

    function closeAddVacancyModal() {
        addVacancyModal.style.display = 'none';
    }

    if (addVacancyBtn) {
        addVacancyBtn.addEventListener('click', openAddVacancyModal);
    }

    if (addFirstVacancyBtn) {
        addFirstVacancyBtn.addEventListener('click', openAddVacancyModal);
    }

    if (addVacancyCloseBtn) {
        addVacancyCloseBtn.addEventListener('click', closeAddVacancyModal);
    }

    if (addVacancyCancelBtn) {
        addVacancyCancelBtn.addEventListener('click', closeAddVacancyModal);
    }

    // Edit Vacancy Modal Functionality
    const editVacancyModal = document.getElementById('editVacancyModal');
    const editVacancyBtns = document.querySelectorAll('.edit-vacancy-btn');
    const editVacancyCloseBtn = editVacancyModal ? editVacancyModal.querySelector('.close') : null;
    const editVacancyCancelBtn = editVacancyModal ? editVacancyModal.querySelector('.cancel-btn') : null;

    function openEditVacancyModal(id, name, warehouseId, description) {
        document.getElementById('editVacancyId').value = id;
        document.getElementById('editVacancyName').value = name;
        document.getElementById('editVacancyWarehouse').value = warehouseId;
        document.getElementById('editVacancyDescription').value = description;
        editVacancyModal.style.display = 'block';
    }

    function closeEditVacancyModal() {
        editVacancyModal.style.display = 'none';
    }

    if (editVacancyBtns) {
        editVacancyBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                const warehouseId = this.getAttribute('data-warehouseid');
                const description = this.getAttribute('data-description');
                openEditVacancyModal(id, name, warehouseId, description);
            });
        });
    }

    if (editVacancyCloseBtn) {
        editVacancyCloseBtn.addEventListener('click', closeEditVacancyModal);
    }

    if (editVacancyCancelBtn) {
        editVacancyCancelBtn.addEventListener('click', closeEditVacancyModal);
    }

    // Delete Vacancy Modal Functionality
    const deleteVacancyModal = document.getElementById('deleteVacancyModal');
    const deleteVacancyBtns = document.querySelectorAll('.delete-vacancy-btn');
    const deleteVacancyCloseBtn = deleteVacancyModal ? deleteVacancyModal.querySelector('.close') : null;
    const deleteVacancyCancelBtn = deleteVacancyModal ? deleteVacancyModal.querySelector('.cancel-btn') : null;

    function openDeleteVacancyModal(id, name) {
        document.getElementById('deleteVacancyId').value = id;
        document.getElementById('deleteVacancyName').textContent = name;
        deleteVacancyModal.style.display = 'block';
    }

    function closeDeleteVacancyModal() {
        deleteVacancyModal.style.display = 'none';
    }

    if (deleteVacancyBtns) {
        deleteVacancyBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                openDeleteVacancyModal(id, name);
            });
        });
    }

    if (deleteVacancyCloseBtn) {
        deleteVacancyCloseBtn.addEventListener('click', closeDeleteVacancyModal);
    }

    if (deleteVacancyCancelBtn) {
        deleteVacancyCancelBtn.addEventListener('click', closeDeleteVacancyModal);
    }

    // Driver Search Functionality
    const driverSearch = document.getElementById('driverSearch');
    const driversTable = document.getElementById('driversTable');

    if (driverSearch && driversTable) {
        driverSearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            const rows = driversTable.querySelectorAll('tbody tr');
            let hasMatches = false;

            rows.forEach(row => {
                const nameCell = row.querySelector('.driver-name');
                const licenseCell = row.querySelector('.driver-license');
                const vehicleCell = row.querySelector('.driver-vehicle');

                if (nameCell && licenseCell && vehicleCell) {
                    const name = nameCell.textContent.toLowerCase();
                    const license = licenseCell.textContent.toLowerCase();
                    const vehicle = vehicleCell.textContent.toLowerCase();

                    const matches = name.includes(searchTerm) ||
                        license.includes(searchTerm) ||
                        vehicle.includes(searchTerm);
                    row.style.display = matches ? '' : 'none';

                    if (matches) hasMatches = true;
                }
            });

            // Handle no results
            const tbody = driversTable.querySelector('tbody');
            let noResultsRow = document.getElementById('noDriverResultsRow');

            if (!hasMatches && searchTerm !== '' && rows.length > 0) {
                if (!noResultsRow) {
                    noResultsRow = document.createElement('tr');
                    noResultsRow.id = 'noDriverResultsRow';
                    noResultsRow.innerHTML = '<td colspan="6" class="text-center py-4">No matching drivers found</td>';
                    tbody.appendChild(noResultsRow);
                }
            } else if (noResultsRow) {
                noResultsRow.remove();
            }
        });
    }

    // View Applications Button Functionality
    const viewApplicationsBtn = document.getElementById('viewApplicationsBtn');
    const viewApplicationsBtnEmpty = document.getElementById('viewApplicationsBtnEmpty');
    const driverApplicationsTab = document.querySelector('.tab-button[data-tab-target="#driverApplications"]');

    function navigateToApplicationsTab() {
        // Remove active class from current tab
        document.querySelector('.tab-button.active').classList.remove('active');
        document.querySelector('.tab-pane.active').classList.remove('active');

        // Add active class to applications tab
        driverApplicationsTab.classList.add('active');
        document.getElementById('driverApplications').classList.add('active');
    }

    if (viewApplicationsBtn) {
        viewApplicationsBtn.addEventListener('click', navigateToApplicationsTab);
    }

    if (viewApplicationsBtnEmpty) {
        viewApplicationsBtnEmpty.addEventListener('click', navigateToApplicationsTab);
    }


    // Edit Driver Modal
    const editDriverModal = document.getElementById('editDriverModal');
    const editDriverBtns = document.querySelectorAll('.edit-driver-btn');
    const editDriverCloseBtn = editDriverModal?.querySelector('.close');
    const editDriverCancelBtn = editDriverModal?.querySelector('.cancel-btn');

    function openEditDriverModal(id, firstName, lastName, license, status, vehicleId) {
        document.getElementById('editDriverId').value = id;
        document.getElementById('editDriverFirstName').value = firstName;
        document.getElementById('editDriverLastName').value = lastName;
        document.getElementById('editDriverLicense').value = license;
        document.getElementById('editDriverStatus').value = status;
        document.getElementById('editDriverVehicle').value = vehicleId || '';
        editDriverModal.style.display = 'block';
    }

    function closeEditDriverModal() {
        editDriverModal.style.display = 'none';
    }

    if (editDriverBtns) {
        editDriverBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const firstName = this.getAttribute('data-firstname');
                const lastName = this.getAttribute('data-lastname');
                const license = this.getAttribute('data-license');
                const status = this.getAttribute('data-status');
                const vehicleId = this.getAttribute('data-vehicleid');
                openEditDriverModal(id, firstName, lastName, license, status, vehicleId);
            });
        });
    }

    if (editDriverCloseBtn) editDriverCloseBtn.addEventListener('click', closeEditDriverModal);
    if (editDriverCancelBtn) editDriverCancelBtn.addEventListener('click', closeEditDriverModal);

    // Delete Driver Modal
    const deleteDriverModal = document.getElementById('deleteDriverModal');
    const deleteDriverBtns = document.querySelectorAll('.delete-driver-btn');
    const deleteDriverCloseBtn = deleteDriverModal?.querySelector('.close');
    const deleteDriverCancelBtn = deleteDriverModal?.querySelector('.cancel-btn');

    function openDeleteDriverModal(id, name) {
        document.getElementById('deleteDriverId').value = id;
        document.getElementById('deleteDriverName').textContent = name;
        deleteDriverModal.style.display = 'block';
    }

    function closeDeleteDriverModal() {
        deleteDriverModal.style.display = 'none';
    }

    if (deleteDriverBtns) {
        deleteDriverBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const name = this.getAttribute('data-name');
                openDeleteDriverModal(id, name);
            });
        });
    }

    if (deleteDriverCloseBtn) deleteDriverCloseBtn.addEventListener('click', closeDeleteDriverModal);
    if (deleteDriverCancelBtn) deleteDriverCancelBtn.addEventListener('click', closeDeleteDriverModal);


    // Close modal when clicking outside
    window.addEventListener('click', function (event) {
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === modal) {  // For add modal
            closeModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
        if (event.target === addVehicleModal) {
            closeAddVehicleModal();
        }

        if (event.target === addVacancyModal) {
            closeAddVacancyModal();
        }
        if (event.target === deleteVacancyModal) {
            closeDeleteVacancyModal();
        }
        if (event.target === editVacancyModal) {
            closeEditVacancyModal();
        }
        if (event.target === addDriverModal) closeAddDriverModal();
        if (event.target === editDriverModal) closeEditDriverModal();
        if (event.target === deleteDriverModal) closeDeleteDriverModal();
        if (event.target === editVehicleModal) {
            closeEditVehicleModal();
        }
        if (event.target === assignDriverModal) {
            closeAssignDriverModal();
        }
        if (event.target === deleteVehicleModal) {
            closeDeleteVehicleModal();
        }
    });


    //Activity Log:

    const activitySearch = document.getElementById('activitySearch');
    const dateFilter = document.getElementById('dateFilter');
    const activityRows = document.querySelectorAll('.activity-row');

    function filterActivities() {
        const searchTerm = activitySearch.value.toLowerCase();
        const selectedDate = dateFilter.value;
        let hasVisibleRows = false;

        activityRows.forEach(row => {
            const actionType = row.getAttribute('data-action');
            const logDate = row.getAttribute('data-date');
            const description = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
            const userName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

            const matchesSearch = searchTerm === '' ||
                actionType.includes(searchTerm) ||
                description.includes(searchTerm) ||
                userName.includes(searchTerm);

            const matchesDate = selectedDate === '' || logDate === selectedDate;

            if (matchesSearch && matchesDate) {
                row.style.display = '';
                hasVisibleRows = true;
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide no results message
        const noResultsRow = document.getElementById('noResultsRow');
        const tbody = document.querySelector('#activityLogTable tbody');

        if (!hasVisibleRows && activityRows.length > 0) {
            if (!noResultsRow) {
                const newRow = document.createElement('tr');
                newRow.id = 'noResultsRow';
                newRow.innerHTML = '<td colspan="4" class="text-center py-4">No matching activities found</td>';
                tbody.appendChild(newRow);
            }
        } else if (noResultsRow) {
            noResultsRow.remove();
        }
    }

    activitySearch.addEventListener('input', filterActivities);
    dateFilter.addEventListener('change', filterActivities);


    function setupAutoDismiss() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => {
            setTimeout(() => {
                alert.style.transition = 'opacity 0.5s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 500);
            }, 5000);
        });
    }

    // Call the auto-dismiss function
    setupAutoDismiss();

    // Handle window resize for sidebar state
    window.addEventListener('resize', setInitialSidebarState);

    // Set initial state on load
    setInitialSidebarState();

});