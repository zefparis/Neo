"use client";

import * as React from "react";
import { useNotes } from "../store/useNotes";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { StickyNote, Plus, Trash2, Edit2, X, Search, Palette } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const NOTE_COLORS = [
  { name: "Jaune", value: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300", text: "text-yellow-900 dark:text-yellow-100" },
  { name: "Bleu", value: "bg-blue-100 dark:bg-blue-900/30 border-blue-300", text: "text-blue-900 dark:text-blue-100" },
  { name: "Vert", value: "bg-green-100 dark:bg-green-900/30 border-green-300", text: "text-green-900 dark:text-green-100" },
  { name: "Rose", value: "bg-pink-100 dark:bg-pink-900/30 border-pink-300", text: "text-pink-900 dark:text-pink-100" },
  { name: "Violet", value: "bg-purple-100 dark:bg-purple-900/30 border-purple-300", text: "text-purple-900 dark:text-purple-100" },
  { name: "Orange", value: "bg-orange-100 dark:bg-orange-900/30 border-orange-300", text: "text-orange-900 dark:text-orange-100" },
];

export function NotesSection() {
  const { notes, addNote, updateNote, deleteNote, searchNotes } = useNotes();
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = React.useState("");
  const [newNoteColor, setNewNoteColor] = React.useState(NOTE_COLORS[0].value);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const filteredNotes = searchQuery ? searchNotes(searchQuery) : notes;

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    addNote(newNoteContent, newNoteColor);
    setNewNoteContent("");
    setIsAdding(false);
    setShowColorPicker(false);
  };

  const handleUpdateNote = (id: string, content: string) => {
    if (!content.trim()) return;
    updateNote(id, content);
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd MMM yyyy à HH:mm", { locale: fr });
  };

  return (
    <Card className="w-full backdrop-blur-md bg-card/80 border-primary/10 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-bold">Notes Vocales</CardTitle>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {notes.length}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm w-full sm:w-48"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="h-9 px-3"
            >
              {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Formulaire d'ajout */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Textarea
                placeholder="Écrivez votre note ici..."
                value={newNoteContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                className="min-h-[100px] resize-none"
                autoFocus
              />
              
              {/* Sélecteur de couleur */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="h-8 text-xs"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Couleur
                </Button>
                
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex gap-1"
                    >
                      {NOTE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setNewNoteColor(color.value)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 transition-all",
                            color.value,
                            newNoteColor === color.value
                              ? "border-primary scale-110"
                              : "border-transparent"
                          )}
                          title={color.name}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1" />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewNoteContent("");
                    setShowColorPicker(false);
                  }}
                  className="h-8 text-xs"
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="h-8 text-xs"
                >
                  Ajouter
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-8 text-muted-foreground"
              >
                <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {searchQuery
                    ? "Aucune note trouvée"
                    : "Aucune note. Utilisez la commande vocale ou cliquez sur + pour ajouter une note !"}
                </p>
              </motion.div>
            ) : (
              filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "group relative p-3 rounded-lg border transition-all duration-200",
                    note.color || NOTE_COLORS[0].value
                  )}
                >
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        defaultValue={note.content}
                        className="min-h-[80px] text-sm resize-none bg-white/50"
                        autoFocus
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => handleUpdateNote(note.id, e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Appuyez sur Échap pour annuler, ou cliquez ailleurs pour sauvegarder
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setEditingId(note.id)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
