document.addEventListener("DOMContentLoaded", function () {
    const filterForm = document.getElementById("filterForm");
    let currentQueryParams = new URLSearchParams(window.location.search);

    // Submit form khi các select thay đổi
    document.querySelectorAll("#sortSelect").forEach((select) => {
        select.addEventListener("change", function () {
            filterForm.dispatchEvent(new Event("submit"));
        });
    });

    filterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(filterForm);
        currentQueryParams = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) currentQueryParams.append(key, value); // Bỏ qua các trường trống
        }
        fetchAccounts();
    });

    function fetchAccounts() {
        fetch(`/accounts?${currentQueryParams.toString()}`, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(response => response.json())
            .then(data => {
                const accountsTable = document.getElementById("accounts");
                accountsTable.innerHTML = data.users.map(user => {
                    const createdAt = new Date(user.createdat).toString(); // Định dạng thời gian
                    return `
                        <tr>
                            <td>${user.userid}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${createdAt}</td> <!-- Thêm cột createdat -->
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-warning view-account" data-id="${user.userid}">
                                    <i class="mdi mdi-eye" style="vertical-align: middle;"></i> View
                                </button>
                                <button class="btn btn-sm btn-outline-danger ban-unban-user" data-id="${user.userid}"
                                    data-banned="${user.isban}" data-username="${user.username}">
                                    <i class="mdi mdi-account-cancel" style="vertical-align: middle;"></i> ${user.isban ? 'Unban' : 'Ban'}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join("") + `
                    <tr>
                        <td colspan="5">
                            <nav aria-label="Page navigation example" class="mt-4">
                                <ul class="pagination justify-content-center">
                                    <li class="page-item ${data.prevPage ? "" : "disabled"}">
                                        <a class="page-link" href="#" data-page="${data.prevPage}" tabindex="-1" aria-disabled="true">Previous</a>
                                    </li>
                                    ${Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => `
                                        <li class="page-item ${page === data.curPage ? "active" : ""}">
                                            <a class="page-link" href="#" data-page="${page}">${page}</a>
                                        </li>
                                    `).join("")}
                                    <li class="page-item ${data.nextPage ? "" : "disabled"}">
                                        <a class="page-link" href="#" data-page="${data.nextPage}">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </td>
                    </tr>
                `;
                addEventForPaginationLinks();
                addEventForBanUnbanButtons(); // Re-attach event listeners for Ban/Unban buttons
                addEventForViewAccountButtons(); // Re-attach event listeners for View Account buttons
            });
    }

    // Ajax pagination

    const addEventForPaginationLinks = () => {
        const paginationLinks = document.querySelectorAll('.pagination .page-link');
        paginationLinks.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const page = this.getAttribute('data-page');
                if (page) {
                    currentQueryParams.set('page', page);
                    fetchAccounts();
                }
            });
        });
    };

    addEventForPaginationLinks();

    // Ban/Unban

    const addEventForBanUnbanButtons = () => {
        const profile = document.querySelector('.navbar-profile-name').textContent;
        document.querySelectorAll('.ban-unban-user').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-id');
                const username = this.getAttribute('data-username');
                const isBanned = this.getAttribute('data-banned') === 'true';
                if (profile === username) {
                    console.log('You cannot ban/unban yourself.');
                    document.getElementById('banUnbanMessage').textContent = 'You cannot ban/unban yourself.';
                    document.getElementById('banUnbanSubmit').classList.add('d-none');
                    document.getElementById('banUnbanModalLabel').textContent = 'Cannot Ban/Unban';
                } else {
                    const action = isBanned ? 'unban' : 'ban';
                    const message = isBanned ? `Are you sure you want to unban user ${username}?` : `Are you sure you want to ban user ${username}?`;

                    document.getElementById('banUnbanUserId').value = userId;
                    document.getElementById('banUnbanAction').value = action;
                    document.getElementById('banUnbanMessage').textContent = message;
                    document.getElementById('banUnbanSubmit').classList.remove('d-none');
                }

                $('#banUnbanModal').modal('show');
            });
        });
    };

    addEventForBanUnbanButtons(); // Initial attachment of event listeners

    document.getElementById('banUnbanForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const userId = document.getElementById('banUnbanUserId').value;
        const action = document.getElementById('banUnbanAction').value;

        fetch(`/accounts/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ userid: userId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload the table content with current query parameters
                    fetchAccounts();
                } else {
                    alert('An error occurred. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            });

        // Close form
        $('#banUnbanModal').modal('hide');
    });

    // View account details
    const addEventForViewAccountButtons = () => {
        document.querySelectorAll('.view-account').forEach(button => {
            button.addEventListener('click', function () {
                const userId = this.getAttribute('data-id');
                fetch(`/accounts/${userId}`, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        const accountDetails = document.getElementById("accountDetails");
                        accountDetails.innerHTML = `
                            <p><strong>Username:</strong> ${data.username}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Created At:</strong> ${new Date(data.createdat).toString()}</p>
                            <p><strong>Banned:</strong> ${data.isban ? "Yes" : "No"}</p>
                            <p><strong>Is Actived:</strong> ${data.isactivated ? "Active" : "Inactive"}</p>
                        `;
                        const modal = new bootstrap.Modal(document.getElementById("viewAccountModal"));
                        modal.show();
                    });
            });
        });
    };

    addEventForViewAccountButtons(); // Initial attachment of event listeners

    // Initial fetch to load the accounts
    fetchAccounts();
});