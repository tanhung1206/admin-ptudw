const templateProduct=`
{{#each products}}
<tr>
    <td>{{productid}}</td>
    <td>{{name}}</td>
    <td>$ {{price}}</td>
    <td>{{quantity}}</td>
    <td>{{sold_quantity}}</td>
    <td>{{createdat}}</td>
    <td class="text-center">
        <button class="btn btn-sm btn-outline-warning">
            <a href="/products/{{productid}}" style="color: inherit; text-decoration: none;">
                <i class="mdi mdi-pencil" style="vertical-align: middle;"></i> Edit
            </a>
        </button>
    </td>
</tr>
{{/each}}
<tr>
    <td colspan="7">
        <nav aria-label="Page navigation example" class="mt-4">
            <ul class="pagination justify-content-center">
                <li class="page-item {{#unless prevPage}}disabled{{/unless}}">
                    <a class="page-link" href="?{{#if query}}{{query}}&{{/if}}page={{prevPage}}"
                        tabindex="-1" aria-disabled="true">Previous</a>
                </li>
                {{#if (lte totalPages 7)}}
                {{#for 1 totalPages}}
                <li class="page-item {{#if (eq this ../curPage)}}active{{/if}}"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{this}}">{{this}}
                    </a></li>
                {{/for}}
                {{/if}}


                {{#if (gte totalPages 8)}}
                {{#if (lte curPage 4)}}
                {{#for 1 5}}
                <li class="page-item {{#if (eq this ../curPage)}}active{{/if}}"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{this}}">{{this}}
                    </a></li>
                {{/for}}
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                <li class="page-item"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{totalPages}}">{{totalPages}}
                    </a></li>
                {{/if}}

                {{#if (gte curPage (subtract totalPages 3))}}
                <li class="page-item"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page=1">1
                    </a></li>
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                {{#for (subtract totalPages 4) totalPages}}
                <li class="page-item {{#if (eq this ../curPage)}}active{{/if}}"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{this}}">{{this}}
                    </a></li>
                {{/for}}
                {{/if}}

                {{#if (inRange curPage 5 (subtract totalPages 4))}}
                <li class="page-item"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page=1">1
                    </a></li>
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                {{#for (subtract curPage 1) (add curPage 1)}}
                <li class="page-item {{#if (eq this ../curPage)}}active{{/if}}"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{this}}">{{this}}
                    </a></li>
                {{/for}}
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                <li class="page-item"><a class="page-link"
                        href="?{{#if ../query}}{{../query}}&{{/if}}page={{totalPages}}">{{totalPages}}
                    </a></li>
                {{/if}}

                {{/if}}
                <li class="page-item {{#unless nextPage}}disabled{{/unless}}">
                    <a class="page-link"
                        href="?{{#if query}}{{query}}&{{/if}}page={{nextPage}}">Next</a>
                </li>
            </ul>
        </nav>
    </td>
</tr>
`
document.addEventListener("DOMContentLoaded", function () {
    const filterForm = document.getElementById("filterForm");

    // Submit form khi các select thay đổi
    document.querySelectorAll("#categorySelect, #manufacturerSelect, #sortSelect").forEach((select) => {
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
        // const newURL = `${window.location.pathname}?${queryParams.toString()}`;
        loadProducts(`?${queryParams.toString()}`);
    })
});

const loadProducts = (url) => {
    
    fetch(`api/products${url}`)
        .then((reponse) => reponse.json())
        .then((data) => {
            const products=document.getElementById("products");
            const template = Handlebars.compile(templateProduct);
            const html = template(data);
            products.innerHTML = html;
            history.pushState(null, "", url);
            addEventForLink();
        })
}

const addEventForLink = () => {
    document.querySelectorAll(".page-link").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const newURL = this.getAttribute("href");
            loadProducts(newURL);
        })
    })
}

addEventForLink();