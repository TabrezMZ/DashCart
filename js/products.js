class ProductManager {
  constructor() {
    this.products = [...sampleProducts]
    this.filteredProducts = [...this.products]
    this.currentPage = 1
    this.itemsPerPage = 9
    this.editingProduct = null
    this.sortField = null
    this.sortDirection = "asc"
    this.init()
  }

  init() {
    this.renderProducts()
    this.initEventListeners()
    this.initModal()
    this.initSearch()
    this.initSorting()
  }

  initEventListeners() {
    // Add product button
    document.getElementById("addProductBtn").addEventListener("click", () => {
      this.openModal()
    })

    // Pagination
    document.getElementById("prevPage").addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--
        this.renderProducts()
      }
    })

    document.getElementById("nextPage").addEventListener("click", () => {
      const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage)
      if (this.currentPage < totalPages) {
        this.currentPage++
        this.renderProducts()
      }
    })

    // Select all checkbox
    document.getElementById("selectAll").addEventListener("change", (e) => {
      const checkboxes = document.querySelectorAll(".product-checkbox")
      checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked
      })
    })
  }

  initModal() {
    const modal = document.getElementById("productModal")
    const modalClose = document.getElementById("modalClose")
    const productForm = document.getElementById("productForm")

    // Close modal
    modalClose.addEventListener("click", () => {
      this.closeModal()
    })

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal()
      }
    })

    // Form submission
    productForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveProduct()
    })

    // Photo upload
    const photoUpload = document.getElementById("photoUpload")
    const photoInput = document.getElementById("productPhoto")

    photoUpload.addEventListener("click", () => {
      photoInput.click()
    })

    photoInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          photoUpload.innerHTML = `
                        <img src="${e.target.result}" alt="Product" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                    `
        }
        reader.readAsDataURL(file)
      }
    })

    // Custom selects
    this.initCustomSelects()
  }

  initCustomSelects() {
    // Category select
    const categorySelect = document.getElementById("categorySelect")
    const categoryDropdown = document.getElementById("categoryDropdown")
    const categoryInput = document.getElementById("productCategory")

    categorySelect.addEventListener("click", (e) => {
      e.stopPropagation()
      categoryDropdown.classList.toggle("show")
    })

    categoryDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
      if (e.target.classList.contains("select-option")) {
        const value = e.target.dataset.value
        const text = e.target.textContent

        categorySelect.querySelector("span").textContent = text
        categoryInput.value = value

        categoryDropdown.querySelectorAll(".select-option").forEach((option) => {
          option.classList.remove("active")
        })
        e.target.classList.add("active")

        categoryDropdown.classList.remove("show")
      }
    })

    // Company select
    const companySelect = document.getElementById("companySelect")
    const companyDropdown = document.getElementById("companyDropdown")
    const companyInput = document.getElementById("productCompany")

    companySelect.addEventListener("click", (e) => {
      e.stopPropagation()
      companyDropdown.classList.toggle("show")
    })

    companyDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
      const option = e.target.closest(".select-option")
      if (option) {
        const value = option.dataset.value
        const companyOption = option.querySelector(".company-option").cloneNode(true)

        companySelect.querySelector(".company-option").replaceWith(companyOption)
        companyInput.value = value

        companyDropdown.querySelectorAll(".select-option").forEach((opt) => {
          opt.classList.remove("active")
        })
        option.classList.add("active")

        companyDropdown.classList.remove("show")
      }
    })

    // Status select
    const statusSelect = document.getElementById("statusSelect")
    const statusDropdown = document.getElementById("statusDropdown")
    const statusInput = document.getElementById("productStatus")

    statusSelect.addEventListener("click", (e) => {
      e.stopPropagation()
      statusDropdown.classList.toggle("show")
    })

    statusDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
      const option = e.target.closest(".select-option")
      if (option) {
        const value = option.dataset.value
        const statusBadge = option.querySelector(".status-badge").cloneNode(true)

        statusSelect.querySelector(".status-badge").replaceWith(statusBadge)
        statusInput.value = value

        statusDropdown.querySelectorAll(".select-option").forEach((opt) => {
          opt.classList.remove("active")
        })
        option.classList.add("active")

        statusDropdown.classList.remove("show")
      }
    })

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      categoryDropdown.classList.remove("show")
      companyDropdown.classList.remove("show")
      statusDropdown.classList.remove("show")
    })
  }

  initSearch() {
    const searchInput = document.getElementById("productSearch")
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase()
      this.filteredProducts = this.products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.company.toLowerCase().includes(searchTerm),
      )

      // Maintain current sorting after search
      if (this.sortField) {
        this.sortProducts()
      }

      this.currentPage = 1
      this.renderProducts()
    })
  }

  initSorting() {
    const sortableHeaders = document.querySelectorAll(".sortable")

    sortableHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const sortField = header.dataset.sort

        // Toggle sort direction if clicking the same field
        if (this.sortField === sortField) {
          this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
        } else {
          this.sortField = sortField
          this.sortDirection = "asc"
        }

        // Update header visual state
        sortableHeaders.forEach((h) => {
          h.classList.remove("sort-asc", "sort-desc")
        })

        header.classList.add(`sort-${this.sortDirection}`)

        // Sort and render
        this.sortProducts()
        this.currentPage = 1
        this.renderProducts()
      })
    })
  }

  // Add this method after initSorting()
  sortProducts() {
    if (!this.sortField) return

    this.filteredProducts.sort((a, b) => {
      let aValue = a[this.sortField]
      let bValue = b[this.sortField]

      // Handle different data types
      if (this.sortField === "price") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      let comparison = 0
      if (aValue > bValue) {
        comparison = 1
      } else if (aValue < bValue) {
        comparison = -1
      }

      return this.sortDirection === "desc" ? comparison * -1 : comparison
    })
  }

  openModal(product = null) {
    const modal = document.getElementById("productModal")
    const modalTitle = document.getElementById("modalTitle")
    const form = document.getElementById("productForm")

    this.editingProduct = product

    if (product) {
      modalTitle.textContent = "Edit product"
      this.populateForm(product)
    } else {
      modalTitle.textContent = "Add new product"
      form.reset()
      this.resetForm()
    }

    modal.classList.add("show")
  }

  closeModal() {
    const modal = document.getElementById("productModal")
    modal.classList.remove("show")
    this.editingProduct = null
  }

  populateForm(product) {
    document.getElementById("productName").value = product.name
    document.getElementById("productPrice").value = product.price

    // Set category
    const categorySelect = document.getElementById("categorySelect")
    const categoryInput = document.getElementById("productCategory")
    const categoryText = product.category.charAt(0).toUpperCase() + product.category.slice(1)
    categorySelect.querySelector("span").textContent = categoryText
    categoryInput.value = product.category

    // Set company
    const companySelect = document.getElementById("companySelect")
    const companyInput = document.getElementById("productCompany")
    const companyOption = companySelect.querySelector(".company-option")
    companyOption.querySelector("span").textContent = product.company.charAt(0).toUpperCase() + product.company.slice(1)
    companyOption.querySelector(".company-logo").className = `company-logo ${product.company}`
    companyInput.value = product.company

    // Set status
    const statusSelect = document.getElementById("statusSelect")
    const statusInput = document.getElementById("productStatus")
    const statusBadge = statusSelect.querySelector(".status-badge")
    statusBadge.textContent = product.status === "in-stock" ? "In Stock" : "Out of Stock"
    statusBadge.className = `status-badge ${product.status}`
    statusInput.value = product.status
  }

  resetForm() {
    // Reset photo upload
    const photoUpload = document.getElementById("photoUpload")
    photoUpload.innerHTML = `
            <div class="upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <p>Click to upload or drag and drop<br>SVG, PNG, JPG or GIF (max. 800 x 400px)</p>
        `

    // Reset selects to default values
    const categorySelect = document.getElementById("categorySelect")
    categorySelect.querySelector("span").textContent = "Accessories"
    document.getElementById("productCategory").value = "accessories"

    const companySelect = document.getElementById("companySelect")
    const companyOption = companySelect.querySelector(".company-option")
    companyOption.querySelector("span").textContent = "Google"
    companyOption.querySelector(".company-logo").className = "company-logo google"
    document.getElementById("productCompany").value = "google"

    const statusSelect = document.getElementById("statusSelect")
    const statusBadge = statusSelect.querySelector(".status-badge")
    statusBadge.textContent = "In Stock"
    statusBadge.className = "status-badge in-stock"
    document.getElementById("productStatus").value = "in-stock"
  }

  saveProduct() {
    const formData = new FormData(document.getElementById("productForm"))
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: Number.parseInt(formData.get("price")),
      company: formData.get("company"),
      status: formData.get("status"),
      image: null,
    }

    if (this.editingProduct) {
      // Update existing product
      const index = this.products.findIndex((p) => p.id === this.editingProduct.id)
      this.products[index] = { ...this.editingProduct, ...productData }
    } else {
      // Add new product
      const newProduct = {
        id: Date.now(),
        ...productData,
      }
      this.products.unshift(newProduct)
    }

    this.filteredProducts = [...this.products]
    this.renderProducts()
    this.closeModal()
  }

  deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
      this.products = this.products.filter((p) => p.id !== id)
      this.filteredProducts = this.filteredProducts.filter((p) => p.id !== id)
      this.renderProducts()
    }
  }

  renderProducts() {
    const tbody = document.getElementById("productsTableBody")
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageProducts = this.filteredProducts.slice(startIndex, endIndex)

    tbody.innerHTML = pageProducts
      .map(
        (product) => `
            <tr>
                <td>
                    <input type="checkbox" class="product-checkbox" data-id="${product.id}">
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-image">
                            ${
                              product.image
                                ? `<img src="${product.image}" alt="${product.name}">`
                                : `
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/>
                                    <circle cx="7" cy="7" r="1" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M18 12L14 8L2 20" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                            `
                            }
                        </div>
                        <span class="product-name">${product.name}</span>
                    </div>
                </td>
                <td>${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</td>
                <td>$${product.price}</td>
                <td>
                    <div class="company-info">
                        <div class="company-logo ${product.company}"></div>
                        <span class="company-name">${product.company.charAt(0).toUpperCase() + product.company.slice(1)}</span>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${product.status}">
                        ${product.status === "in-stock" ? "In Stock" : "Out of Stock"}
                    </span>
                </td>
               <td>
                    <div class="actions">
                        <button class="action-btn" onclick="window.productManager.openModal(window.productManager.products.find(p => p.id === ${product.id}))">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12.146 1.854a.5.5 0 0 1 .708 0l1.292 1.292a.5.5 0 0 1 0 .708L6.5 11.5H4v-2.5l7.646-7.646z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="action-btn" onclick="window.productManager.deleteProduct(${product.id})">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 5.885 16h4.23a2 2 0 0 0 1.994-1.84L12.962 3.5h.538a.5.5 0 0 0 0-1H11z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")

    // Update pagination
    this.updatePagination()

    // Update products count
    const productsCount = document.getElementById("productsCount")
    const total = this.filteredProducts.length
    const start = total === 0 ? 0 : startIndex + 1
    const end = Math.min(endIndex, total)
    productsCount.textContent = `${start} - ${end} of ${total}`
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    const prevBtn = document.getElementById("prevPage")
    const nextBtn = document.getElementById("nextPage")

    prevBtn.disabled = this.currentPage === 1
    nextBtn.disabled = this.currentPage === totalPages || totalPages === 0
  }
}
