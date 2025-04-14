
import React, { useState, useEffect } from "react";
import { usePC } from "@/contexts/PCContext";
import PCCard from "./PCCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { searchPCs } from "@/lib/storage";
import { PC } from "@/lib/types";

const Dashboard = () => {
  const { loading: contextLoading, filteredPCs, searchQuery, setSearchQuery } = usePC();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PC[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(localSearch);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Set up debounce for search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(localSearch);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [localSearch]);

  // Perform search when debounced search term changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.trim() === "") {
        setSearchResults([]);
        setSearchQuery("");
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchPCs(debouncedSearchTerm);
        setSearchResults(results);
        setSearchQuery(debouncedSearchTerm);
      } catch (error) {
        console.error("Error searching PCs:", error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, setSearchQuery]);

  const handleClearSearch = () => {
    setLocalSearch("");
    setSearchResults([]);
    setSearchQuery("");
  };

  const displayedPCs = localSearch.trim() === "" ? filteredPCs : searchResults;
  const loading = contextLoading || isSearching;

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">PC Dashboard</h1>
        <div className="w-full sm:w-auto flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by PC name, owner, IP or MAC"
              className="pl-8 w-full sm:w-64"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          {localSearch && (
            <Button type="button" variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayedPCs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedPCs.map((pc) => (
            <PCCard key={pc.id} pc={pc} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No matching PCs found</h2>
          <p className="text-muted-foreground mb-6">
            Try a different search term or clear the search.
          </p>
          <Button onClick={handleClearSearch}>Clear Search</Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No PCs added yet</h2>
          <p className="text-muted-foreground mb-6">
            Start tracking your PCs by adding your first one.
          </p>
          <Link to="/">
            <Button>Add PC</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
