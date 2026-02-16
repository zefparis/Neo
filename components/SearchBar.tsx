"use client"

import * as React from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { ALL_CAPITALS, CityData } from "../lib/capitals"
import { cn } from "../lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SearchBarProps {
  onSelectCity: (city: CityData) => void
}

export function SearchBar({ onSelectCity }: SearchBarProps) {
  const [query, setQuery] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const [filteredCities, setFilteredCities] = React.useState<CityData[]>([])
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length > 1) {
      const lowerQuery = value.toLowerCase()
      const filtered = ALL_CAPITALS.filter(
        (city) =>
          city.capital.toLowerCase().includes(lowerQuery) ||
          city.country.toLowerCase().includes(lowerQuery)
      ).slice(0, 10) // Limiter à 10 résultats pour la performance
      setFilteredCities(filtered)
      setIsOpen(true)
    } else {
      setFilteredCities([])
      setIsOpen(false)
    }
  }

  const handleSelect = (city: CityData) => {
    onSelectCity(city)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-full sm:max-w-xl mx-auto z-50" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher une capitale..."
          className="pl-10 pr-4 h-10 sm:h-12 text-sm sm:text-base rounded-full border-primary/20 bg-background/50 backdrop-blur-sm focus-visible:ring-primary/50 shadow-sm"
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredCities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full mt-2"
          >
            <Card className="overflow-hidden border-primary/10 shadow-xl bg-card/95 backdrop-blur-md">
              <CardContent className="p-0">
                <ul className="max-h-[300px] overflow-y-auto py-2">
                  {filteredCities.map((city) => (
                    <li key={`${city.country}-${city.capital}`}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-primary/5 rounded-none"
                        onClick={() => handleSelect(city)}
                      >
                        <MapPin className="h-4 w-4 mr-2 sm:mr-3 text-primary shrink-0" />
                        <div className="flex flex-col items-start text-left min-w-0 flex-1">
                          <span className="font-medium text-sm sm:text-base truncate">{city.capital}</span>
                          <span className="text-xs text-muted-foreground truncate">{city.country}</span>
                        </div>
                        <span className="ml-2 text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 hidden sm:inline-block">
                          {city.timezone}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
