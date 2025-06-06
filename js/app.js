class App {
  constructor() {
    this.currentPage = "dashboard"
    this.chartManager = null
    this.productManager = null
    this.sidebarCollapsed = false
    this.init()
  }

  init() {
    this.initNavigation()
    this.initSidebar()
    this.initManagers()
    this.showPage("dashboard")
  }

  initSidebar() {
    const sidebarToggle = document.querySelector(".sidebar-toggle")
    const sidebar = document.querySelector(".sidebar")
    const mainContent = document.querySelector(".main-content")

    // Start collapsed by default
    this.sidebarCollapsed = true

    sidebarToggle.addEventListener("click", () => {
      this.sidebarCollapsed = !this.sidebarCollapsed

      if (this.sidebarCollapsed) {
        sidebar.classList.remove("expanded")
        mainContent.classList.remove("sidebar-expanded")
      } else {
        sidebar.classList.add("expanded")
        mainContent.classList.add("sidebar-expanded")
      }
    })
  }

  initNavigation() {
    const navItems = document.querySelectorAll(".nav-item")

    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const page = item.dataset.page
        this.showPage(page)

        // Update active state
        navItems.forEach((nav) => nav.classList.remove("active"))
        item.classList.add("active")
      })
    })
  }

  initManagers() {
    this.chartManager = new ChartManager()
    this.productManager = new ProductManager()
  }

  showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll(".page")
    pages.forEach((page) => page.classList.remove("active"))

    // Show selected page
    const targetPage = document.getElementById(`${pageName}-page`)
    if (targetPage) {
      targetPage.classList.add("active")
      this.currentPage = pageName
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new App()
  window.app = app
  window.chartManager = app.chartManager
  window.productManager = app.productManager
})
