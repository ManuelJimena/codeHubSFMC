import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 shadow-sm mt-8">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center text-sm text-gray-500 dark:text-gray-400">
          <span>©codeHubSFMC {currentYear} by ManuelJimena</span>
          <a
            href="https://github.com/ManuelJimena"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
            aria-label="GitHub profile"
          >
            <FaGithub className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;