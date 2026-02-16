import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  color?: string;
  tags?: string[];
}

interface NotesState {
  notes: Note[];
  addNote: (content: string, color?: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteById: (id: string) => Note | undefined;
  searchNotes: (query: string) => Note[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useNotes = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (content, color) => {
        const newNote: Note = {
          id: generateId(),
          content: content.trim(),
          createdAt: Date.now(),
          color: color || "bg-yellow-100",
        };
        set((state) => ({
          notes: [newNote, ...state.notes],
        }));
      },

      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, content: content.trim(), updatedAt: Date.now() }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      getNoteById: (id) => {
        return get().notes.find((note) => note.id === id);
      },

      searchNotes: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().notes.filter((note) =>
          note.content.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: "notes-storage",
    }
  )
);
