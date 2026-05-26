/* ============================================
   Works Page — JavaScript
   ============================================ */

// --- Loader ---
const loader = document.getElementById("loader");
const loaderProgressBar = document.getElementById("loader-progress-bar");
const loaderText = document.getElementById("loader-text");

let progress = 0;
const loaderInterval = setInterval(() => {
  progress += Math.random() * 15 + 5;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loaderInterval);
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.style.overflow = "";
    }, 400);
  }
  loaderProgressBar.style.width = `${progress}%`;
  loaderText.textContent = Math.floor(progress);
}, 60);

document.body.style.overflow = "hidden";

// --- Custom Cursor ---
const cursor = document.getElementById("cursor");
const cursorFollower = document.getElementById("cursor-follower");

let mouseX = 0,
  mouseY = 0;
let followerX = 0,
  followerY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = `${mouseX}px`;
  cursor.style.top = `${mouseY}px`;
});

function animateCursor() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  cursorFollower.style.left = `${followerX}px`;
  cursorFollower.style.top = `${followerY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects
const hoverTargets = document.querySelectorAll(
  "a, button, .work-item, .service-row",
);
hoverTargets.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.classList.add("active");
    cursorFollower.classList.add("active");
  });
  el.addEventListener("mouseleave", () => {
    cursor.classList.remove("active");
    cursorFollower.classList.remove("active");
  });
});

// --- Navigation ---
const nav = document.getElementById("nav");
const navMenuBtn = document.getElementById("nav-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

window.addEventListener("scroll", () => {
  if (window.scrollY > 80) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

navMenuBtn.addEventListener("click", () => {
  navMenuBtn.classList.toggle("active");
  mobileMenu.classList.toggle("active");
  document.body.style.overflow = mobileMenu.classList.contains("active")
    ? "hidden"
    : "";
});

// Close mobile menu on link click
document.querySelectorAll(".mobile-menu-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenuBtn.classList.remove("active");
    mobileMenu.classList.remove("active");
    document.body.style.overflow = "";
  });
});

// --- Reveal on Scroll (Intersection Observer) ---
const revealElements = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px",
  },
);

revealElements.forEach((el) => revealObserver.observe(el));

// --- Initialize Works Page dynamically ---
import { loadWorksData, renderWorkCard } from "./data.js";

async function initWorksPage() {
  const worksGrid = document.getElementById("works-grid");
  if (!worksGrid) return;
  
  const worksDataList = await loadWorksData();
  
  let html = "";
  worksDataList.forEach((work, index) => {
    // Add large class dynamically based on index pattern (e.g. 2, 6, 11) to keep the varied layout
    const isLargePattern = [2, 6, 11].includes(index % 12);
    // Render HTML directly but adjust paths for local (data.js returns absolute paths relative to root)
    // Actually renderWorkCard handles it by using BASE.
    let cardHTML = renderWorkCard(work, isLargePattern);
    
    // In works/index.html we shouldn't have nested base path if it's already there, but renderWorkCard prepends BASE.
    // That's fine since we're in /works/. BASE is /. So /works/detail.html is correct.
    
    html += cardHTML;
  });
  
  worksGrid.innerHTML = html;
  
  // Re-observe items for reveal animation
  const newWorkItems = worksGrid.querySelectorAll(".work-item");
  newWorkItems.forEach((el) => {
    revealObserver.observe(el);
  });

  // Re-apply hover animations
  const hoverTargets = worksGrid.querySelectorAll(".work-item");
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("active");
      cursorFollower.classList.add("active");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("active");
      cursorFollower.classList.remove("active");
    });
  });

  // Re-apply hover scale transformation logic
  newWorkItems.forEach((item) => {
    const image = item.querySelector(".work-image");
    if (image) {
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        image.style.transform = `scale(1.03) translate(${(x - 0.5) * -6}px, ${(y - 0.5) * -6}px)`;
      });

      item.addEventListener("mouseleave", () => {
        image.style.transform = "";
      });
    }
  });

  // Filter initialization
  const filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length > 0) {
    const freshWorkItems = worksGrid.querySelectorAll(".work-item");
    filterBtns.forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener("click", () => {
        const filter = newBtn.getAttribute("data-filter");

        // Update active state
        const updatedBtns = document.querySelectorAll(".filter-btn");
        updatedBtns.forEach((b) => b.classList.remove("active"));
        newBtn.classList.add("active");

        // Filter items
        freshWorkItems.forEach((item) => {
          const category = item.getAttribute("data-category");
          if (filter === "all" || category === filter) {
            item.classList.remove("hidden");
            item.style.position = "";
          } else {
            item.classList.add("hidden");
            setTimeout(() => {
              if (item.classList.contains("hidden")) {
                item.style.position = "absolute";
              }
            }, 500);
          }
        });
      });
    });
  }
}

// Call init function on load
document.addEventListener("DOMContentLoaded", () => {
  initWorksPage();
});
