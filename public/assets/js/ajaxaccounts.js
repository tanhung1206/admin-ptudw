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
});