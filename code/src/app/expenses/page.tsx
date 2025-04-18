'use client'
import './expenses.css';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import AddExpensePopup from './addExpensePopup'; 
import { BarLoader } from 'react-spinners';
import { getCookie } from 'cookies-next';
import { DeleteRounded} from '@mui/icons-material';
import { jsPDF } from "jspdf";

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

export default function Expenses() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionAdded, setTransactionAdded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [audioURL, setAudioURL] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioURLRef = useRef<string | null>(null);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/transactions", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();
      setExpenses(data.expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget", {method: "GET"});
      if (!res.ok) throw new Error("Failed to fetch budget");

      const data = await res.json();
      setBudget(data.expenses || []);
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudget();
    if (transactionAdded) {
      setTransactionAdded(false);
      setName('');
      setPrice('');
      setDate('');
      setVendor('');
      setCategory('');
    }
  }, [transactionAdded]);

  const submitTransaction = async(e: any) => {
    try {
      e.preventDefault();

      const categoryExists = budget.some(budgetItem => budgetItem.category === category);

      if (!categoryExists) {
        const newBudget = {
          category,
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
            body: JSON.stringify({name, price, date, vendor, category}),
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

  const updateTransaction = async (transactionId: string, updatedTransaction: Partial<Expense>) => {
    try {
      const categoryExists = budget.some(budgetItem => budgetItem.category === category);

      if (!categoryExists) {
        const newBudget = {
          category,
          goal: 0,
          interval: "monthly"
        };

        try {
          const response = await fetch(`/api/transactions`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactionId, ...updatedTransaction }),
          });
      
          if (response.ok) {
            const updatedExpenses = expenses.map((expense) =>
              expense._id === transactionId ? { ...expense, ...updatedTransaction } : expense
            );
            setExpenses(updatedExpenses);
          } else {
            console.error("Failed to update transaction:", await response.json());
          }
        } catch (error) {
          console.error("Error updating transaction:", error);
        }
      }
    } catch (error) {
      alert("Fields cannot be blank!");
    }
  };  

  const deleteTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({transactionId})
      });
  
      if (response.ok) {
        setExpenses(expenses.filter(expense => expense._id !== transactionId));
      } else {
        console.error("Failed to delete transaction:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        alert("Please select a file.");
        return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
        const uploadResponse = await fetch("/api/sendDocument", {
            method: "POST",
            body: formData,
        });

        if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            const requestId = uploadResult.requestId;

            if (requestId) {
                let status = "notStarted";
                let results: any = null;
                let attempts = 0;
                const maxAttempts = 20;
                const interval = 1000;

                while (status !== "succeeded" && attempts < maxAttempts) {
                    try {
                        const resultsResponse = await fetch(`/api/getResults?id=${requestId}`);

                        if (resultsResponse.ok) {
                            const data: any = await resultsResponse.json();
                            status = data.status;
                            results = data;

                            if (status === "succeeded") {
                                console.log("Results:", results);
                                let merchantName;
                                let total;
                                let transactionDate;
                                let receiptType;
                                if (results.analyzeResult.documents[0].fields.MerchantName) {
                                  merchantName = results.analyzeResult.documents[0].fields.MerchantName.valueString;
                                }
                                if (results.analyzeResult.documents[0].fields.Total) {
                                  total = results.analyzeResult.documents[0].fields.Total.valueCurrency.amount;
                                }
                                if (results.analyzeResult.documents[0].fields.TransactionDate) {
                                  transactionDate = results.analyzeResult.documents[0].fields.TransactionDate.valueDate;
                                }
                                if (results.analyzeResult.documents[0].fields.ReceiptType) {
                                  receiptType = results.analyzeResult.documents[0].fields.ReceiptType.valueString;
                                }
                              
                                if (merchantName)
                                  setVendor(merchantName);
                                if (total)
                                  setPrice(total.toString());
                                if (transactionDate)
                                  setDate(transactionDate);
                                if (receiptType)
                                  setCategory(receiptType);

                                break;
                            }
                        } else {
                            console.error("Failed to fetch results:", await resultsResponse.json());
                        }
                    } catch (resultsError) {
                        console.error("Error fetching results:", resultsError);
                    }

                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, interval));
                }

                if (status !== "succeeded") {
                    alert("Processing timed out or failed.");
                }
            } else {
                console.error("apim-request-id not found in upload response body.");
                alert("Request ID not found.");
            }
        } else {
            const errorData = await uploadResponse.json();
            console.error("Failed to upload receipt:", errorData);
            alert("Failed to upload receipt.");
        }
    } catch (error) {
        console.error("Error uploading receipt:", error);
        alert("Error uploading receipt.");
    } finally {
      setIsLoading(false);
    }
  };

  // TESTING JSPDF (IGNORE)
  const textToPDF = () => {
    const doc = new jsPDF();
    doc.text("On April 9th, 2025, I bought coffee at Starbucks for a cost of $5.99", 10, 10);
    doc.save("transaction.pdf");  
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia(
          {
            audio: true,
          },
        )
    
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" });
            const url = URL.createObjectURL(blob);
            audioURLRef.current = url;
            setAudioURL(url);
            setIsRecording(false); 
            console.log("recording stopped");
          };

          mediaRecorder.start();
          setIsRecording(true);
          console.log("recording started");
        })
    
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    } else {
      console.log("getUserMedia not supported on your browser");
    }
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("stoppped recording");
    }
  };

  return (
    
    <div className="row">
      <div className="column left">
        <h2>Add New Expense</h2>
        <div className="upload-section">
          <div className="row">
          <div className="upload-left">
            <h3>Add with Receipt</h3>
            <form onSubmit={handleFileUpload}>
              <label className="label">Select a file:</label>
              <input type="file" id="input" onChange={handleFileChange}></input>
              <br></br>
              <input className="submitReceipt button" type="submit"></input>
            </form>
          </div>

          <div className="upload-middle">
              <h4>or</h4>
          </div>

          <div className="upload-right">

            <h3>Add with Voice</h3>
            <button className="recordButton" onClick={toggleRecording}>
            <img src={isRecording ? "https://i.ibb.co/5XggJSKx/pause.png": "https://i.ibb.co/KjMwJ7mD/micIcon.png"}></img></button>
            {/* <button className="button" onClick={stopRecording}>Stop</button> */}
            {audioURL && (
              <audio
                controls
                src={audioURL}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  padding: "10px",
                }}></audio>
            )}
            
            <input className="submitAudio button" type="submit"></input>
          </div>
          
          </div>







            {/* <div id ="expensePopup" className="popup"> */}
            <div className="popupContent">
            {/* <span className="closeButton" id="closePopup">&times;</span> */}
            <form id="expenseForm" onSubmit={submitTransaction}>
            <label>Expense Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} id="name" name="name" required></input><br></br>

                <label>Price:</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} id="price" name="price" required></input><br></br>

                <label>Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} id="date" name="date" required></input><br></br>

                <label>Vendor:</label>
                <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} id="vendor" name="vendor" required></input><br></br>

              <div className="button-row">
              <label>Category:</label>
              <input 
                list="categories" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
              />
              <datalist id="categories">
                {budget.length > 0 ? (
                  budget.map((categoryOption) => (
                    <option key={categoryOption._id} value={categoryOption.category} />
                  ))
                ) : (
                  <option>No categories available</option>
                )}
              </datalist>
              <br></br>

              <button className="button" type="submit">Add new expense!</button>
            </div>
            </form>
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <BarLoader color="#00BFFF" width={300} />
          </div>
        )}

        <br></br>
          
        
        {/* <AddExpensePopup /> */}

        
      
      </div>

      <div className="column right"><h2>Recent Expenses</h2>
      <ul>
        {expenses.length === 0 ? (
          <li>No recent expenses</li>
        ) : (
        expenses.map((expense) => (
        <li key={expense._id} className="expense-item">
          <div className="expense-info">
            <div><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</div>
            <div>${expense.price.toFixed(2)} spent on {expense.category} at {expense.vendor}.</div>
          </div>
          <button className="deleteButton" onClick={() => deleteTransaction(expense._id)}>
            <DeleteRounded sx={{ color: '#FF9BD1' }}/>
          </button>
          </li>
          ))
        )}
      </ul>

        <Link href="/allExpenses">
          <p className="view-all-expenses">
          View all expenses
          </p>
        </Link>
        

      </div>  
    </div>
  );
}