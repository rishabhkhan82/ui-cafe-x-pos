import { Component, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    const self = this;
    const themeToggle = document.getElementById('theme-toggle') as HTMLElement | null;
    const html = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.classList.toggle('dark', currentTheme === 'dark');

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const newTheme = html.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
      });
    }

    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const faqContainer = document.getElementById('faq-accordion');
    if (faqContainer) {
      const faqItems = Array.from(faqContainer.children);
      faqItems.forEach((item: Element) => {
        const button = item.querySelector('button');
        const panel = item.querySelector('button + div') as HTMLElement | null;
        if (!button || !panel) return;

        item.classList.remove('open');
        panel.style.maxHeight = '0px';

        button.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');

          faqItems.forEach((it: Element) => {
            it.classList.remove('open');
            const p = it.querySelector('button + div') as HTMLElement | null;
            if (p) p.style.maxHeight = '0px';
          });

          if (!isOpen) {
            item.classList.add('open');
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        });
      });
    }

    const accordionContainers = ['starter-accordion', 'pro-accordion', 'enterprise-accordion'];
    accordionContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const items = Array.from(container.children);
      items.forEach((item: Element) => {
        const button = item.querySelector('button');
        const panel = item.querySelector('button + div') as HTMLElement | null;
        if (!button || !panel) return;

        item.classList.remove('open');
        panel.style.maxHeight = '0px';

        button.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');

          items.forEach((it: Element) => {
            it.classList.remove('open');
            const p = it.querySelector('button + div') as HTMLElement | null;
            if (p) p.style.maxHeight = '0px';
          });

          if (!isOpen) {
            item.classList.add('open');
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        });
      });
    });

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle') as HTMLElement | null;
    const mobileMenu = document.getElementById('mobile-menu') as HTMLElement | null;
    const toggleIcon = mobileMenuToggle?.querySelector('i');

    if (mobileMenuToggle && mobileMenu && toggleIcon) {
      mobileMenuToggle.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');

        if (isHidden) {
          mobileMenu.classList.remove('hidden');
          toggleIcon.classList.remove('fa-bars');
          toggleIcon.classList.add('fa-times');
        } else {
          mobileMenu.classList.add('hidden');
          toggleIcon.classList.remove('fa-times');
          toggleIcon.classList.add('fa-bars');
        }
      });

      const mobileLinks = mobileMenu.querySelectorAll('a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          toggleIcon.classList.remove('fa-times');
          toggleIcon.classList.add('fa-bars');
        });
      });
    }

    const preRegisterForm = document.getElementById('pre-register-form');
    if (preRegisterForm) {
      preRegisterForm.addEventListener('submit', function (this: HTMLFormElement, e: Event) {
        e.preventDefault();

        const prerestaurant = (document.getElementById('pre-restaurant') as HTMLInputElement | null)?.value;
        const preownerName = (document.getElementById('pre-name') as HTMLInputElement | null)?.value;
        const premobile = (document.getElementById('pre-mobile') as HTMLInputElement | null)?.value;

        if (!prerestaurant || !preownerName || !premobile) {
          alert('Please fill in all required fields');
          return;
        }

        const submitBtn = this.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (!submitBtn) return;
        const originalText = submitBtn.innerHTML;

        const formData = new FormData(this);
        const object: Record<string, string> = {};
        formData.forEach((value, key) => {
          object[key] = value as string;
        });
        const json = JSON.stringify(object);
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Processing...';
        submitBtn.disabled = true;

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        })
          .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
              alert('🎉 Congratulations! Your free trial has been Enrolled. You will receive an SMS notification once Cafe-X is launched, along with further instructions for setup.');
              submitBtn.innerHTML = '🎉 Enrolled Successfully';
              submitBtn.disabled = true;
              document.getElementById('preRegisterModal')?.classList.add('hidden');
            } else {
              console.log(response);
              submitBtn.innerHTML = json.message;
              submitBtn.disabled = true;
            }
          })
          .catch(error => {
            console.log(error);
            submitBtn.innerHTML = '😢 Something went wrong!';
            submitBtn.disabled = true;
          })
          .then(function () {
            (document.getElementById('pre-register-form') as HTMLFormElement | null)?.reset();
            setTimeout(() => {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
            }, 3000);
          });
      });
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (this: HTMLFormElement, e: Event) {
        e.preventDefault();

        const name = this.querySelector('input[placeholder="Amit Patil"]') as HTMLInputElement | null;
        const email = this.querySelector('input[type="email"]') as HTMLInputElement | null;
        const restaurant = this.querySelector('input[placeholder="Cafe-X Bistro"]') as HTMLInputElement | null;
        const nameValue = name?.value || '';
        const emailValue = email?.value || '';
        const restaurantValue = restaurant?.value || '';

        if (!nameValue || !emailValue || !restaurantValue) {
          alert('Please fill in all required fields');
          return;
        }

        const submitBtn = this.querySelector('button[type="button"], button[type="submit"]') as HTMLButtonElement | null;
        if (!submitBtn) return;
        const originalText = submitBtn.innerHTML;

        const formData = new FormData(this);
        const object: Record<string, string> = {};
        formData.forEach((value, key) => {
          object[key] = value as string;
        });
        const json = JSON.stringify(object);

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-3"></i>Processing...';
        submitBtn.disabled = true;

        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        })
          .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
              alert('Thank you! Your demo request has been received. We will contact you soon.');
              submitBtn.innerHTML = '✅ Request Sent';
              submitBtn.disabled = true;
            } else {
              console.log(response);
              submitBtn.innerHTML = json.message;
              submitBtn.disabled = true;
            }
          })
          .catch(error => {
            console.log(error);
            submitBtn.innerHTML = '😢 Something went wrong!';
            submitBtn.disabled = true;
          })
          .then(function () {
            (document.getElementById('contact-form') as HTMLFormElement | null)?.reset();
            setTimeout(() => {
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
            }, 3000);
          });
      });
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        self.router.navigate(['/admin/login']);
      });
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    const faqContainer = document.getElementById('faq-accordion');
    if (faqContainer) {
      const openItem = faqContainer.querySelector('.open');
      if (!openItem) return;
      const openPanel = openItem.querySelector('button + div') as HTMLElement | null;
      if (openPanel) openPanel.style.maxHeight = openPanel.scrollHeight + 'px';
    }

    const accordionContainers = ['starter-accordion', 'pro-accordion', 'enterprise-accordion'];
    accordionContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (!container) return;
      const openItem = container.querySelector('.open');
      if (!openItem) return;
      const openPanel = openItem.querySelector('button + div') as HTMLElement | null;
      if (openPanel) openPanel.style.maxHeight = openPanel.scrollHeight + 'px';
    });
  }
}
