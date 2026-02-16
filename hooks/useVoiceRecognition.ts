"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// Types pour l'API Web Speech
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Déclaration pour TypeScript
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceCommandType = 
  | "ADD_EVENT"
  | "ADD_NOTE"
  | "SEARCH_CITY"
  | "UNKNOWN";

export interface ParsedCommand {
  type: VoiceCommandType;
  data: {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    city?: string;
    note?: string;
    raw: string;
  };
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  parsedCommand: ParsedCommand | null;
  supported: boolean;
}

// Parser pour extraire les commandes du texte
const parseCommand = (text: string): ParsedCommand => {
  const lowerText = text.toLowerCase();
  
  // Patterns pour ajouter un événement
  const eventPatterns = [
    /(?:ajoute|crée|nouveau|planifie|programme)\s+(?:un\s+)?(?:événement|rendez-vous|réunion|rdv|meeting)(?:\s+(?:pour|le|à))?\s*(.+)/i,
    /(?:je\s+)?(?:dois|ai|ai\s+un)\s+(?:être|aller|rendez-vous|réunion|rdv)\s+(.+)/i,
    /(?:rappelle\s*-?\s*moi|rappel)\s+(?:que\s+)?(.+)/i,
  ];
  
  // Patterns pour prendre une note
  const notePatterns = [
    /(?:note|prends\s+en\s+note|noter|mémorise)\s+(?:que\s+)?(.+)/i,
    /(?:souviens\s*-?\s*toi|souviens\s*-?\s*moi)\s+(?:que\s+)?(.+)/i,
  ];
  
  // Patterns pour rechercher une ville
  const searchPatterns = [
    /(?:cherche|trouve|affiche|donne\s+moi)\s+(?:l'heure\s+(?:de|à|a))?\s*(.+)/i,
    /(?:quelle\s+heure\s+est\s+-?\s*il\s+(?:à|a))?\s*(.+)/i,
  ];
  
  // Extraire la date
  const datePatterns = [
    { pattern: /(?:demain|le\s+lendemain)/i, fn: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    }},
    { pattern: /(?:aujourd'hui|ce\s+soir|cette\s+après-midi)/i, fn: () => {
      return new Date().toISOString().split("T")[0];
    }},
    { pattern: /(?:après-demain|après\s+demain)/i, fn: () => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().split("T")[0];
    }},
    { pattern: /(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i, fn: (match: RegExpMatchArray) => {
      const months: Record<string, number> = {
        janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
        juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11
      };
      const day = parseInt(match[1]);
      const month = months[match[2].toLowerCase()];
      const year = new Date().getFullYear();
      const d = new Date(year, month, day);
      return d.toISOString().split("T")[0];
    }},
    { pattern: /le\s+(\d{1,2})\/(\d{1,2})/i, fn: (match: RegExpMatchArray) => {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const year = new Date().getFullYear();
      const d = new Date(year, month, day);
      return d.toISOString().split("T")[0];
    }},
  ];
  
  // Extraire l'heure
  const timePattern = /(\d{1,2})[h:](\d{2})?/i;
  
  // Extraire la ville
  const cityPattern = /(?:à|a|de|pour|dans|au|en)\s+(\w+)/i;
  
  let extractedDate: string | undefined;
  for (const dp of datePatterns) {
    const match = text.match(dp.pattern);
    if (match) {
      extractedDate = dp.fn(match);
      break;
    }
  }
  
  const timeMatch = text.match(timePattern);
  const extractedTime = timeMatch 
    ? `${timeMatch[1].padStart(2, "0")}:${(timeMatch[2] || "00").padStart(2, "0")}`
    : undefined;
  
  const cityMatch = text.match(cityPattern);
  const extractedCity = cityMatch ? cityMatch[1] : undefined;
  
  // Détecter le type de commande
  for (const pattern of eventPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "ADD_EVENT",
        data: {
          title: match[1]?.trim() || text,
          date: extractedDate || new Date().toISOString().split("T")[0],
          time: extractedTime,
          city: extractedCity,
          raw: text,
        },
      };
    }
  }
  
  for (const pattern of notePatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "ADD_NOTE",
        data: {
          note: match[1]?.trim() || text,
          raw: text,
        },
      };
    }
  }
  
  for (const pattern of searchPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        type: "SEARCH_CITY",
        data: {
          city: match[1]?.trim(),
          raw: text,
        },
      };
    }
  }
  
  // Si aucun pattern ne match, retourner UNKNOWN avec le texte brut
  return {
    type: "UNKNOWN",
    data: {
      raw: text,
    },
  };
};

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [supported, setSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setSupported(false);
      setError("La reconnaissance vocale n'est pas supportée par votre navigateur");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;  // Single utterance mode
    recognition.interimResults = true;
    recognition.lang = "fr-FR";
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);  // Don't accumulate
        const command = parseCommand(finalTranscript);
        setParsedCommand(command);
      }
      
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Erreur: ${event.error}`);
      if (event.error === "no-speech") {
        setError("Aucune parole détectée. Essayez encore.");
      } else if (event.error === "audio-capture") {
        setError("Aucun microphone détecté.");
      } else if (event.error === "not-allowed") {
        setError("Permission microphone refusée.");
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      // Auto-reset transcript after a delay so parsedCommand can be processed
      setTimeout(() => {
        setTranscript("");
        setParsedCommand(null);
      }, 3000);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      recognition.abort();
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript("");  // Reset on start
        setParsedCommand(null);
        setInterimTranscript("");
        recognitionRef.current.start();
      } catch (err) {
        setError("Erreur lors du démarrage de la reconnaissance vocale");
      }
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);
  
  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    parsedCommand,
    supported,
  };
}
