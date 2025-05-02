import Link from "next/link";
import { CustomIcon } from "./CustomIcon";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "./ui/input";
import { useState } from "react";
import { useFilesStore } from "@/modules/files/filesStore";

const SearchInput = () => {
  const { data } = useFilesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions =
    data?.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];

  return (
    <div className="min-w-lg relative mx-4">
      <Input
        type="search"
        placeholder="Search..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && searchTerm && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer px-4 py-2 hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setSearchTerm(suggestion.name);
                setShowSuggestions(false);
              }}
            >
              {suggestion.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 flex-1 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <CustomIcon iconName="cloud" size="lg" />
          <span className="font-bold">PocketDrop</span>
        </Link>
        <div>
          <SearchInput />
        </div>
        <nav className="flex items-center space-x-2">
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
