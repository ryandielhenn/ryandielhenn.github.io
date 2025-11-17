# Terminal-Themed Portfolio

**Live site:** [ryandielhenn.github.io](https://ryandielhenn.github.io)

<p align="center">
  <img src="./public/screenshot.png" alt="Terminal Portfolio Demo" width="600"/>
</p>

## Local Development

```bash
git clone https://github.com/ryandielhenn/ryandielhenn.github.io.git
cd ryandielhenn.github.io
npm install
npm run dev
```

## Key Features Added

### Interactive Terminal Emulator
- **Full-screen terminal interface** with authentic Unix-style appearance
- **Realistic terminal window** with close/minimize/maximize buttons and custom title bar
- **Command-line navigation** using `ls -la` and `cd` commands
- **File system simulation** with proper permissions, file sizes, and dates
- **Smooth animations** and cursor blinking effects
- **Responsive design** that works seamlessly on desktop and mobile

## Content Organization

### Terminal File Structure


### Content Sections
- **About**: Personal bio, skills, and expertise areas
- **Experience**: Professional work history with detailed achievements (including split Confluent entries)
- **Projects**: Portfolio projects including new additions (itsh, GeoPresence)
- **Education**: Academic background and achievements
- **Connect**: Social links (LinkedIn, GitHub, Email) with usernames

## Portfolio Structure


```bash
.
├── README.md
├── LICENSE.md
├── package.json
├── astro.config.mjs
├── public
│   ├── favicon.svg
│   └── ryan_dielhenn_resume.pdf
└── src
    ├── pages/
    ├── components/
    │   ├── TerminalNav.astro
    │   └── TerminalContent/  # About, Connect, Education, Experience, Projects
    ├── styles/
    └── config.ts
```

## License

Adapted from [Ryan Fitzgerald’s DevPortfolio](https://github.com/RyanFitzgerald/devportfolio) – MIT License.
