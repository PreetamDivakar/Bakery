import React, { useEffect, useState } from "react";

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

useEffect(() => {
  fetch("https://bakery-cal2.onrender.com/api/items")
    .then((res) => res.json())
    .then(setMenuItems)
    .catch(console.error);
}, []);


  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      return existing
        ? prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
            : item
        )
    );
  };

  const formatINR = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}

        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">Sweet Treats 🍰</h1>
        <div>
          <span className="mr-6 text-white hover:text-yellow-400 cursor-pointer">
            Home
          </span>
          <span
            onClick={() => setShowCart(true)}
            className="text-white hover:text-yellow-400 cursor-pointer"
          >
            Cart ({cart.length})
          </span>
        </div>
      </nav>

      {/* Hero */}
      <header className="text-center mt-10 mb-8 pt-20">
        <h2 className="text-4xl font-bold text-yellow-300">
          Delicious Bakes Daily
        </h2>
        <p className="text-gray-400 mt-2">Fresh. Sweet. Just for you.</p>
      </header>

      {/* Menu Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 pb-16">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg p-4 mb-4 shadow hover:shadow-lg"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-40 w-full object-cover rounded mb-3"
            />
            <h3 className="text-xl font-bold text-yellow-200">{item.name}</h3>
            <p className="text-gray-400 text-sm">{item.description}</p>
            <p className="text-yellow-300 mt-1 font-semibold">
              {formatINR(item.price)}
            </p>
            <button
              onClick={() => addToCart(item)}
              className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-1 px-4 rounded"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-xl shadow-xl relative">
            <button
              onClick={() => setShowCart(false)}
              className="absolute top-2 right-3 text-white text-2xl font-bold"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold mb-4 text-yellow-300">
              Your Cart
            </h2>
            {cart.length === 0 ? (
              <p className="text-gray-400">Your cart is empty.</p>
            ) : (
              <div>
                <ul>
                  {cart.map(({ id, name, price, quantity }) => (
                    <li
                      key={id}
                      className="flex justify-between items-center border-b border-gray-700 py-3"
                    >
                      <div>
                        <p className="font-bold text-yellow-200">{name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => updateQuantity(id, -1)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-2 rounded"
                          >
                            −
                          </button>
                          <span className="text-yellow-300 font-semibold">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(id, 1)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-2 rounded"
                          >
                            +
                          </button>
                          <span className="ml-4 text-gray-400 text-sm">
                            × {formatINR(price)} ={" "}
                            <span className="text-yellow-300 font-medium">
                              {formatINR(price * quantity)}
                            </span>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(id)}
                        className="text-red-400 hover:text-red-600 font-semibold"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-right">
                  <p className="text-lg font-bold text-yellow-300">
                    Total: {formatINR(totalPrice)}
                  </p>
                  <button
                    // onClick={() => alert("Redirecting to payment...")}

                  onClick={async () => {
                    const order = { cart, total: totalPrice };
                    try {
                      const res = await fetch("https://bakery-cal2.onrender.com/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(order),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        alert("✅ Order placed successfully!");
                        setCart([]);
                        setShowCart(false);
                      } else {
                        alert("❌ Order failed: " + data.error);
                      }
                    } catch (err) {
                      console.error(err);
                      alert("❌ Network error. Try again.");
                    }
}}

                    className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
