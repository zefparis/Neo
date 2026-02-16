import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:MM format
  timezone: string;
  city: string;
  color?: string;
  createdAt: number;
}

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string | null;
  addEvent: (event: Omit<CalendarEvent, "id" | "createdAt">) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  setSelectedDate: (date: string | null) => void;
  getEventsByCity: (city: string) => CalendarEvent[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useCalendar = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      selectedDate: null,

      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      getEventsByDate: (date) => {
        return get().events.filter((event) => event.date === date);
      },

      getEventsByCity: (city) => {
        return get().events.filter(
          (event) => event.city.toLowerCase() === city.toLowerCase()
        );
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },
    }),
    {
      name: "calendar-storage",
    }
  )
);
