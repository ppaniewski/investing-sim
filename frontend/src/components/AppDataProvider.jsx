import { createContext, useEffect, useState } from "react";

export const AppDataContext = createContext();

export default function AppDataProvider({ children }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        async function loadData() {
            const res = await fetch("/api/stocks/all");
            if (!res.ok) {
                console.error("Failed to fetch stock list data");
                return;
            }
            const json = await res.json();

            // console.log("AppDataProvider fetched stocks");
            setData(json); 
        }
        loadData();
    }, []);

    return(
        <AppDataContext.Provider value={data}>
            {children}
        </AppDataContext.Provider>
    );
}