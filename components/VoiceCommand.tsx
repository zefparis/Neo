"use client";

import * as React from "react";
import { useVoiceRecognition, ParsedCommand } from "../hooks/useVoiceRecognition";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Mic, MicOff, Loader2, Sparkles, Calendar, StickyNote, Search, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendar } from "../store/useCalendar";
import { useNotes } from "../store/useNotes";
import { ALL_CAPITALS } from "../lib/capitals";

interface VoiceCommandProps {
  onSearchCity?: (city: string) => void;
}

export function VoiceCommand({ onSearchCity }: VoiceCommandProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    parsedCommand,
    supported,
  } = useVoiceRecognition();

  const { addEvent } = useCalendar();
  const { addNote } = useNotes();
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const [showHelp, setShowHelp] = React.useState(false);

  const handleAddEvent = React.useCallback((data: ParsedCommand["data"]) => {
    if (!data.title) return;

    // Trouver une ville par défaut si non spécifiée
    let city = data.city || "Paris";
    let timezone = "Europe/Paris";
    
    const cityData = ALL_CAPITALS.find(
      (c) => c.capital.toLowerCase() === city.toLowerCase() ||
             c.country.toLowerCase() === city.toLowerCase()
    );
    
    if (cityData) {
      city = cityData.capital;
      timezone = cityData.timezone;
    }

    addEvent({
      title: data.title,
      description: data.description || "",
      date: data.date || new Date().toISOString().split("T")[0],
      time: data.time,
      timezone,
      city,
      color: "bg-blue-500",
    });

    setLastAction(`Événement ajouté: ${data.title}`);
  }, [addEvent]);

  const handleAddNote = React.useCallback((data: ParsedCommand["data"]) => {
    if (!data.note) return;

    addNote(data.note, "bg-yellow-100");
    setLastAction(`Note ajoutée: "${data.note.substring(0, 50)}${data.note.length > 50 ? "..." : ""}"`);
  }, [addNote]);

  const handleSearchCity = React.useCallback((data: ParsedCommand["data"]) => {
    if (!data.city) return;
    
    if (onSearchCity) {
      onSearchCity(data.city);
      setLastAction(`Recherche de: ${data.city}`);
    }
  }, [onSearchCity]);

  // Exécuter la commande parsée
  React.useEffect(() => {
    if (parsedCommand && !isListening) {
      switch (parsedCommand.type) {
        case "ADD_EVENT":
          handleAddEvent(parsedCommand.data);
          break;
        case "ADD_NOTE":
          handleAddNote(parsedCommand.data);
          break;
        case "SEARCH_CITY":
          handleSearchCity(parsedCommand.data);
          break;
        default:
          setLastAction(`Commande non reconnue: "${parsedCommand.data.raw}"`);
      }
    }
  }, [parsedCommand, isListening, handleAddEvent, handleAddNote, handleSearchCity]);

  if (!supported) {
    return (
      <Card className="w-full border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">
            Votre navigateur ne supporte pas la reconnaissance vocale.
            Essayez Chrome ou Safari.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full backdrop-blur-md border-primary/10 shadow-lg transition-all duration-300",
      isListening ? "bg-primary/5 ring-2 ring-primary/20" : "bg-card/80"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg font-bold">Commande Vocale</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs h-7"
          >
            Aide
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bouton principal */}
        <div className="flex items-center justify-center">
          <motion.button
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300",
              isListening
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                : "bg-primary hover:bg-primary/90 shadow-primary/30",
              "shadow-lg"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center justify-center"
                >
                  <MicOff className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="not-listening"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center justify-center"
                >
                  <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animation d'ondes quand on écoute */}
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </motion.button>
        </div>

        {/* Status text */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          {isListening
            ? "Je vous écoute... Parlez maintenant"
            : "Appuyez pour parler"}
        </p>

        {/* Transcription */}
        <AnimatePresence>
          {(transcript || interimTranscript) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-muted rounded-lg p-3"
            >
              <p className="text-sm">
                <span className="font-medium text-foreground">{transcript}</span>
                <span className="text-muted-foreground">{interimTranscript}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-destructive/10 text-destructive rounded-lg p-2 text-xs"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dernière action */}
        <AnimatePresence>
          {lastAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg p-2 text-xs sm:text-sm"
            >
              <Check className="h-4 w-4" />
              {lastAction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Commandes disponibles */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 text-xs sm:text-sm"
            >
              <p className="font-medium text-muted-foreground">Commandes disponibles :</p>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Ajouter un événement</p>
                    <p className="text-muted-foreground text-xs">
                      &quot;Ajoute un rendez-vous demain à 14h à Paris&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <StickyNote className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Prendre une note</p>
                    <p className="text-muted-foreground text-xs">
                      &quot;Note que je dois appeler le client&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Search className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Rechercher une ville</p>
                    <p className="text-muted-foreground text-xs">
                      &quot;Quelle heure est-il à Tokyo ?&quot;
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
