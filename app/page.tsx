"use client"

import * as React from "react"
import { SearchBar } from "../components/SearchBar"
import { TimeCard } from "../components/TimeCard"
import { FavoritesSection } from "../components/FavoritesSection"
import { ThemeToggle } from "../components/theme-toggle"
import { POPULAR_CAPITALS, ALL_CAPITALS, CityData } from "../lib/capitals"
import { Clock, Globe } from "lucide-react"
import { Button } from "../components/ui/button"
import { useFavorites } from "../store/useFavorites"
import { toast } from "../components/ui/use-toast"
import { Toaster } from "../components/ui/toaster"

export default function Home() {
  const [localTimezone, setLocalTimezone] = React.useState<string | null>(null)
  const [localCity, setLocalCity] = React.useState<CityData | null>(null)
  
  // Utiliser le store pour éviter d'afficher les favoris dans la liste "Populaire" s'ils sont déjà en haut
  // (Optionnel, mais ça fait plus propre)
  const { isFavorite } = useFavorites()

  React.useEffect(() => {
    // Détecter la timezone utilisateur
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setLocalTimezone(tz)
      
      // Essayer de trouver une ville correspondante dans notre liste pour l'afficher joliment
      // Sinon créer une entrée générique
      const found = ALL_CAPITALS.find(c => c.timezone === tz)
      if (found) {
        setLocalCity(found)
      } else {
        // Fallback générique
        setLocalCity({
          capital: "Votre Position",
          country: "Local",
          timezone: tz
        })
      }
    } catch (e) {
      console.error("Impossible de détecter le fuseau horaire", e)
    }
  }, [])

  const handleSelectCity = (city: CityData) => {
    // Pour l'instant, la recherche ajoute temporairement la ville en haut de la liste populaire
    // Ou scroll vers elle si elle existe.
    // Une meilleure approche : Ajouter une section "Résultat de recherche" ou l'ajouter aux favoris direct ?
    // Le prompt dit "Recherche rapide... Résultats instantanés".
    // On va scroller vers la carte si elle est affichée, sinon on l'ajoute temporairement à une liste de "Vues récemment" ou on la met en highlight.
    
    // Simplification : On l'ajoute aux favoris directement pour l'utilisateur ? 
    // Ou on affiche une modal ? 
    // On va faire simple : on l'ajoute à une liste "Résultats" temporaire juste sous la barre de recherche.
    setSearchResult(city)
  }

  const [searchResult, setSearchResult] = React.useState<CityData | null>(null)

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="container px-3 sm:px-4 py-4 sm:py-8 mx-auto space-y-6 sm:space-y-12">
        
        {/* Header */}
        <header className="flex flex-col gap-4 sm:gap-6 pt-2 sm:pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-primary/10 p-2 sm:p-2.5 rounded-xl">
                <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  World Time Capitals
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  L&apos;heure mondiale en un coup d&apos;œil
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
               <SearchBar onSelectCity={handleSelectCity} />
               <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Local Time Banner */}
        {localCity && (
            <div className="w-full">
               <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold">Votre heure locale</h2>
               </div>
               <div className="h-40 sm:h-48 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
                 <TimeCard city={localCity} priority={true} />
               </div>
            </div>
        )}

        {/* Favorites Section */}
        <FavoritesSection />

        {/* Search Result (if any) */}
        {searchResult && (
          <section className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">Résultat de recherche</h2>
                <Button variant="ghost" size="sm" onClick={() => setSearchResult(null)}>Effacer</Button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="h-44 sm:h-48">
                  <TimeCard city={searchResult} />
                </div>
             </div>
          </section>
        )}

        {/* Popular Capitals */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Capitales Populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {POPULAR_CAPITALS.map((city) => (
              <div key={city.capital} className="h-44 sm:h-48">
                <TimeCard city={city} />
              </div>
            ))}
          </div>
        </section>

        <footer className="py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground border-t">
           <p>Données fournies par WorldTimeAPI.org</p>
        </footer>
      </div>
      <Toaster />
    </main>
  )
}
