import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function SidebarDemo() {
  return (
    <div className="flex min-h-screen">
      <Sidebar activeItem="beranda" />
      <main className="flex-1 bg-gray-50">
        <Header />
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Sidebar Demo</h1>
          <p className="text-gray-600">
            This is a demo page showcasing the Sidebar component. The sidebar is fully responsive
            and matches the provided design with proper Tailwind CSS styling.
          </p>
          <div className="mt-6 space-y-2">
            <p><strong>Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Custom green color scheme matching the design</li>
              <li>Active state for navigation items</li>
              <li>Responsive design with proper spacing</li>
              <li>Icon integration with Next.js Image component</li>
              <li>TypeScript support with proper prop types</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
