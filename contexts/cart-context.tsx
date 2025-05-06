"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  type: string
  game: string
  proName?: string
  pricePerGame: number | string
  gameCount: number | string
  proId?: string
  proAvatar?: string
  proRank?: string
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Update localStorage whenever cart changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    } else {
      localStorage.removeItem("cart")
    }

    // Calculate totals
    let count = 0
    let sub = 0

    items.forEach((item) => {
      const quantity = Number(item.gameCount) || 0
      const price = Number(item.pricePerGame) || 0
      count += quantity
      sub += price * quantity
    })

    // Round to 2 decimal places
    sub = Math.round(sub * 100) / 100

    // No service fee - total equals subtotal
    const tot = sub

    setItemCount(count)
    setSubtotal(sub)
    setTotal(tot)
  }, [items])

  const addItem = (item: CartItem) => {
    // Ensure numeric values
    const itemGameCount = Number(item.gameCount) || 1
    const itemPrice = Number(item.pricePerGame) || 0

    console.log(`Adding item to cart: ${item.game}, type: ${item.type}, count: ${itemGameCount}`)

    setItems((currentItems) => {
      // Check if item already exists
      const existingItemIndex = currentItems.findIndex((i) => {
        // For quick matches, match by game and type
        if (item.type === "quick-match" && i.type === "quick-match") {
          return i.game === item.game
        }
        // For pro teammates, match by id
        return i.id === item.id
      })

      if (existingItemIndex >= 0) {
        // Update existing item - preserve the existing quantity and add the new quantity
        const updatedItems = [...currentItems]
        const existingItem = updatedItems[existingItemIndex]
        const existingCount = Number(existingItem.gameCount) || 0
        const newCount = existingCount + itemGameCount

        console.log(`Updating existing item: ${existingItem.game}, old count: ${existingCount}, new count: ${newCount}`)

        updatedItems[existingItemIndex] = {
          ...existingItem,
          gameCount: newCount,
        }

        // Show toast
        setTimeout(() => {
          toast({
            title: "Cart updated",
            description: `Added ${itemGameCount} more ${item.game} games to your cart.`,
          })
        }, 0)

        return updatedItems
      } else {
        // Add new item
        const newItem = {
          ...item,
          pricePerGame: itemPrice,
          gameCount: itemGameCount,
        }

        console.log(`Adding new item: ${newItem.game}, count: ${itemGameCount}`)

        // Show toast
        setTimeout(() => {
          toast({
            title: "Added to cart",
            description: `${item.game} ${item.type === "quick-match" ? "Quick Match" : `with ${item.proName || "Pro"}`} added to cart.`,
          })
        }, 0)

        return [...currentItems, newItem]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.id === id)
      const updatedItems = currentItems.filter((item) => item.id !== id)

      // Show toast
      if (itemToRemove) {
        setTimeout(() => {
          toast({
            title: "Item removed",
            description: `${itemToRemove.game} ${itemToRemove.type === "quick-match" ? "Quick Match" : `with ${itemToRemove.proName || "Pro"}`} removed from cart.`,
          })
        }, 0)
      }

      return updatedItems
    })
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return

    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, gameCount: quantity } : item)))
  }

  const clearCart = () => {
    setItems([])

    // Show toast
    setTimeout(() => {
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        total,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
