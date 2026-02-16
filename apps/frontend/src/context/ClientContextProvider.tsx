"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";

interface ClientContextProps {
    user: any;
    isPaidUser: boolean;
    isPaid: boolean;
    isLoading: boolean;
    isError: boolean;
    mutate: () => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (mobileMenuOpen: boolean) => void;
}

const ClientContext = createContext<ClientContextProps | undefined>(undefined);

export const useUserData = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error("useClientContext must be used within a ClientContextProvider");
    }
    return context;
};

const ClientContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading, isError, mutate } = useUser();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isPaidUser = useMemo(() => {
        return (user?.plan?.status === 'ACTIVE' || user?.plan?.status === 'TRIAL') && user?.plan?.endAt && new Date(user?.plan?.endAt) > new Date();
    }, [user]);

    const isPaid = useMemo(() => {
        return user?.plan?.status === 'ACTIVE';
    }, [user]);

    const value = useMemo(
        () => ({
            user,
            isPaidUser,
            isPaid,
            isLoading,
            isError,
            mutate,
            mobileMenuOpen,
            setMobileMenuOpen,
        }),
        [user, isLoading, isError, mutate, mobileMenuOpen, setMobileMenuOpen, isPaidUser, isPaid]
    );

    return (
        <ClientContext.Provider value={value}>
            {children}
        </ClientContext.Provider>
    );
};

export default ClientContextProvider;
