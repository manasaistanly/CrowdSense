
export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center text-sm">
                    <a
                        href="https://www.linkedin.com/in/manasai-stanly-j-028202252/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        Designed by Stanly
                    </a>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                    <a
                        href="mailto:manasaistanly0@gmail.com"
                        className="text-gray-500 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400 transition-colors"
                    >
                        manasaistanly0@gmail.com
                    </a>
                    <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                    <div className="text-gray-400 dark:text-gray-600">
                        &copy; {new Date().getFullYear()} SustainaTour
                    </div>
                </div>
            </div>
        </footer>
    );
}
