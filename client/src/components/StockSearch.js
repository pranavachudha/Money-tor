import { useEffect, useState } from "react";

function StockSearch() {

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState(null);

    useEffect(() => {
        if (!query){
            return
        }

        const timer = setTimeout(() => {
            fetchSuggestions(query);
        }, 500)
    }, [query]);

    const fetchSuggestions = async (query) => {
            const response = await fetch(`http://localhost:5000/api/stocks/search?q=${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setSuggestions(data);
    };

    const handleQuery = (event) => {

    }

    return (
        <>
            <form></form>
        </>
    )

}