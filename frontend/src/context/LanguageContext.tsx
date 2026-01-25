import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta' | 'hi';

interface Translations {
    heroTitle: string;
    heroSubtitle: string;
    planVisit: string;
    viewRegulations: string;
    missionTitle: string;
    missionDesc: string;
    impactTitle: string;
    login: string;
    register: string;
    dashboard: string;
    regulatoryImpact: string;
    ourMission: string;
    exploreHeritage: string;
    discoverNilgiris: string;
    worldCurated: string;
    searchPlaceholder: string;
    viewDetails: string;
    noDestinations: string;
    signIn: string;
}

const translations: Record<Language, Translations> = {
    en: {
        heroTitle: "Balancing Economic Benefits with Ecological Sustainability",
        heroSubtitle: "We implement scientifically grounded carrying capacities to mitigate strain on local ecosystems.",
        planVisit: "Plan Your Visit",
        viewRegulations: "View Regulations",
        missionTitle: "Preserving Nature, Enhancing Experience",
        missionDesc: "We are redefining tourism in the Nilgiris. By intelligently managing visitor flows, we protect our fragile ecosystem.",
        impactTitle: "From Overcrowding to Harmony",
        login: "Log In",
        register: "Register",
        dashboard: "Go to Dashboard",
        regulatoryImpact: "Regulatory Impact",
        ourMission: "Our Mission",
        exploreHeritage: "Explore Local Heritage",
        discoverNilgiris: "Discover the",
        worldCurated: "Explore our curated selection of sustainable tourism destinations. We balance visitor experiences with ecological preservation.",
        searchPlaceholder: "Search by name, location or type...",
        viewDetails: "View Details",
        noDestinations: "No Destinations Found",
        signIn: "Sign In"
    },
    ta: {
        heroTitle: "பொருளாதார நன்மைகளை சூழலியல் நிலைத்தன்மையுடன் சமநிலைப்படுத்துதல்",
        heroSubtitle: "உள்ளூர் சுற்றுச்சூழல் அமைப்புகளின் அழுத்தத்தைக் குறைக்க அறிவியல் ரீதியான வழிமுறைகளை நாங்கள் செயல்படுத்துகிறோம்.",
        planVisit: "உங்கள் பயணத்தைத் திட்டமிடுங்கள்",
        viewRegulations: "விதிமுறைகளைப் பார்க்கவும்",
        missionTitle: "இயற்கையைப் பாதுகாத்தல், அனுபவத்தை மேம்படுத்துதல்",
        missionDesc: "நாங்கள் நீலகிரி சுற்றுலாவை மறுவரையறை செய்கிறோம். பார்வையாளர்களின் வருகையை புத்திசாலித்தனமாக நிர்வகிப்பதன் மூலம் சுற்றுச்சூழலைப் பாதுகாக்கிறோம்.",
        impactTitle: "கூட்ட நெரிசலில் இருந்து அமைதிக்கு",
        login: "உள்நுழைய",
        register: "பதிவு செய்ய",
        dashboard: "முகப்புப் பக்கத்திற்குச் செல்லவும்",
        regulatoryImpact: "ஒழுங்குமுறை தாக்கம்",
        ourMission: "எங்கள் நோக்கம்",
        exploreHeritage: "உள்ளூர் பாரம்பரியத்தை ஆராயுங்கள்",
        discoverNilgiris: "நீலகிரியை கண்டறியவும்",
        worldCurated: "எங்களின் முதன்மையான சூழலியல் சுற்றுலா இடங்களை ஆராயுங்கள். பார்வையாளர் அனுபவத்தையும் இயற்கை பாதுகாப்பையும் நாங்கள் சமநிலைப்படுத்துகிறோம்.",
        searchPlaceholder: "பெயர், இடம் அல்லது வகையை தேடவும்...",
        viewDetails: "விவரங்களைப் பார்க்க",
        noDestinations: "இடங்கள் எதுவும் கிடைக்கவில்லை",
        signIn: "உள்நுழைய"
    },
    hi: {
        heroTitle: "पारिस्थितिक स्थिरता के साथ आर्थिक लाभों को संतुलित करना",
        heroSubtitle: "हम स्थानीय पारिस्थितिक तंत्र पर दबाव कम करने के लिए वैज्ञानिक रूप से आधारित क्षमता कार्यान्वयन करते हैं।",
        planVisit: "अपनी यात्रा की योजना बनाएं",
        viewRegulations: "नियम देखें",
        missionTitle: "प्रकृति का संरक्षण, अनुभव में वृद्धि",
        missionDesc: "हम नीलगिरी में पर्यटन को फिर से परिभाषित कर रहे हैं। आगंतुकों के प्रवाह को बुद्धिमानी से प्रबंधित करके, हम अपने नाजुक पारिस्थितिकी तंत्र की रक्षा करते हैं।",
        impactTitle: "भीड़भाड़ से सद्भाव की ओर",
        login: "लॉग इन करें",
        register: "पंजीकरण करें",
        dashboard: "डैशबोर्ड पर जाएं",
        regulatoryImpact: "विनियामक प्रभाव",
        ourMission: "हमारा लक्ष्य",
        exploreHeritage: "स्थानीय विरासत का अन्वेषण करें",
        discoverNilgiris: "नीलगिरी की खोज करें",
        worldCurated: "हमारे सतत पर्यटन स्थलों का चयन देखें। हम आगंतुक अनुभवों और पारिस्थितिक संरक्षण को संतुलित करते हैं।",
        searchPlaceholder: "नाम, स्थान या प्रकार से खोजें...",
        viewDetails: "विवरण देखें",
        noDestinations: "कोई गंतव्य नहीं मिला",
        signIn: "साइन इन करें"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
