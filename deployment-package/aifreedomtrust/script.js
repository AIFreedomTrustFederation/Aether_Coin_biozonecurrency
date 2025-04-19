document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('button.md\\:hidden');
  const mobileMenu = document.createElement('div');
  
  mobileMenu.classList.add(
    'fixed', 'inset-0', 'bg-dark-900', 'bg-opacity-95', 'z-50', 
    'flex', 'flex-col', 'items-center', 'justify-center',
    'transform', 'transition-transform', 'duration-300', 'ease-in-out', 'translate-x-full'
  );
  
  mobileMenu.innerHTML = `
    <button class="absolute top-6 right-4 text-white">
      <i class="ph ph-x text-2xl"></i>
    </button>
    <div class="flex flex-col items-center space-y-8 text-xl">
      <a href="#about" class="text-white hover:text-forest-300 transition-colors">About</a>
      <a href="#validators" class="text-white hover:text-forest-300 transition-colors">Validators</a>
      <a href="#iul" class="text-white hover:text-forest-300 transition-colors">IUL Framework</a>
      <a href="#contact" class="text-white hover:text-forest-300 transition-colors">Contact</a>
    </div>
  `;
  
  document.body.appendChild(mobileMenu);
  
  const closeBtn = mobileMenu.querySelector('button');
  
  menuToggle.addEventListener('click', function() {
    mobileMenu.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
  });
  
  closeBtn.addEventListener('click', function() {
    mobileMenu.classList.add('translate-x-full');
    document.body.classList.remove('overflow-hidden');
  });
  
  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    });
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Animate elements when they come into view
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementPosition < windowHeight - 100) {
        element.classList.add('animated');
      }
    });
  };
  
  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Run once on load
  
  // Form submission handling (prevent default for demo)
  const contactForm = document.querySelector('form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const formData = new FormData(this);
      const formValues = Object.fromEntries(formData.entries());
      
      // Simple validation
      let isValid = true;
      for (const [key, value] of Object.entries(formValues)) {
        if (!value) {
          isValid = false;
          const input = this.querySelector(`#${key}`);
          input.classList.add('border-red-500');
        }
      }
      
      if (isValid) {
        // In a real implementation, you would send this data to a server
        console.log('Form submitted with:', formValues);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.classList.add(
          'bg-forest-900', 'text-white', 'p-4', 'rounded-lg', 'text-center',
          'absolute', 'inset-0', 'flex', 'items-center', 'justify-center'
        );
        successMessage.innerHTML = `
          <div>
            <i class="ph-check-circle text-4xl text-forest-400 mb-4 block"></i>
            <h3 class="text-xl font-medium mb-2">Message Sent!</h3>
            <p>Thank you for reaching out. We'll be in touch soon.</p>
          </div>
        `;
        
        const formContainer = contactForm.parentElement;
        formContainer.style.position = 'relative';
        formContainer.appendChild(successMessage);
        
        // Reset form
        this.reset();
        
        // Remove success message after a few seconds
        setTimeout(() => {
          successMessage.remove();
        }, 5000);
      }
    });
    
    // Clear validation styling on input
    contactForm.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('focus', function() {
        this.classList.remove('border-red-500');
      });
    });
  }
});