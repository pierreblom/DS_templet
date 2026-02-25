/**
 * Customizer Preview Script
 * Listens for postMessage events from the Admin Panel's Theme Customizer
 * and updates CSS variables and content dynamically for a live "No-Code" preview experience.
 */

window.addEventListener('message', (event) => {
    // Basic security check
    // if (event.origin !== 'http://localhost:9000') return;

    if (event.data && event.data.type === 'STOREFRONT_PREVIEW_UPDATE') {
        const settings = event.data.settings;
        if (!settings) return;

        console.log('Received live preview update:', settings);

        // --- 1. Update CSS Variables (Colors, Typography, Spacing) ---
        if (settings.theme) {
            const root = document.documentElement;
            if (settings.theme.primaryColor) root.style.setProperty('--primary-color', settings.theme.primaryColor);
            if (settings.theme.secondaryColor) root.style.setProperty('--secondary-color', settings.theme.secondaryColor);
            if (settings.theme.backgroundColor) root.style.setProperty('--bg-color', settings.theme.backgroundColor);
            if (settings.theme.textColor) root.style.setProperty('--text-color', settings.theme.textColor);
            if (settings.theme.headerBackgroundColor) root.style.setProperty('--header-bg', settings.theme.headerBackgroundColor);

            if (settings.theme.typography) {
                if (settings.theme.typography.fontFamily) root.style.setProperty('--font-family-base', settings.theme.typography.fontFamily);
                if (settings.theme.typography.headingFontFamily) root.style.setProperty('--font-family-heading', settings.theme.typography.headingFontFamily);
            }
            if (settings.theme.shapes && settings.theme.shapes.borderRadius) {
                root.style.setProperty('--border-radius', settings.theme.shapes.borderRadius);
            }
            if (settings.theme.spacing) {
                if (settings.theme.spacing.globalPadding) root.style.setProperty('--global-padding', settings.theme.spacing.globalPadding);
                if (settings.theme.spacing.globalMargin) root.style.setProperty('--global-margin', settings.theme.spacing.globalMargin);
            }
        }

        // --- 2. Update Layout Toggles (Sections visibility) ---
        if (settings.layout) {
            const heroSection = document.querySelector('.hero');
            if (heroSection) heroSection.style.display = settings.layout.heroEnabled ? '' : 'none';

            const newArrivals = document.querySelector('.new-arrivals-section');
            if (newArrivals) newArrivals.style.display = settings.layout.newArrivalsEnabled ? '' : 'none';

            const customerLove = document.querySelector('.customer-love-section');
            if (customerLove) customerLove.style.display = settings.layout.customerLoveEnabled ? '' : 'none';

            const trailFavorites = document.getElementById('featured');
            if (trailFavorites && trailFavorites.parentElement && trailFavorites.parentElement.tagName !== 'BODY') {
                trailFavorites.parentElement.style.display = settings.layout.trailFavoritesEnabled ? '' : 'none';
            } else if (trailFavorites) {
                trailFavorites.style.display = settings.layout.trailFavoritesEnabled ? '' : 'none';
            }

            const valueProps = document.querySelector('.value-props-section');
            if (valueProps) valueProps.style.display = settings.layout.valuePropsEnabled ? '' : 'none';

            const newsletter = document.querySelector('.newsletter');
            if (newsletter) newsletter.style.display = settings.layout.newsletterEnabled ? '' : 'none';
        }

        // --- 3. Update Hero Texts & Layout ---
        if (settings.content && settings.content.hero) {
            const heroTitle = document.querySelector('.hero h1');
            const heroSubtitle = document.querySelector('.hero p');
            const heroBtn = document.querySelector('.hero .cta-button');
            const heroSection = document.querySelector('.hero');
            const heroContentBlock = document.querySelector('.hero-content');

            if (heroTitle && settings.content.hero.title) heroTitle.textContent = settings.content.hero.title;
            if (heroSubtitle && settings.content.hero.subtitle) heroSubtitle.textContent = settings.content.hero.subtitle;
            if (heroBtn && settings.content.hero.ctaText) heroBtn.textContent = settings.content.hero.ctaText;

            if (heroTitle && settings.content.hero.titleColor) heroTitle.style.color = settings.content.hero.titleColor;
            if (heroTitle && settings.content.hero.titleSize) heroTitle.style.fontSize = settings.content.hero.titleSize;
            if (heroSubtitle && settings.content.hero.subtitleColor) heroSubtitle.style.color = settings.content.hero.subtitleColor;

            if (heroSection) {
                if (settings.content.hero.textAlign && heroContentBlock) heroContentBlock.style.textAlign = settings.content.hero.textAlign;

                if (settings.content.hero.textPosition) {
                    if (settings.content.hero.textPosition.includes('left')) heroSection.style.justifyContent = 'flex-start';
                    else if (settings.content.hero.textPosition.includes('right')) heroSection.style.justifyContent = 'flex-end';
                    else heroSection.style.justifyContent = 'center';

                    if (settings.content.hero.textPosition.includes('top')) heroSection.style.alignItems = 'flex-start';
                    else if (settings.content.hero.textPosition.includes('bottom')) heroSection.style.alignItems = 'flex-end';
                    else heroSection.style.alignItems = 'center';

                    if (heroContentBlock) {
                        heroContentBlock.style.margin = settings.content.hero.textPosition.includes('center') && !settings.content.hero.textPosition.includes('left') && !settings.content.hero.textPosition.includes('right') ? '0 auto' : '0';
                    }
                }
            }

            if (heroSection && settings.media && settings.media.heroSize) {
                heroSection.style.backgroundSize = settings.media.heroSize;
                if (settings.media.heroPosition) heroSection.style.backgroundPosition = settings.media.heroPosition;
                if (settings.media.heroHeight) heroSection.style.minHeight = settings.media.heroHeight;
            }
        }

        // --- 4. Extra Dynamic Styles (New Arrivals) ---
        if (settings.content && settings.content.newArrivals) {
            const naBg = document.querySelector('.new-arrivals-bg');
            const naCard = document.querySelector('.new-arrivals-card');
            if (naBg && settings.content.newArrivals.backgroundImage) {
                naBg.style.backgroundImage = `url('${settings.content.newArrivals.backgroundImage}')`;
            }
            if (naCard) {
                if (settings.content.newArrivals.cardBackgroundColor) naCard.style.backgroundColor = settings.content.newArrivals.cardBackgroundColor;
                if (settings.content.newArrivals.cardBorderColor) naCard.style.borderColor = settings.content.newArrivals.cardBorderColor;

                const title = naCard.querySelector('h2');
                const pList = naCard.querySelectorAll('p');

                if (title) title.textContent = settings.content.newArrivals.title;
                if (pList.length > 0) pList[0].textContent = settings.content.newArrivals.subtitle;
                if (pList.length > 1) pList[1].textContent = settings.content.newArrivals.promoText;

                [title, ...pList].forEach(t => {
                    if (t && settings.content.newArrivals.cardTextColor) t.style.color = settings.content.newArrivals.cardTextColor;
                });
            }
        }

        // --- 5. Branding (SEO, Contact, Copyright) ---
        if (settings.branding) {
            if (settings.branding.websiteTitle) document.title = settings.branding.websiteTitle;
            const logoText = document.querySelector('header .logo');
            // Update text logo if there's no logo image in the DOM
            if (logoText && !logoText.querySelector('img') && settings.branding.websiteTitle) {
                logoText.textContent = settings.branding.websiteTitle.split(' ')[0] || 'Store';
            }
        }
        if (settings.footer && settings.footer.copyright) {
            const copyRightEl = document.querySelector('.copyright-text');
            if (copyRightEl) copyRightEl.textContent = settings.footer.copyright;
        }

        // --- 6. Header Configuration ---
        if (settings.header) {
            const headerEl = document.querySelector('header');
            if (headerEl) {
                if (settings.header.borderThickness !== undefined) headerEl.style.borderBottomWidth = `${settings.header.borderThickness}px`;
                if (settings.header.fontSize) headerEl.style.fontSize = settings.header.fontSize;

                const stickyClass = settings.header.stickyHeader === 'always' ? 'header-sticky' : (settings.header.stickyHeader === 'on-scroll-up' ? 'header-sticky-scroll' : '');
                headerEl.className = stickyClass;
            }

            const headerNav = document.querySelector('header nav');
            if (headerNav && settings.header.appearance) {
                headerNav.style.padding = settings.header.appearance.height === 'compact' ? '8px 0' : '14px 0';
                if (settings.header.appearance.width === 'page') {
                    headerNav.style.maxWidth = '1200px';
                    headerNav.style.margin = '0 auto';
                } else {
                    headerNav.style.maxWidth = 'none';
                    headerNav.style.margin = '';
                }
            }

            // Flex Ordering
            const logoPos = settings.header.logo?.position || 'center';
            const menuPos = settings.header.menu?.position || 'left';

            const logoOrder = logoPos === 'left' ? 1 : (logoPos === 'right' ? 3 : 2);
            const menuOrder = menuPos === 'left' ? 1 : (menuPos === 'right' ? 3 : 2);
            const iconsOrder = menuPos === 'right' ? 1 : 3;

            const logoEl = document.querySelector('header .logo');
            const linksEl = document.querySelector('header .nav-links');
            const iconsEl = document.querySelector('header .nav-icons');
            const hamburgerEl = document.querySelector('header .hamburger');

            if (logoEl) {
                logoEl.style.order = logoOrder;
                logoEl.style.textAlign = logoPos === 'center' ? 'center' : 'left';
                logoEl.style.flex = logoPos === 'center' ? '1' : 'none';
            }
            if (linksEl) linksEl.style.order = menuOrder;
            if (iconsEl) iconsEl.style.order = iconsOrder;
            if (hamburgerEl) hamburgerEl.style.order = menuOrder;
        }

        // --- 7. Featured Collection Layout ---
        if (settings.featuredCollection) {
            const fcContainer = document.getElementById('trail-favorites-container');
            const fcSection = document.getElementById('featured');
            if (fcContainer) {
                const cols = window.innerWidth <= 768 ? (settings.featuredCollection.mobileColumns || 2) : (settings.featuredCollection.columns || 4);
                fcContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                fcContainer.style.columnGap = `${settings.featuredCollection.horizontalGap || 20}px`;
                fcContainer.style.rowGap = `${settings.featuredCollection.verticalGap || 36}px`;
            }
            if (fcSection) {
                fcSection.style.paddingTop = `${settings.featuredCollection.paddingTop || 20}px`;
                fcSection.style.paddingBottom = `${settings.featuredCollection.paddingBottom || 72}px`;
                if (settings.featuredCollection.sectionWidth === 'page') {
                    fcSection.style.maxWidth = '1400px';
                    fcSection.style.margin = '0 auto';
                } else {
                    fcSection.style.maxWidth = 'none';
                }
                fcSection.style.textAlign = settings.featuredCollection.alignment || 'left';
            }
        }
    }
});
