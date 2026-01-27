import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ItineraryItem {
    id: string; // destinationId
    name: string;
    visitDate: Date;
    visitors: number;
    pricePerPerson: number;
    zoneId?: string;
    image?: string;
}

interface ItineraryContextType {
    items: ItineraryItem[];
    addToItinerary: (item: ItineraryItem) => void;
    removeFromItinerary: (id: string) => void;
    clearItinerary: () => void;
    totalAmount: number;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<ItineraryItem[]>(() => {
        const saved = localStorage.getItem('itinerary');
        return saved ? JSON.parse(saved, (key, value) => {
            if (key === 'visitDate') return new Date(value);
            return value;
        }) : [];
    });

    useEffect(() => {
        localStorage.setItem('itinerary', JSON.stringify(items));
    }, [items]);

    const addToItinerary = (item: ItineraryItem) => {
        setItems(prev => {
            // Prevent duplicates
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFromItinerary = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const clearItinerary = () => {
        setItems([]);
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.pricePerPerson * item.visitors), 0);

    return (
        <ItineraryContext.Provider value={{ items, addToItinerary, removeFromItinerary, clearItinerary, totalAmount }}>
            {children}
        </ItineraryContext.Provider>
    );
};

export const useItinerary = () => {
    const context = useContext(ItineraryContext);
    if (!context) {
        throw new Error('useItinerary must be used within an ItineraryProvider');
    }
    return context;
};
