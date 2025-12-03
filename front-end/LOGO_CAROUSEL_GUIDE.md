# Logo Carousel Guide

## How to Add Your Logo Images

### Option 1: Using Images in the `public` Folder (Recommended)

1. **Add your logo images** to the `front-end/public/` folder:
   ```
   front-end/
   └── public/
       ├── logo-fitness.png
       ├── logo-nutrition.png
       ├── logo-wellness.png
       ├── logo-strength.png
       ├── logo-health.png
       └── logo-progress.png
   ```

2. **Update the logos array** in `src/App.tsx`:
   ```typescript
   const logos = [
     { name: 'Fitness', image: '/logo-fitness.png' },
     { name: 'Nutrition', image: '/logo-nutrition.png' },
     // ... etc
   ]
   ```

### Option 2: Using Images in the `src/assets` Folder

1. **Add your logo images** to `front-end/src/assets/logos/`:
   ```
   front-end/
   └── src/
       └── assets/
           └── logos/
               ├── fitness.png
               ├── nutrition.png
               └── ...
   ```

2. **Import and use them** in `src/App.tsx`:
   ```typescript
   import fitnessLogo from './assets/logos/fitness.png'
   import nutritionLogo from './assets/logos/nutrition.png'
   // ... etc
   
   const logos = [
     { name: 'Fitness', image: fitnessLogo },
     { name: 'Nutrition', image: nutritionLogo },
     // ... etc
   ]
   ```

### Option 3: Using External URLs

If your logos are hosted online:

```typescript
const logos = [
  { name: 'Fitness', image: 'https://example.com/logos/fitness.png' },
  { name: 'Nutrition', image: 'https://example.com/logos/nutrition.png' },
  // ... etc
]
```

### Option 4: Using Placeholder Images (For Testing)

You can use placeholder image services:

```typescript
const logos = [
  { name: 'Fitness', image: 'https://via.placeholder.com/150x60/667eea/ffffff?text=Fitness' },
  { name: 'Nutrition', image: 'https://via.placeholder.com/150x60/764ba2/ffffff?text=Nutrition' },
  // ... etc
]
```

## Logo Image Requirements

- **Recommended size**: 150px - 200px width, 60px - 80px height
- **Format**: PNG (with transparency) or SVG (best for logos)
- **Aspect ratio**: Keep logos consistent for better appearance
- **Background**: Transparent backgrounds work best

## Customizing the Carousel

### Change Carousel Speed

In `src/App.css`, modify the animation duration:

```css
.carousel-track {
  animation: scroll 30s linear infinite; /* Change 30s to adjust speed */
}
```

### Change Logo Size

In `src/App.css`, modify:

```css
.carousel-logo {
  max-height: 60px;  /* Adjust height */
  max-width: 120px;  /* Adjust width */
}
```

### Add More Logos

Simply add more items to the `logos` array in `src/App.tsx`:

```typescript
const logos = [
  // ... existing logos
  { name: 'New Logo', image: '/logo-new.png' },
]
```

The carousel will automatically duplicate them for seamless looping.

## Fallback Behavior

If an image fails to load, the carousel will automatically show the logo name as text, so your carousel will always display something even if images are missing.

