document.addEventListener('DOMContentLoaded', () => {
    const bars = document.querySelectorAll('.bar');

    // Animate bars on load
    setTimeout(() => {
        bars.forEach((bar, index) => {
            if (bar.classList.contains('h-40')) {
                bar.style.height = '0%';
                setTimeout(() => bar.style.height = '40%', 100);
            }
            if (bar.classList.contains('h-60')) {
                bar.style.height = '0%';
                setTimeout(() => bar.style.height = '60%', 300);
            }
            if (bar.classList.contains('h-80')) {
                bar.style.height = '0%';
                setTimeout(() => bar.style.height = '80%', 500);
            }
            if (bar.classList.contains('h-100')) {
                bar.style.height = '0%';
                setTimeout(() => bar.style.height = '100%', 700);
            }
        });
    }, 500);

    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Hero headline/subtext rotation — gym owner message, then individual member message
    const heroCopy = document.getElementById('heroCopy');
    const heroHeadline = document.getElementById('heroHeadline');
    const heroSubtext = document.getElementById('heroSubtext');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (heroCopy && heroHeadline && heroSubtext && !prefersReducedMotion) {
        const audiences = [
            {
                headline: 'Empower Your <span class="highlight">Gym\'s Future</span>.',
                subtext: 'From seamless member management and billing to real-time business insights, GymForge gives gym owners everything they need to run and grow their business.'
            },
            {
                headline: 'Own Your <span class="highlight">Fitness Journey</span>.',
                subtext: 'Log every workout, track your meals, and watch your progress add up. GymForge gives you a personal training experience built right into your gym membership.'
            }
        ];

        let audienceIndex = 0;
        const FADE_MS = 400;
        const DISPLAY_MS = 4200;

        setInterval(() => {
            heroCopy.classList.add('fade-out');

            setTimeout(() => {
                audienceIndex = (audienceIndex + 1) % audiences.length;
                heroHeadline.innerHTML = audiences[audienceIndex].headline;
                heroSubtext.textContent = audiences[audienceIndex].subtext;
                heroCopy.classList.remove('fade-out');
            }, FADE_MS);
        }, DISPLAY_MS);
    }

    // Pricing billing toggle — plans are priced yearly; the monthly view is
    // just that same yearly price divided by 12, not a separate rate.
    const billingSwitch = document.getElementById('billingSwitch');
    const billingLabels = document.querySelectorAll('.billing-label');
    const priceAmounts = document.querySelectorAll('.pricing-price .amount[data-yearly]');
    const periodEls = document.querySelectorAll('.pricing-price .period');
    const billingCycleTexts = document.querySelectorAll('.billing-cycle-text');
    const formatINR = n => n.toLocaleString('en-IN');

    if (billingSwitch) {
        billingSwitch.addEventListener('click', () => {
            const showMonthly = billingSwitch.getAttribute('aria-checked') !== 'true';
            billingSwitch.setAttribute('aria-checked', String(showMonthly));

            billingLabels.forEach(label => {
                const matches = (label.dataset.billing === 'monthly') === showMonthly;
                label.classList.toggle('active', matches);
            });

            priceAmounts.forEach(amount => {
                const yearly = parseInt(amount.dataset.yearly, 10);
                amount.textContent = showMonthly ? formatINR(Math.round(yearly / 12)) : formatINR(yearly);
            });

            periodEls.forEach(period => {
                period.textContent = showMonthly ? '/month' : '/year';
            });

            billingCycleTexts.forEach(text => {
                const yearly = parseInt(text.closest('.pricing-card')?.querySelector('.amount[data-yearly]')?.dataset.yearly, 10);
                text.textContent = showMonthly && yearly
                    ? `≈ ₹${formatINR(yearly)} billed yearly`
                    : 'billed yearly';
            });
        });
    }
});
