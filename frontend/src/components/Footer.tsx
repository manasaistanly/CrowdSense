
export default function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <a
                        href="https://www.linkedin.com/in/manasai-stanly-j-028202252/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <span>Designed and Developed by Stanly</span>
                    </a>

                    <a
                        href="mailto:manasaistanly0@gmail.com"
                        className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-500 dark:hover:text-primary-400 transition-colors"
                    >
                        manasaistanly0@gmail.com
                    </a>

                    <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                        &copy; {new Date().getFullYear()} SustainaTour Nilgiris. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
