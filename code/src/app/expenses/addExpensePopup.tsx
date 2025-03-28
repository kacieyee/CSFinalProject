import React, { useState } from 'react';

const AddExpensePopup: React.FC = () => {
    const [isVisible, setVisible] = useState(false);

    const openPopup = () => setVisible(true);
    const closePopup = () => setVisible(false);

    return (
        <div>
            <button className="button" onClick={openPopup}>Add new expense</button>
            {isVisible && (
                // Close on background click
                <div onClick={closePopup}>
                {/* Prevent closing when clicking inside the popup */}
                <div onClick={(e) => e.stopPropagation()}>
                    <h2>Add new Expense</h2>
                    {/* Close button inside the popup */}
                    <span onClick={closePopup}> &times; </span>

                    {/* Expense form */}
                    <form id="expenseForm">
                    <label>Expense Name:</label>
                    <input type="text" id="name" name="name" required /><br />

                    <label>Price:</label>
                    <input type="number" id="price" name="price" required /><br />

                    <label>Date:</label>
                    <input type="date" id="date" name="date" required /><br />

                    <label>Vendor:</label>
                    <input type="text" id="vendor" name="vendor" required /><br />

                    <label>Category:</label>
                    <input type="text" id="category" name="category" required /><br />
                    </form>

                    <button className="button" type="button">
                    Add new expense!
                    </button>
                </div>
                </div>
            )}
            </div>
        );
        };

export default AddExpensePopup;
        
