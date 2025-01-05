document.addEventListener("DOMContentLoaded", function () {
    const filterForm = document.getElementById("filterForm");

    // Submit form when select elements change
    document.querySelectorAll("#sortSelect, #statusSelect").forEach((select) => {
        select.addEventListener("change", function () {
            filterForm.dispatchEvent(new Event("submit"));
        });
    });

    filterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const queryParams = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (value) queryParams.append(key, value); // Skip empty fields
        }
        fetch(`/orders?${queryParams.toString()}`, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        })
            .then(response => response.json())
            .then(data => {
                const ordersTable = document.getElementById("orders");
                ordersTable.innerHTML = data.orders.map(order => {
                    const createdAt = new Date(order.createdat).toString(); // Format date
                    return `
                        <tr>
                            <td>${order.orderid}</td>
                            <td>${order.username}</td>
                            <td>${order.total}</td>
                            <td>${createdAt}</td>
                            <td>${order.status}</td>
                            <td class="text-center">
                            <button class="btn btn-sm btn-outline-warning view-order" data-id="${order.orderid}">
                                <i class="mdi mdi-eye" style="vertical-align: middle;"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-success update-status" data-id="${order.orderid}">
                                <i class="mdi mdi-pencil" style="vertical-align: middle;"></i> Update Status
                            </button>
                        </td>
                        </tr>
                    `;
                }).join("") + `
                    <tr>
                        <td colspan="6">
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
                addEventForOrderActions();
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
                const newTableBody = doc.querySelector('#orders');
                const newPagination = doc.querySelector('.pagination');

                document.querySelector('#orders').innerHTML = newTableBody.innerHTML;
                document.querySelector('.pagination').innerHTML = newPagination.innerHTML;

                // Re-attach event listeners to new pagination links
                addEventForPaginationLinks();
                addEventForOrderActions();
            })
            .catch(error => console.error('Error fetching page:', error));
    }

    // Add event listeners for view and update status buttons
    const addEventForOrderActions = () => {
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', function () {
                const orderId = this.getAttribute('data-id');
                fetch(`/orders/${orderId}`)
                    .then(response => response.json())
                    .then(data => {
                        const orderDetails = `
                            <h5>Order ID: ${data.orderid}</h5>
                            <p>Date: ${data.createdat}</p>
                            <p>Status: ${data.status}</p>
                            <h5>Products:</h5>
                            <table class="table table-bordered text-center mb-0">
                                <thead class="bg-secondary text-dark">
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody class="align-middle text-white">
                                    ${data.products ? data.products.map(product => `
                                        <tr>
                                            <td class="align-middle">${product.name}</td>
                                            <td class="align-middle">$${product.price}</td>
                                            <td class="align-middle">${product.quantity}</td>
                                            <td class="align-middle">$${product.totalprice}</td>
                                        </tr>
                                    `).join('') : ''}
                                </tbody>
                            </table>
                            <h5 class="mt-3">Order Total: $${data.total}</h5>
                        `;
                        document.getElementById('orderDetails').innerHTML = orderDetails;
                        $('#viewOrderModal').modal('show');
                    })
                    .catch(error => console.error('Error fetching order details:', error));
            });
        });

        document.querySelectorAll('.update-status').forEach(button => {
            button.addEventListener('click', function () {
                const orderId = this.getAttribute('data-id');
                document.getElementById('updateOrderId').value = orderId;
                $('#updateStatusModal').modal('show');
            });
        });

        document.getElementById('updateStatusForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(this);
            fetch(`/orders/${formData.get('orderid')}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: formData.get('status')
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        $('#updateStatusModal').modal('hide');
                        filterForm.dispatchEvent(new Event('submit')); // Refresh the orders list
                    } else {
                        alert('Failed to update order status');
                    }
                })
                .catch(error => console.error('Error updating order status:', error));
        });
    };

    addEventForOrderActions();
});