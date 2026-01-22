/**
 * Main App Module
 * Loads all components and initializes the application
 */

// Load CSS files
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Load JavaScript modules
function loadJS(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load HTML component
async function loadComponent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.text();
    } catch (error) {
        console.error(`Error loading component ${url}:`, error);
        return '';
    }
}

// Insert component into DOM
function insertComponent(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * App class to manage the application lifecycle
 */
class App {
    constructor() {
        this.components = {};
        this.modules = [];
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            await this.loadStyles();
            await this.loadModules();
            await this.loadComponents();
            this.initializeModules();
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    /**
     * Load CSS stylesheets
     */
    async loadStyles() {
        const styles = [
            'css/shared.css',
            'css/header.css',
            'css/footer.css',
            'css/modals.css',
            'css/components.css'
        ];

        styles.forEach(href => loadCSS(href));
    }

    /**
     * Load JavaScript modules
     */
    async loadModules() {
        const modules = [
            'js/utils.js',
            'js/modals.js',
            'js/cart.js',
            'js/navigation.js',
            'js/account.js',
            'js/search.js'
        ];

        for (const module of modules) {
            await loadJS(module);
            this.modules.push(module);
        }
    }

    /**
     * Load HTML components
     */
    async loadComponents() {
        const components = [
            { selector: 'header', url: 'components/header.html' },
            { selector: 'footer', url: 'components/footer.html' },
            { selector: '#modals-container', url: 'components/modals.html' }
        ];

        for (const component of components) {
            const html = await loadComponent(component.url);
            insertComponent(component.selector, html);
            this.components[component.selector] = html;
        }
    }

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Update cart badge on load
        if (typeof cartManager !== 'undefined') {
            cartManager.updateBadge();
        }

        // Set up search with products data (if available)
        if (typeof searchManager !== 'undefined' && typeof allProducts !== 'undefined') {
            searchManager.setProducts(allProducts);
        }

        console.log('App initialized successfully');
    }

    /**
     * Get loaded component HTML
     */
    getComponent(selector) {
        return this.components[selector] || '';
    }

    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.modules.includes(moduleName);
    }
}

// Create and initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', async () => {
    app = new App();
    await app.init();
});

// Make app globally available
window.app = app;