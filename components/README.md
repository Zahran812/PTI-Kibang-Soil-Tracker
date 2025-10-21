# Sidebar Component

A responsive sidebar navigation component built with Next.js and Tailwind CSS.

## Features

- **Brand Section**: Displays logo with "Kibang" and "Soil Tracker" text
- **Navigation**: Interactive menu items with active states
- **Responsive Design**: Fixed width sidebar with proper spacing
- **TypeScript Support**: Fully typed with proper interfaces
- **Custom Styling**: Uses custom green color scheme matching the design

## Usage

```tsx
import Sidebar from "./components/Sidebar";

export default function Layout() {
  return (
    <div className="flex">
      <Sidebar activeItem="beranda" />
      <main className="flex-1">
        {/* Your main content */}
      </main>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeItem` | `"beranda" \| "riwayat"` | `"beranda"` | Sets which navigation item is active |

## Styling

The component uses custom CSS variables defined in `globals.css`:
- `--foundation-green-normal-active`: Primary green color (#28A428)
- `--foundation-green-dark-active`: Dark green for active states (#165C16)

## Demo

Visit `/sidebar-demo` to see the component in action.
