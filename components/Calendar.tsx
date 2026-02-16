"use client";

import * as React from "react";
import { useCalendar, CalendarEvent } from "../store/useCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Trash2, Edit2, X } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  getDay,
} from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { ALL_CAPITALS } from "../lib/capitals";

const EVENT_COLORS = [
  { name: "Bleu", value: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-100" },
  { name: "Rouge", value: "bg-red-500", text: "text-red-700", bg: "bg-red-100" },
  { name: "Vert", value: "bg-green-500", text: "text-green-700", bg: "bg-green-100" },
  { name: "Jaune", value: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-100" },
  { name: "Violet", value: "bg-purple-500", text: "text-purple-700", bg: "bg-purple-100" },
  { name: "Rose", value: "bg-pink-500", text: "text-pink-700", bg: "bg-pink-100" },
  { name: "Orange", value: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-100" },
  { name: "Cyan", value: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-100" },
];

export function Calendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null);
  
  const { events, addEvent, updateEvent, deleteEvent, getEventsByDate } = useCalendar();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setShowEventModal(true);
  };

  return (
    <Card className="w-full backdrop-blur-md bg-card/80 border-primary/10 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl font-bold">Agenda Mondial</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base sm:text-lg font-semibold min-w-[140px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday} className="text-xs">
            Aujourd&apos;hui
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((weekDay) => (
            <div
              key={weekDay}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
            >
              {weekDay}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayEvents = getEventsByDate(dateStr);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate === dateStr;

            return (
              <motion.button
                key={idx}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "relative p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] rounded-lg border transition-all duration-200 text-left",
                  isCurrentMonth
                    ? "bg-background hover:bg-primary/5 border-border"
                    : "bg-muted/30 text-muted-foreground border-transparent",
                  isToday && "ring-2 ring-primary ring-inset bg-primary/5",
                  isSelected && "bg-primary/10 border-primary"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    isToday
                      ? "text-primary font-bold"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {format(date, "d")}
                </span>
                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayEvents.slice(0, 4).map((event, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                          event.color || "bg-primary"
                        )}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                        +{dayEvents.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Events list for selected date */}
        {selectedDate && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-semibold">
                Événements du {format(new Date(selectedDate), "dd MMMM yyyy", { locale: fr })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEventModal(true)}
                className="h-8 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {getEventsByDate(selectedDate).length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">
                  Aucun événement pour cette date
                </p>
              ) : (
                getEventsByDate(selectedDate).map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      "flex items-center justify-between p-2 sm:p-3 rounded-lg border",
                      EVENT_COLORS.find(c => c.value === event.color)?.bg || "bg-primary/10",
                      "border-transparent"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal
            date={selectedDate || format(new Date(), "yyyy-MM-dd")}
            event={editingEvent}
            onClose={() => {
              setShowEventModal(false);
              setEditingEvent(null);
            }}
            onSave={(data) => {
              if (editingEvent) {
                updateEvent(editingEvent.id, data);
              } else {
                addEvent(data);
              }
              setShowEventModal(false);
              setEditingEvent(null);
            }}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}

interface EventModalProps {
  date: string;
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function EventModal({ date, event, onClose, onSave }: EventModalProps) {
  const [title, setTitle] = React.useState(event?.title || "");
  const [description, setDescription] = React.useState(event?.description || "");
  const [time, setTime] = React.useState(event?.time || "");
  const [city, setCity] = React.useState(event?.city || "Paris");
  const [color, setColor] = React.useState(event?.color || EVENT_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      date,
      time: time || undefined,
      timezone: ALL_CAPITALS.find(c => c.capital === city)?.timezone || "Europe/Paris",
      city,
      color,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">
              {event ? "Modifier" : "Nouvel"} Événement
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 block">Titre *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nom de l&apos;événement"
                className="h-10 sm:h-11"
                required
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 block">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optionnel)"
                className="h-10 sm:h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Heure</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 sm:h-11"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={date}
                  disabled
                  className="h-10 sm:h-11 bg-muted"
                />
              </div>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 block">Ville / Fuseau horaire</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 rounded-md border border-input bg-background text-sm"
              >
                {ALL_CAPITALS.map((c) => (
                  <option key={c.capital} value={c.capital}>
                    {c.capital}, {c.country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium mb-1 block">Couleur</label>
              <div className="flex flex-wrap gap-2">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all",
                      c.value,
                      color === c.value && "ring-2 ring-offset-2 ring-primary scale-110"
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 sm:h-11">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 h-10 sm:h-11">
                {event ? "Enregistrer" : "Ajouter"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
