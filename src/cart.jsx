import React, { useState, useEffect } from "react";

// Hardcoded data (in INR)
const productList = [
  { id: 1, name: "Product A", price: 50, quantity: 1 },
  { id: 2, name: "Product B", price: 30, quantity: 1 },
];

// Utility to format price in INR
function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [discount, setDiscount] = useState(""); 
  const [discountError, setDiscountError] = useState("");

  // Load from localStorage on first mount, with fallback if it's empty or []
  useEffect(() => {
    const storedCart = localStorage.getItem("cartProducts");

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);

        // If parsedCart is a valid array and not empty, use it; otherwise, fallback
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setProducts(parsedCart);
        } else {
          setProducts(productList);
        }
      } catch (error) {
        console.error("Error parsing stored cart:", error);
        // If JSON parse fails, fallback to productList
        setProducts(productList);
      }
    } else {
      // No cart in localStorage, use our hardcoded list
      setProducts(productList);
    }
  }, []);

  // Whenever products change, update localStorage
  useEffect(() => {
    localStorage.setItem("cartProducts", JSON.stringify(products));
  }, [products]);

  // Handle quantity changes
  const handleQuantityChange = (id, newQty) => {
    if (newQty < 1) return; // disallow zero or negative
    const updated = products.map((p) =>
      p.id === id ? { ...p, quantity: Number(newQty) } : p
    );
    setProducts(updated);
  };

  // Remove product from the cart
  const handleRemoveProduct = (id) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
  };

  // Update discount, with basic validation for 0–100
  const handleDiscountChange = (value) => {
    setDiscount(value);
    setDiscountError("");

    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setDiscountError("Discount must be a valid number between 0 and 100.");
    }
  };

  // Calculate subtotal (total before discount)
  const subTotal = products.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Calculate the actual discount amount
  const discountVal =
    discount && !discountError ? (subTotal * parseFloat(discount)) / 100 : 0;

  // Final total after discount
  const finalTotal = subTotal - discountVal;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-md rounded p-6">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

        {products.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-left">Price</th>
                <th className="py-2 text-left">Quantity</th>
                <th className="py-2 text-left">Total</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const lineTotal = product.price * product.quantity;
                return (
                  <tr key={product.id} className="border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2">{formatPrice(product.price)}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleQuantityChange(product.id, e.target.value)
                        }
                        className="w-16 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2">{formatPrice(lineTotal)}</td>
                    <td className="py-2">
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Discount Input */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label htmlFor="discount" className="font-medium">
            Discount (%):
          </label>
          <input
            id="discount"
            type="number"
            placeholder="0 - 100"
            value={discount}
            onChange={(e) => handleDiscountChange(e.target.value)}
            className="border border-gray-300 rounded p-1 w-32"
          />
          {discountError && (
            <p className="text-red-500 text-sm">{discountError}</p>
          )}
        </div>

        {/* Totals */}
        <div className="mt-6 p-4 bg-gray-50 rounded flex flex-col gap-1">
          <div>
            <span className="font-semibold">Subtotal: </span>
            {formatPrice(subTotal)}
          </div>
          <div>
            <span className="font-semibold">Discount Amount: </span>
            {formatPrice(discountVal)}
          </div>
          <hr />
          <div className="text-lg font-bold">
            Final Total: {formatPrice(finalTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
