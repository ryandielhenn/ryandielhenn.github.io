# Ryan Dielhenn – Portfolio

Source code for my personal website, built with [Astro](https://astro.build/), [Tailwind CSS](https://tailwindcss.com/), and [Typescript](https://www.typescriptlang.org).

**Live site:** [ryandielhenn.github.io](https://ryandielhenn.github.io)  
*Showcasing my work in software engineering, distributed systems, and machine learning.*

## Local Development

```bash
git clone https://github.com/ryandielhenn/ryandielhenn.github.io.git
cd ryandielhenn.github.io
npm install
npm run dev
```

## License

Adapted from [Ryan Fitzgerald’s DevPortfolio](https://github.com/RyanFitzgerald/devportfolio) – MIT License.


# Terminal-Themed Portfolio Refactor

## Overview
Complete redesign of the portfolio website to feature an interactive terminal emulator as the primary navigation and content display system. This refactor transforms the traditional web portfolio into an immersive command-line experience while maintaining all original functionality.

## Key Features Added

### Interactive Terminal Emulator
- **Full-screen terminal interface** with authentic Unix-style appearance
- **Realistic terminal window** with close/minimize/maximize buttons and custom title bar
- **Command-line navigation** using `ls -la` and `cd` commands
- **File system simulation** with proper permissions, file sizes, and dates
- **Smooth animations** and cursor blinking effects
- **Responsive design** that works seamlessly on desktop and mobile

### Enhanced User Experience
- **Direct content access** - clicking folders immediately shows content via `cat` commands
- **Intuitive back navigation** with `cd ..` buttons
- **Terminal-only scrolling** - eliminated browser scrollbar conflicts
- **Consistent theming** across all sections with terminal aesthetics
- **Social links integration** moved to footer for cleaner terminal experience

## Content Organization

### Terminal File Structure


### Content Sections
- **About**: Personal bio, skills, and expertise areas
- **Experience**: Professional work history with detailed achievements
- **Projects**: Portfolio projects including new additions (itsh, GeoPresence)
- **Education**: Academic background and achievements

## Technical Changes

### Files Removed
- `src/pages/about.astro` - Content integrated into terminal
- `src/pages/experience.astro` - Content integrated into terminal  
- `src/pages/projects.astro` - Content integrated into terminal
- `src/pages/education.astro` - Content integrated into terminal
- `src/components/Header.astro` - Replaced by terminal interface
- `src/components/About.astro` - Content embedded in terminal
- `src/components/Experience.astro` - Content embedded in terminal
- `src/components/Projects.astro` - Content embedded in terminal
- `src/components/Education.astro` - Content embedded in terminal

### Files Modified
- **`src/components/MobileNav.astro`** - Complete rewrite as terminal emulator
- **`src/components/Hero.astro`** - Simplified to terminal container only
- **`src/pages/index.astro`** - Streamlined to Hero + Footer only
- **`src/config.ts`** - Added new projects (itsh, GeoPresence)
- **`src/styles/global.css`** - Stripped down to essential styles
- **`public/js/animations.js`** - Simplified to minimal functionality

### Files Added
- **`src/components/Footer.astro`** - New footer with social links

## Design Improvements

### Terminal Aesthetics
- **Authentic terminal colors** with proper contrast ratios
- **Monospace font** (IBM Plex Mono) for authentic feel
- **Proper file permissions** display (drwxr-xr-x, -rw-r--r--)
- **Smooth hover effects** and interactive feedback

### Responsive Design
- **Mobile-optimized** terminal interface
- **Flexible sizing** that adapts to screen dimensions
- **Touch-friendly** navigation for mobile devices
- **Consistent experience** across all device sizes

## Mobile Experience
- **Full terminal functionality** on mobile devices
- **Touch-optimized** file/folder interactions
- **Responsive terminal sizing** for small screens

## Performance Optimizations
- **Reduced bundle size** by removing unused components
- **Simplified CSS** with minimal animations
- **Streamlined JavaScript** for faster loading
- **Optimized asset loading** for better performance

## User Journey
1. **Landing**: Users see authentic terminal with file listing
2. **Navigation**: Click folders to explore content sections
3. **Content**: View detailed information via `cat` commands
4. **Return**: Use `cd ..` to navigate back to main directory
5. **Download**: Click resume.pdf for direct download
6. **Connect**: Access social links in footer

## Testing
- Desktop terminal functionality
- Mobile responsive design
- All content sections accessible
- Back navigation working
- Resume download functional
- Social links operational
- Cross-browser compatibility

## Impact
- **Reduced complexity** by consolidating navigation
- **Streamlined codebase** with 50% fewer files
- **Faster load times** with optimized assets
