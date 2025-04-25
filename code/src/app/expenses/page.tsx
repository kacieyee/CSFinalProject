'use client'
import './expenses.css';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import AddExpensePopup from './addExpensePopup'; 
import { BarLoader } from 'react-spinners';
import { DeleteRounded} from '@mui/icons-material';
import { jsPDF } from "jspdf";
import { useSearchParams } from 'next/navigation';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
  
    const name = params.get('name');
    const price = params.get('price');
    const date = params.get('date');
    const vendor = params.get('vendor');
    const category = params.get('category');
  
    if (name) setName(name);
    if (price) setPrice(price);
    if (date) setDate(date);
    if (vendor) setVendor(vendor);
    if (category) setCategory(category);
  
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);  

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

  const editTransaction = (expense: Expense) => {
    setName(expense.name);
    setPrice(expense.price.toString());
    setDate(expense.date.slice(0, 10));
    setVendor(expense.vendor);
    setCategory(expense.category.toLowerCase());
  
    deleteTransaction(expense._id);
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

    processFile(selectedFile, null, null, null);
  };

  const processFile = async (file: File, extractedPriceFromAudio: number | null, extractedDateFromAudio: Date | null, extractedCategoryFromAudio: string | null) => {
    setIsLoading(true);

    const formData = new FormData();
    const filename = file.name || "transcription.pdf";
    formData.append("document", file, filename);

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
                                  setCategory(receiptType.toLowerCase());

                                if (extractedPriceFromAudio !== null) {
                                  setPrice(extractedPriceFromAudio.toString());
                                }

                                if (extractedDateFromAudio !== null) {
                                  const year = extractedDateFromAudio.getFullYear();
                                  const month = (extractedDateFromAudio.getMonth() + 1).toString().padStart(2, '0');
                                  const day = extractedDateFromAudio.getDate().toString().padStart(2, '0');
                                  const formattedDate = `${year}-${month}-${day}`;
                                  setDate(formattedDate);
                                }

                                if (extractedCategoryFromAudio !== null) {
                                  setCategory(extractedCategoryFromAudio.toLowerCase());
                                }

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
            const file = new File([blob], "recording.ogg", { type: blob.type });
            const url = URL.createObjectURL(blob);
            audioURLRef.current = url;
            setAudioURL(url);
            setIsRecording(false); 
            processAudio(file);
          };

          mediaRecorder.start();
          setIsRecording(true);
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

  const processAudio = async (audioFile: File) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("audio", audioFile);
  
    try {
      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      const trimmedText = data.text.trim();
      const transcribedText = trimmedText.endsWith('.') ? trimmedText.slice(0, -1) : trimmedText;
      console.log(transcribedText);
      let extractedPriceValue: number | null = null;
      let extractedDateValue: Date | null = null;
      let extractedCategory: string | null = null;

      // if a user's budget category was stated, extract it
      fetchBudget();
      for (const item of budget) {
        if (transcribedText.toLowerCase().includes(item.category.toLowerCase())) {
          extractedCategory = item.category;
          break;
        }
      }

      // if a price was stated, extract it
      const priceMatch = transcribedText.match(/\$\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\$\d+(?:\.\d{2})?/g);

      if (priceMatch && priceMatch.length > 0) {
        const cleaned = priceMatch[0].replace(/[$,]/g, '');
        extractedPriceValue = parseFloat(cleaned);
      }

      // if a date was stated, extract it
      const dateMatch = transcribedText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{1,2})(?:st|nd|rd|th)?(?:,\s(\d{4}))?|(\d{1,2})-(\d{1,2})(-(\d{2,4}))?/i);

      if (dateMatch) {
        // get current year in case year is not mentioned
        const currentYear = new Date().getFullYear();

        if (dateMatch[1]) { // text format, year optional
          const monthString = dateMatch[1];
          const day = parseInt(dateMatch[2], 10);
          const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : currentYear;
          const monthIndex = new Date(Date.parse(monthString + " 1, 2000")).getMonth();
          extractedDateValue = new Date(year, monthIndex, day);
        } else if (dateMatch[4]) { // MM-DD-YY or MM-DD-YYYY format, year optional
          const month = parseInt(dateMatch[4], 10) - 1;
          const day = parseInt(dateMatch[5], 10);
          let year = dateMatch[6] ? parseInt(dateMatch[6], 10) : currentYear;
      
          if (year >= 0 && year <= 99 && !dateMatch[6] || (dateMatch[6] && dateMatch[6].length === 2)) {
            year += 2000;
          }
          extractedDateValue = new Date(year, month, day);
        }
      }

      // convert to pdf
      const pdf = new jsPDF();
      pdf.text(transcribedText, 10, 10);
      const pdfBlob = pdf.output('blob');

      // process pdf
      processFile(pdfBlob as File, extractedPriceValue, extractedDateValue, extractedCategory);
    } catch (error) {
      console.error("Error transcribing audio:", error);
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
            <label className="label">Record a voice memo:</label>
            <button className="recordButton" onClick={toggleRecording}>
            <img src={isRecording ? "https://i.ibb.co/5XggJSKx/pause.png": "https://i.ibb.co/KjMwJ7mD/micIcon.png"}></img></button>
            {/* <button className="button" onClick={stopRecording}>Stop</button> */}
            
            
            {isLoading && (
              <div className="loading-overlay">
                <BarLoader color="#FF9BD1" width={300} />
              </div>
            )}
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
              <br></br>

              <button className="button" type="submit">Add new expense!</button>
            </div>
            </form>
          </div>
        </div>

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
            <div className="date"><strong></strong> {new Date(expense.date).toLocaleDateString('en-US', {weekday: "long", day: "numeric", month: "long", year: "numeric"})}</div>
            <div className="expenseprice">${expense.price.toFixed(2)} at {expense.vendor}.</div>
          </div>
            {/* <button className="editButton" onClick={() => editTransaction(expense)}>
              [Edit]
            </button> */}
            <div className="expense-category">{expense.category}</div>
            {/* <button className="deleteButton" onClick={() => deleteTransaction(expense._id)}>x
              <DeleteRounded sx={{ color: '#FF9BD1' }}/>
            </button> */}
            
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