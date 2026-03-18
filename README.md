# Agrotek - Smart Agriculture Technologies Website

Link-https://agrotek-solutions.netlify.app/

A modern, responsive website for Agrotek, a company dedicated to innovative farming technologies that empower farmers with smart solutions for sustainable agriculture.

## Features

### Homepage
- Large, vibrant hero section with compelling headline
- Mission statement and company introduction
- Feature preview cards highlighting key benefits
- Prominent call-to-action buttons
- Sticky navigation menu

### Solutions Page
- Showcase of AI-powered tools:
  - Smart Irrigation Systems
  - AI Pest Detection
  - Yield Prediction
  - Autonomous Drones
  - Climate Monitoring
  - Farm Management Platform
- Visual icons and detailed descriptions
- Benefits listed for each solution

### Products Page
- Detailed product listings with:
  - Hardware products (IoT Sensors, Drones, Irrigation Controllers)
  - Software products (Mobile App, Dashboard, AI Analyzer)
  - Specifications and features
  - Request quote/demo buttons

### Resources Page
- Blog articles on sustainable farming
- Technology updates and case studies
- Downloadable guides and manuals
- How-to resources for farmers

### About Us Page
- Company story and vision
- Mission and values
- Leadership team profiles
- Partner logos
- Company statistics

### Contact Page
- Contact information (email, phone, address)
- Contact form with validation
- Social media links
- Map placeholder for office location

## Design Elements

- **Color Palette**: Earth-inspired with various greens (#2d5016, #4a7c2a, #6b9f4a), browns (#8b6f47, #a68b5b), and natural tones
- **Typography**: Clean, modern fonts (Poppins for headings, Roboto for body text)
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Scroll-triggered animations and hover effects
- **User-Friendly**: Intuitive navigation and clear call-to-actions

## Technologies Used

- HTML5
- CSS3 (with CSS Variables, Flexbox, Grid)
- JavaScript (Vanilla JS)
- Google Fonts (Poppins, Roboto)

## File Structure

```
Agrotek/
├── index.html          # Homepage
├── solutions.html      # Solutions page
├── products.html       # Products page
├── resources.html      # Resources/Blog page
├── about.html          # About Us page
├── contact.html        # Contact page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript for interactivity
└── README.md           # This file
```

## Getting Started

### Static-only mode

If you only want the marketing pages, you can open `index.html` directly.

### Full app mode (required for Login / Google Sign-in / Marketplace / Notifications)

This project includes a Node/Express backend (`server.js`) that serves `/api/*` routes. Static hosting (like GitHub Pages) will return **404** for `/api/*` unless you deploy the backend separately.

1. Install dependencies:

```bash
npm install
```

2. Run the server:

```bash
node server.js
```

3. Open the site from the backend origin:

- `http://localhost:3000/login.html`

### Deploying to GitHub Pages + external backend

1. Deploy the backend somewhere (Render/Railway/VPS) so it has a public URL like:
- `https://your-backend.example.com`

2. Configure the frontend API base URL:

- Add `?apiBase=https://your-backend.example.com` once (it will be saved in `localStorage`)

Example:
- `https://YOURNAME.github.io/YOURREPO/login.html?apiBase=https://your-backend.example.com`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-green: #2d5016;
    --secondary-green: #4a7c2a;
    /* ... */
}
```

### Content
All content can be easily edited in the respective HTML files.

### Images
Replace placeholder emojis with actual images by:
1. Adding image files to an `images/` folder
2. Replacing emoji placeholders with `<img>` tags

## Future Enhancements

- Integration with actual map service (Google Maps, Mapbox)
- Backend integration for contact form
- Image optimization and lazy loading
- Blog CMS integration
- E-commerce functionality for products
- User authentication for farmer accounts

## License

© 2026 AgroTech. All rights reserved.

