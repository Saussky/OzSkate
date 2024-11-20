"use client";

import { fetchAllProducts } from "@/lib/actions";
import React, { useState, useTransition } from "react";

export default function FetchProductsButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleClick = () => {
    startTransition(async () => {
      setMessage("Fetching products...");
      try {
        await fetchAllProducts();
        setMessage("Product import completed.");
      } catch (error) {
        console.error("Error:", error);
        setMessage("An error occurred during product import.");
      }
    });
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isPending}>
        {isPending ? "Fetching Products..." : "Fetch All Products"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
