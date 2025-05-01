import React, { useState } from 'react';
import styles from './allExpenses.module.css';

interface Expense {
    _id: string,
    name: string;
    price: number;
    date: string;
    vendor: string;
    category: string;
};

interface Budget {
    _id: string,
    category: string,
    goal: number,
    interval: string
  };

const EditExpensePopup: React.FC = () => {
    const [isVisible, setVisible] = useState(false);
      const [name, setName] = useState('');
      const [price, setPrice] = useState('');
      const [date, setDate] = useState('');
      const [vendor, setVendor] = useState('');

    const openPopup = () => setVisible(true);
    const closePopup = () => setVisible(false);
    const [category, setCategory] = useState('');
    const [budget, setBudget] = useState<Budget[]>([]);
    const [transactionAdded, setTransactionAdded] = useState(false);

    const submitTransaction = async(e: any) => {
        try {
          e.preventDefault();
    
          const disallowedCategories = ["total expenses", "temp total"];
    
          if (disallowedCategories.includes(category.trim().toLowerCase())) {
              alert(`"${category}" is a reserved category and cannot be added.`);
              return;
          }
    
          const categoryExists = budget.some(budgetItem => budgetItem.category.toLowerCase() === category.toLowerCase());
    
          if (!categoryExists) {
            const newBudget = {
              category: category.toLowerCase(),
              goal: 0,
              interval: "monthly"
            };
      
            try {
              const response = await fetch("/api/budget", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newBudget),
              });
      
              if (!response.ok) {
                throw new Error("Failed to create new budget category.");
              }
            } catch (error) {
              console.error("Error creating new budget category:", error);
              alert("Failed to create new budget category.");
              return;
            }
          }
        
          try {
              const response = await fetch("/api/transactions", { 
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name, price, date, vendor, category: category.toLowerCase()}),
              });
              
              if (response.ok) {
                setTransactionAdded(true);
              }
          } catch (error) {
              console.error("Error submitting transaction:", error);
          }      
        } catch (error) {
          alert("Fields cannot be blank!");
        }
      }

    return (
        <div>
            <button className="button" onClick={openPopup}>Add new expense</button>
            {isVisible && (
                // Close on background click
                <div onClick={closePopup}>
                {/* Prevent closing when clicking inside the popup */}
                <div onClick={(e) => e.stopPropagation()}>

                    <div className={styles.popupContent}>
                        {/* <span className="closeButton" id="closePopup">&times;</span> */}
                        <form id="expenseForm" onSubmit={submitTransaction}>
                        <label className={styles.formLabel}>Expense Name:</label>
                            <input className={styles.expensesInput} type="text" value={name} onChange={(e) => setName(e.target.value)} id="name" name="name" required></input><br></br>

                            <label className={styles.formLabel}>Price:</label>
                            <input className={styles.expensesInput} type="number" value={price} onChange={(e) => setPrice(e.target.value)} id="price" name="price" required></input><br></br>

                            <label className={styles.formLabel}>Date:</label>
                            <input className={styles.expensesInput} type="date" value={date} onChange={(e) => setDate(e.target.value)} id="date" name="date" required></input><br></br>

                            <label className={styles.formLabel}>Vendor:</label>
                            <input className={styles.expensesInput} type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} id="vendor" name="vendor" required></input><br></br>

                        <div className={styles["button-row"]}>
                        <label className={styles.formLabel}>Category:</label> 
                        <input 
                            className={styles.expensesInput}
                            list="categories" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value.toLowerCase())} 
                        />
                        <datalist id="categories">
                            {budget.length > 0 ? (
                            budget.filter((categoryOption) => 
                                !["total expenses", "temp total"].includes(categoryOption.category.toLowerCase())
                            ).map((categoryOption) => (
                                <option key={categoryOption._id} value={categoryOption.category} />
                            ))
                            ) : (
                            <option>No categories available</option>
                            )}
                        </datalist>
                        </div>
                    </form>
                    </div>
                </div>
                </div>
            )}
            </div>
        );
        };

export default EditExpensePopup;
        
