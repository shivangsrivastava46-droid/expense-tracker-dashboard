import { useState, useEffect } from "react";
import "./App.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function App() {
  const [expense, setExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [tempName, setTempName] = useState("");
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [category, setCategory] = useState("Food");
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [budget, setBudget] = useState(localStorage.getItem("budget") || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleClick = () => {
    if (expense === "") return;
    if (editIndex !== null) {
      const updatedExpenses = [...expenses];
      updatedExpenses[editIndex] = { name: expense, amount: amount, category: category };
      setExpenses(updatedExpenses);
      setEditIndex(null);
    } else {
      setExpenses([...expenses, { name: expense, amount: amount, category: category }]);
    }
    setExpense("");
    setAmount("");
  };

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remainingBudget = budget ? Number(budget) - totalExpense : 0;

  const categoryTotals = { Food: 0, Stationery: 0, Groceries: 0, "Campus Events": 0, Miscellaneous: 0 };
  expenses.forEach((item) => { categoryTotals[item.category] += Number(item.amount); });

  const filteredExpenses = selectedCategory === "All"
    ? expenses
    : expenses.filter((item) => item.category === selectedCategory);

  const chartData = [
    { name: "Food", value: categoryTotals.Food },
    { name: "Stationery", value: categoryTotals.Stationery },
    { name: "Groceries", value: categoryTotals.Groceries },
    { name: "Campus Events", value: categoryTotals["Campus Events"] },
    { name: "Miscellaneous", value: categoryTotals.Miscellaneous },
  ];

  const COLORS = ["#00C49F", "#0088FE", "#8884D8", "#FFBB28", "#FF4D4D"];

  return (
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <h1>Expense Tracker</h1>
      </div>
      <p className="subtitle">Track your expenses and manage your budget efficiently</p>

      {/* TOP ROW — Budget + Name side by side */}
      <div className="top-row">
        <div className="budget-section">
          <input
            type="number"
            placeholder="Set Monthly Budget"
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value);
              localStorage.setItem("budget", e.target.value);
            }}
          />
        </div>

        {name === "" ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="Enter your name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <button onClick={() => {
              if (!tempName.trim()) return;
              setName(tempName);
              localStorage.setItem("userName", tempName);
            }}>
              Save Name
            </button>
          </div>
        ) : (
          <div className="user-section">
            <h2>Hello {name} 👋</h2>
            <button onClick={() => {
              localStorage.removeItem("userName");
              setName("");
              setTempName("");
            }}>
              Change Name
            </button>
          </div>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Budget</h3>
          <p>₹{budget || "--"}</p>
        </div>
        <div className="stat-card">
          <h3>Spent</h3>
          <p>₹{totalExpense}</p>
        </div>
        <div className="stat-card">
          <h3>Remaining</h3>
          <p>₹{remainingBudget}</p>
        </div>
      </div>

      {/* INPUT GROUP */}
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter expense"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Food">🍔 Food</option>
          <option value="Stationery">📚 Stationery</option>
          <option value="Groceries">🛒 Groceries</option>
          <option value="Campus Events">🎉 Campus Events</option>
          <option value="Miscellaneous">📦 Miscellaneous</option>
        </select>
        <button onClick={handleClick}>
          {editIndex !== null ? "Update" : "Add Expense"}
        </button>
      </div>

      {/* CATEGORY FILTER BUTTONS */}
      <h3>Categories</h3>
      <div className="category-buttons">
        {["All", "Food", "Stationery", "Groceries", "Campus Events", "Miscellaneous"].map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}>{cat}</button>
        ))}
      </div>

      {/* BOTTOM SECTION — Expenses list + Summary */}
      <div className="bottom-section">
        <div className="expense-panel">
          <ul>
            {filteredExpenses.map((item, index) => (
              <li key={index}>
                <span>{item.name} - ₹{item.amount} | {item.category}</span>
                <div className="actions">
                  <button onClick={() => {
                    setExpense(item.name);
                    setAmount(item.amount);
                    setCategory(item.category);
                    setEditIndex(index);
                  }}>Edit</button>
                  <button className="delete-btn" onClick={() => {
                    setExpenses(expenses.filter((_, i) => i !== index));
                  }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="analytics-panel">
          <h3>Category Summary</h3>
          <p>🍔 Food: ₹{categoryTotals.Food}</p>
          <p>📚 Stationery: ₹{categoryTotals.Stationery}</p>
          <p>🛒 Groceries: ₹{categoryTotals.Groceries}</p>
          <p>🎉 Campus Events: ₹{categoryTotals["Campus Events"]}</p>
          <p>📦 Miscellaneous: ₹{categoryTotals.Miscellaneous}</p>
        </div>
      </div>

      {/* PIE CHART */}
      <div className="chart-section">
        <h3>Expense Distribution</h3>
        <div className="chart-container">
          <PieChart width={500} height={500}>
            <Pie data={chartData} cx="50%" cy="40%" outerRadius={130} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <footer className="footer">
        Created by Shivang 🚀• Expense Tracker Dashboard
      </footer>
    </div>
  );
}

export default App;