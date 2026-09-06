export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="max-w-7xl mx-auto text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Quiz Platform. All rights reserved.
      </div>
    </footer>
  );
}
