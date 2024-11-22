"use client";

import { deleteAllProducts } from "@/lib/actions";
import React, { useState, useTransition } from "react";

export default function DeleteAllProductsButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleClick = () => {
    startTransition(async () => {
      setMessage("Deleting all products...");
      try {
        await deleteAllProducts();
        setMessage("All products successfully deleted.");
      } catch (error) {
        console.error("Error:", error);
        setMessage("An error occurred while deleting products.");
      }
    });
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`px-6 py-3 text-white font-bold rounded-lg ${
          isPending
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700"
        }`}
      >
        {isPending ? "Deleting Products..." : "Delete All Products"}
      </button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
