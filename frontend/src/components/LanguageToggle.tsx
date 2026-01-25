import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="relative group">
            <button
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"
                aria-label="Change Language"
            >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase">{language}</span>
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform z-50">
                <div className="py-1">
                    <button
                        onClick={() => setLanguage('en')}
                        className={`block w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('ta')}
                        className={`block w-full text-left px-4 py-2 text-sm ${language === 'ta' ? 'text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        தமிழ் (Tamil)
                    </button>
                    <button
                        onClick={() => setLanguage('hi')}
                        className={`block w-full text-left px-4 py-2 text-sm ${language === 'hi' ? 'text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        हिंदी (Hindi)
                    </button>
                </div>
            </div>
        </div>
    );
}
