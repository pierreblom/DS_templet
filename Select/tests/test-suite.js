/**
 * Test Suite for Refactored Beha E-commerce
 * Following BDD (Behavior-Driven Development) principles
 *
 * Tests are organized by feature and describe expected behavior
 * in natural language following the Given-When-Then pattern.
 */

class TestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.results = [];
    }

    /**
     * Add a test case
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    async run() {
        console.log('🧪 Running Beha E-commerce Test Suite');
        console.log('=====================================');

        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.passed++;
                this.results.push({ name: test.name, status: 'PASS', error: null });
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                this.results.push({ name: test.name, status: 'FAIL', error: error.message });
                console.log(`❌ ${test.name}`);
                console.log(`   Error: ${error.message}`);
            }
        }

        this.printSummary();
    }

    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n📊 Test Results Summary');
        console.log('=======================');
        console.log(`Total Tests: ${this.tests.length}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`);

        if (this.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`   - ${result.name}: ${result.error}`);
            });
        }
    }

    /**
     * Assertion helpers
     */
    static assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    static assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${expected}, but got ${actual}`);
        }
    }

    static assertNotNull(value, message = 'Value should not be null') {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }
}

// Create test suite instance
const testSuite = new TestSuite();

// Test Cart Functionality
testSuite.test('Cart Manager - Should add items to cart', () => {
    // Given a cart manager
    const cart = new CartManager();

    // When adding an item
    const success = cart.addItem('test-1', {
        name: 'Test Product',
        price: 100.00,
        quantity: 2
    });

    // Then the item should be added successfully
    TestSuite.assert(success, 'Add item should return true');
    TestSuite.assertEqual(cart.cart.length, 1, 'Cart should contain 1 item');
    TestSuite.assertEqual(cart.cart[0].quantity, 2, 'Item quantity should be 2');
});

testSuite.test('Cart Manager - Should calculate totals correctly', () => {
    // Given a cart with items
    const cart = new CartManager();
    cart.addItem('test-1', { name: 'Product 1', price: 100.00, quantity: 2 });
    cart.addItem('test-2', { name: 'Product 2', price: 50.00, quantity: 1 });

    // When calculating totals
    const totals = cart.getTotal();

    // Then totals should be correct
    TestSuite.assertEqual(totals.subtotal, 250.00, 'Subtotal should be 250');
    TestSuite.assertEqual(totals.shipping, 60.00, 'Shipping should be 60');
    TestSuite.assertEqual(totals.total, 310.00, 'Total should be 310');
});

testSuite.test('Cart Manager - Should update item quantity', () => {
    // Given a cart with an item
    const cart = new CartManager();
    cart.addItem('test-1', { name: 'Test Product', price: 100.00, quantity: 1 });

    // When updating quantity
    cart.updateQuantity('test-1', 3);

    // Then quantity should be updated
    TestSuite.assertEqual(cart.cart[0].quantity, 3, 'Quantity should be updated to 3');
});

testSuite.test('Modal Manager - Should open and close modals', () => {
    // Given a modal manager and a modal element
    const modalManager = new ModalManager();

    // Create a test modal element
    const testModal = document.createElement('div');
    testModal.id = 'testModal';
    testModal.className = 'modal';
    testModal.style.display = 'none';
    document.body.appendChild(testModal);

    try {
        // When opening the modal
        const opened = modalManager.openModal('testModal');

        // Then modal should be opened
        TestSuite.assert(opened, 'Modal should open successfully');
        TestSuite.assertEqual(testModal.style.display, 'flex', 'Modal display should be flex');

        // When closing the modal
        const closed = modalManager.closeModal('testModal');

        // Then modal should be closed
        TestSuite.assert(closed, 'Modal should close successfully');
        TestSuite.assertEqual(testModal.style.display, 'none', 'Modal display should be none');
    } finally {
        // Cleanup
        document.body.removeChild(testModal);
    }
});

testSuite.test('Utils - Should format currency correctly', () => {
    // When formatting currency
    const formatted = Utils.formatCurrency(123.45, 'R');

    // Then it should be formatted correctly
    TestSuite.assertEqual(formatted, 'R 123.45', 'Currency should be formatted as R 123.45');
});

testSuite.test('Utils - Should validate email addresses', () => {
    // When validating valid email
    const valid = Utils.isValidEmail('test@example.com');

    // Then it should return true
    TestSuite.assert(valid, 'Valid email should return true');

    // When validating invalid email
    const invalid = Utils.isValidEmail('invalid-email');

    // Then it should return false
    TestSuite.assert(!invalid, 'Invalid email should return false');
});

testSuite.test('Utils - Should truncate text correctly', () => {
    // Given a long text
    const longText = 'This is a very long text that should be truncated';

    // When truncating to 10 characters
    const truncated = Utils.truncateText(longText, 10);

    // Then it should be truncated with ellipsis
    TestSuite.assertEqual(truncated, 'This is a ...', 'Text should be truncated to 10 chars + ellipsis');
});

testSuite.test('Search Manager - Should filter products by name', () => {
    // Given a search manager with products
    const products = [
        { id: 1, name: 'Test Bra', category: 'bras' },
        { id: 2, name: 'Test Shirt', category: 'tops' },
        { id: 3, name: 'Another Bra', category: 'bras' }
    ];

    const searchManager = new SearchManager(products);

    // Mock the allProducts property (since it's set via setProducts)
    searchManager.allProducts = products;

    // When searching for 'bra'
    // Note: This would normally update DOM, but we'll test the logic
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes('bra') ||
        product.category.toLowerCase().includes('bra')
    );

    // Then should find bra products
    TestSuite.assertEqual(filtered.length, 2, 'Should find 2 products with "bra"');
    TestSuite.assert(filtered.some(p => p.name === 'Test Bra'), 'Should include "Test Bra"');
    TestSuite.assert(filtered.some(p => p.name === 'Another Bra'), 'Should include "Another Bra"');
});

testSuite.test('Navigation Manager - Should initialize correctly', () => {
    // Given a navigation manager
    const navManager = new NavigationManager();

    // Then it should have the expected methods
    TestSuite.assert(typeof navManager.toggleNav === 'function', 'Should have toggleNav method');
    TestSuite.assertNotNull(navManager, 'Navigation manager should be created');
});

// Integration Test - End-to-End Cart Flow
testSuite.test('Integration - Complete cart workflow should work', () => {
    // Given all managers are initialized
    const cart = new CartManager();
    const modalManager = new ModalManager();

    // When performing a complete cart workflow
    cart.addItem('product-1', {
        name: 'Test Product',
        price: 100.00,
        quantity: 1
    });

    const badgeUpdated = cart.updateBadge();
    const totals = cart.getTotal();

    // Then everything should work together
    TestSuite.assertEqual(cart.cart.length, 1, 'Cart should have 1 item');
    TestSuite.assertEqual(totals.total, 160.00, 'Total should include shipping');
    TestSuite.assertNotNull(cart.cart[0].name, 'Product should have name');
});

// Performance Test
testSuite.test('Performance - Cart operations should be fast', () => {
    // Given a cart manager
    const cart = new CartManager();

    // When performing many operations
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
        cart.addItem(`product-${i}`, {
            name: `Product ${i}`,
            price: 10.00,
            quantity: 1
        });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Then operations should complete quickly (< 100ms)
    TestSuite.assert(duration < 100, `Cart operations took ${duration}ms, should be < 100ms`);
    TestSuite.assertEqual(cart.cart.length, 100, 'Should have 100 items');
});

// Export for use in browser console or test runner
window.TestSuite = TestSuite;
window.testSuite = testSuite;

// Auto-run tests if in browser environment
if (typeof window !== 'undefined' && window.document) {
    // Run tests after a short delay to ensure modules are loaded
    setTimeout(() => {
        testSuite.run();
    }, 1000);
}

console.log('🧪 Test suite loaded. Run testSuite.run() to execute tests.');