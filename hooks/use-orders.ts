"use client"

import { useState } from "react"

type OrderFormData = {
  customer_name: string
  customer_email: string
  product_name: string
  quantity: number
  shipping_address: string
  order_status: string
}

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false)

  const createOrder = async (formData: OrderFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/simulation/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create order")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error("Error creating order:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const acceptOrder = async (orderNumber: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/simulation/accept-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept order")
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      console.error("Error accepting order:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    createOrder,
    acceptOrder,
  }
}
