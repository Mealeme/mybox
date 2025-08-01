"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Search, CircleDot, ArrowRight, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useExpenses } from "@/hooks/useExpenses"
import { useNavigate } from "react-router-dom"
import { Expense } from "@/data/types"
import { filterExpensesBySearchTerm } from "@/hooks/useDebounce"
import { Badge } from "@/components/ui/badge"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  mode: 'dark' | 'light'
}

interface SuggestionItem {
  text: string;
  category: string;
  amount?: number;
  date?: string;
}

// Add back the GooeyFilter component
const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

const SearchBar = ({ placeholder = "Search expenses, groups...", onSearch, mode }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [isClicked, setIsClicked] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { expenses } = useExpenses()
  const navigate = useNavigate()

  const isUnsupportedBrowser = useMemo(() => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
    const isChromeOniOS = ua.includes("crios")
    return isSafari || isChromeOniOS
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Show suggestions if input has content (even a single character)
    if (value) {
      // Filter expenses by search term
      let filteredExpenses = filterExpensesBySearchTerm(expenses, value)

      // Convert to suggestions format
      const expenseSuggestions = filteredExpenses.slice(0, 7).map(expense => ({
        text: expense.description || `${expense.category} expense`,
        category: expense.category,
        amount: expense.amount,
        date: expense.date
      }))
      
      setSuggestions(expenseSuggestions)
      setIsFocused(true)
    } else {
      setSuggestions([])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`)
      
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 1000)
      
      if (onSearch) {
        onSearch(searchQuery)
      }
    }
  }

  const handleSuggestionClick = (suggestion: SuggestionItem) => {
    setSearchQuery(suggestion.text)
    navigate(`/reports?search=${encodeURIComponent(suggestion.text)}&category=${encodeURIComponent(suggestion.category)}`)
    setIsFocused(false)
    
    if (onSearch) {
      onSearch(suggestion.text)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)
  }

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  }

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  }

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => (
    <motion.div
      key={i}
      initial={{ scale: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * 40],
        y: [0, (Math.random() - 0.5) * 40],
        scale: [0, Math.random() * 0.8 + 0.4],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: Math.random() * 1.5 + 1.5,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
      className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-food-orange to-purple-400"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: "blur(2px)",
      }}
    />
  ))

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => (
        <motion.div
          key={`click-${i}`}
          initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
          animate={{
            x: mousePosition.x + (Math.random() - 0.5) * 160,
            y: mousePosition.y + (Math.random() - 0.5) * 160,
            scale: Math.random() * 0.8 + 0.2,
            opacity: [1, 0],
          }}
          transition={{ duration: Math.random() * 0.8 + 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 200) + 55}, ${Math.floor(Math.random() * 255)}, 0.8)`,
            boxShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
        />
      ))
    : null

  return (
    <div className="relative w-full">
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "240px" }}
        animate={{ width: isFocused ? "340px" : "240px", scale: isFocused ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md",
            isFocused ? "border-transparent shadow-xl" : "border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/50"
          )}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(255, 145, 50, 0.5), 0 0 15px rgba(255, 145, 50, 0.7) inset"  // Changed to food-orange
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.2)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.15,
                background: [
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                  "linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)",
                  "linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)",
                  "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {particles}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-food-orange/10"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-white dark:bg-white/20"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}

          {clickParticles}

          <motion.div className="pl-4 py-3" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating ? "text-food-orange" : isFocused ? "text-food-orange" : "text-gray-500 dark:text-gray-300",
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className={cn(
              "w-full py-3 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium text-base relative z-10",
              isFocused ? "text-gray-800 dark:text-white tracking-wide" : "text-gray-600 dark:text-gray-300"
            )}
          />

          <AnimatePresence>
            {searchQuery && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.05,
                  background: "linear-gradient(45deg, #ff9132 0%, #ff5722 100%)",
                  boxShadow: "0 10px 25px -5px rgba(255, 145, 50, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 mr-2 text-sm font-medium rounded-full bg-gradient-to-r from-food-orange to-orange-500 text-white backdrop-blur-sm transition-all shadow-lg"
              >
                Search
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.1, 0.2, 0.1, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-100 dark:border-gray-700"
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.1))",
            }}
          >
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <div className="flex items-center">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                      <Search size={16} className="text-gray-400 mr-2 group-hover:text-food-orange" />
                    </motion.div>
                    <motion.div
                      className="text-gray-700 dark:text-gray-100"
                      initial={{ x: -5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <span className="block">{suggestion.text}</span>
                      {suggestion.date && (
                        <span className={`text-xs flex items-center ${
                          mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(suggestion.date).toLocaleDateString()}
                        </span>
                      )}
                    </motion.div>
                  </div>
                  <div className="flex items-center">
                    {suggestion.amount !== undefined && (
                      <span className={`text-xs mr-2 font-medium ${
                        mode === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        ₹{suggestion.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                    <Badge variant="outline" className="mr-1">
                      {suggestion.category}
                    </Badge>
                    <ArrowRight className={`h-4 w-4 ${
                      mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { SearchBar } 