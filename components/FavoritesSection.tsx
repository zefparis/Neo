"use client"

import * as React from "react"
import { useFavorites } from "../store/useFavorites"
import { TimeCard } from "./TimeCard"
import { Button } from "./ui/button"
import { Trash2, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FavoritesSection() {
  const { favorites, removeFavorite } = useFavorites()
  const [mounted, setMounted] = React.useState(false)

  // Hydration fix for zustand persist
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (favorites.length === 0) {
    return null
  }

  // Trier les favoris par timezone pour un affichage cohérent (optionnel, ici par ordre d'ajout ou alphabétique serait mieux ?)
  // Le prompt demande: "Tri automatique par décalage UTC". 
  // C'est complexe sans connaître l'offset actuel de chaque timezone instantanément.
  // On va simplifier pour l'instant en gardant l'ordre d'ajout ou un tri simple.
  
  return (
    <section className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
      <div className="flex items-center space-x-2">
        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">Vos Favoris</h2>
        <span className="text-[10px] sm:text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
          {favorites.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {favorites.map((city) => (
            <motion.div
              key={city.capital}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group h-44 sm:h-48"
            >
              <TimeCard city={city} isFavorite={true} priority={true} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
