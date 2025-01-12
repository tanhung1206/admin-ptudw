document.addEventListener("DOMContentLoaded", function () {
    const filterForm = document.getElementById("filterForm");

    // Submit form khi các select thay đổi
    document.querySelectorAll("#sortSelect").forEach((select) => {
        select.addEventListener("change", function () {
            filterForm.dispatchEvent(new Event("submit"));
        });
    });

    filterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const queryParams = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) queryParams.append(key, value); // Bỏ qua các trường trống
        }
        fetch(`/accounts?${queryParams.toString()}`, {
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
                                <button class="btn btn-sm btn-outline-warning">
                                    <i class="mdi mdi-pencil" style="vertical-align: middle;"></i> Edit
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
                                        <a class="page-link" href="?${data.query}&page=${data.prevPage}" tabindex="-1" aria-disabled="true">Previous</a>
                                    </li>
                                    ${Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => `
                                        <li class="page-item ${page === data.curPage ? "active" : ""}">
                                            <a class="page-link" href="?${data.query}&page=${page}">${page}</a>
                                        </li>
                                    `).join("")}
                                    <li class="page-item ${data.nextPage ? "" : "disabled"}">
                                        <a class="page-link" href="?${data.query}&page=${data.nextPage}">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </td>
                    </tr>
                `;
                addEventForPaginationLinks();
            });
    });

    // Ajax pagination

    const addEventForPaginationLinks = () => {
        const paginationLinks = document.querySelectorAll('.pagination .page-link');
        paginationLinks.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const url = this.getAttribute('href');
                fetchPage(url);
            });
        });
    };

    addEventForPaginationLinks();

    function fetchPage(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newTableBody = doc.querySelector('#accounts');
                const newPagination = doc.querySelector('.pagination');

                document.querySelector('#accounts').innerHTML = newTableBody.innerHTML;
                document.querySelector('.pagination').innerHTML = newPagination.innerHTML;

                // Re-attach event listeners to new pagination links
                addEventForPaginationLinks();
            })
            .catch(error => console.error('Error fetching page:', error));
    }

    // Ban/Unban

    document.querySelectorAll('.ban-unban-user').forEach(button => {
        button.addEventListener('click', function () {
            const userId = this.getAttribute('data-id');
            const isBanned = this.getAttribute('data-banned') === 'true';
            const action = isBanned ? 'unban' : 'ban';
            const message = isBanned ? 'Are you sure you want to unban this user?' : 'Are you sure you want to ban this user?';

            document.getElementById('banUnbanUserId').value = userId;
            document.getElementById('banUnbanAction').value = action;
            document.getElementById('banUnbanMessage').textContent = message;

            $('#banUnbanModal').modal('show');
        });
    });

    document.getElementById('banUnbanForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const userId = document.getElementById('banUnbanUserId').value;
        const action = document.getElementById('banUnbanAction').value;

        // Perform AJAX request to ban/unban the user
        // Example:
        // $.ajax({
        //     url: `/users/${action}`,
        //     method: 'POST',
        //     data: { userid: userId },
        //     success: function(response) {
        //         // Handle success
        //         location.reload();
        //     },
        //     error: function(error) {
        //         // Handle error
        //         alert('An error occurred. Please try again.');
        //     }
        // });

        // For demonstration purposes, we'll just reload the page
        location.reload();
    });
});