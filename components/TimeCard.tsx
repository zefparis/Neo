"use client"

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import { Clock, Star, Globe } from "lucide-react"
import { CityData } from "../lib/capitals"
import { useFavorites } from "../store/useFavorites"
import { cn } from "../lib/utils"
import { motion } from "framer-motion"

interface TimeCardProps {
  city: CityData
  isFavorite?: boolean
  onToggleFavorite?: () => void
  priority?: boolean // If true, fetches immediately
}

export function TimeCard({ city, isFavorite, onToggleFavorite, priority = false }: TimeCardProps) {
  const [timeData, setTimeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Utiliser le store directement si les props ne sont pas fournies (usage individuel)
  const { addFavorite, removeFavorite, isFavorite: checkIsFavorite } = useFavorites()
  const isFav = isFavorite !== undefined ? isFavorite : checkIsFavorite(city.capital)

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite()
    } else {
      if (isFav) {
        removeFavorite(city.capital)
      } else {
        addFavorite(city)
      }
    }
  }

  const updateLocalTime = (isoString: string, timezone?: string) => {
    // Si on a une timezone spécifique (fallback), on l'utilise
    // Sinon on parse l'ISO string qui contient l'offset
    const date = new Date(isoString)
    
    // Fonction pour formater l'heure
    const format = (d: Date) => {
      // Si on a l'API data avec offset, on ajuste manuellement
      // Sinon on utilise Intl avec la timezone
      if (timezone) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: timezone
        }).format(d)
      } else if (timeData) {
        // Calculer l'heure basée sur l'offset si disponible, ou simplement afficher l'heure reçue + delta
        // Pour simplifier ici, on va réutiliser Intl avec la timezone de la ville
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: city.timezone
        }).format(d)
      }
      return d.toLocaleTimeString()
    }

    setCurrentTime(format(new Date()))

    // Clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current)

    // Set new interval
    intervalRef.current = setInterval(() => {
        setCurrentTime(new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: city.timezone
        }).format(new Date()))
    }, 1000)
  }

  useEffect(() => {
    const fetchTime = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/time?timezone=${city.timezone}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        setTimeData(data)
        
        // Initialiser l'heure locale basée sur l'offset retourné
        // On utilise l'heure retournée par l'API pour initialiser
        // puis on incrémente localement pour éviter de spammer l'API
        updateLocalTime(data.datetime)
        
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError(true)
        setLoading(false)
        // Fallback local display if API fails completely
        updateLocalTime(new Date().toISOString(), city.timezone)
      }
    }

    fetchTime()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.timezone])

  if (loading && !timeData && !error) {
    return (
      <Card className="w-full h-full backdrop-blur-sm bg-card/50 border-primary/10 shadow-lg">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="w-full h-full backdrop-blur-md bg-card/80 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 p-2 sm:p-4">
           <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10", isFav ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground")}
            onClick={handleToggleFavorite}
          >
            <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", isFav && "fill-current")} />
            <span className="sr-only">Toggle favorite</span>
          </Button>
        </div>
        
        <CardHeader className="pb-2 px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center space-x-2 text-muted-foreground mb-1">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{city.country}</span>
          </div>
          <CardTitle className="text-lg sm:text-2xl font-bold tracking-tight text-primary">{city.capital}</CardTitle>
          <CardDescription className="flex items-center mt-1 text-xs sm:text-sm">
             {timeData?.abbreviation || city.timezone}
             {timeData?.utc_offset && <span className="ml-2 text-[10px] sm:text-xs bg-secondary px-2 py-0.5 rounded-full">{timeData.utc_offset}</span>}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex items-baseline space-x-1">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent mr-1 sm:mr-2 self-center" />
            <span className="text-2xl sm:text-4xl font-mono font-bold tracking-tighter tabular-nums">
              {currentTime || "--:--:--"}
            </span>
          </div>
          {timeData?.date && (
             <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 pl-5 sm:pl-7">
               {new Date(timeData.datetime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
