
// ==========================================
// 6. NEWSLETTER SUBSCRIPTION
// ==========================================

function initNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const input = form.querySelector('.newsletter-input');
        const button = form.querySelector('.newsletter-submit');

        if (!input || !input.value) return;

        const originalText = button.textContent;
        button.textContent = 'Subscribing...';
        button.disabled = true;

        try {
            const response = await fetch('/api/v1/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: input.value,
                    source: 'footer_form'
                })
            });

            const data = await response.json();

            if (response.ok) {
                window.showNotification(data.message || 'Thank you for subscribing!', 'success');
                input.value = '';
            } else {
                window.showNotification(data.message || 'Subscription failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Newsletter error:', error);
            window.showNotification('An error occurred. Please try again later.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    });
}

// Initialize Newsletter on Load
document.addEventListener('DOMContentLoaded', () => {
    initNewsletter();
});
