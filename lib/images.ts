/**
 * Central image path configuration.
 * To update any image, replace the file at the path listed below
 * and the change will reflect everywhere on the site automatically.
 *
 * PROFILE PHOTO
 *   → Place your headshot at: public/images/profile/isaac-profile.jpg
 *   → Recommended: 500×500 px minimum, square crop, centered face
 *   → Works for: website, WhatsApp profile, social media branding
 *
 * PROJECT SCREENSHOTS
 *   → Place screenshots at: public/images/projects/project-N.png
 *   → Recommended: 1200×630 px (16:9 ratio)
 *
 * CERTIFICATES
 *   → Place at: public/images/certificates/
 *
 * RESUME
 *   → Replace: public/resume.pdf
 */

export const IMAGES = {
  profile: "/images/profile/isaac-profile.jpg",

  projects: {
    1: "/images/projects/project-1.png",
    2: "/images/projects/project-2.png",
    3: "/images/projects/project-3.png",
    4: "/images/projects/project-4.png",
    5: "/images/projects/project-5.png",
    6: "/images/projects/project-6.png",
  },

  // Social preview image (used in OpenGraph / Twitter card)
  socialPreview: "/images/profile/isaac-profile.jpg",
} as const;

export const PROFILE_ALT = "Isaac L. Quelemine — Junior Software Engineer & Full Stack Developer";
