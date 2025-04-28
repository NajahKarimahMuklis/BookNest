import React, { useState, useEffect } from "react";
import BookList from "./BookList";
import CategoryList from "./CategoryList";
import BookForm from "./BookForm";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:3000/books");
      const data = await response.json();
      setBooks(data.data);
    } catch (error) {
      console.error("Error fetching books", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/categories");
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const addBook = async (book) => {
    try {
      const response = await fetch("http://localhost:3000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      setBooks([...books, data.data]);
    } catch (error) {
      console.error("Error adding book", error);
    }
  };

  const updateBook = async (book) => {
    try {
      const response = await fetch(`http://localhost:3000/buku/${bukuId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book),
      });
      const data = await response.json();
      setBooks(books.map((b) => (b.id === book.id ? data.data : b)));
    } catch (error) {
      console.error("Error updating book", error);
    }
  };

  const deleteBook = async (id) => {
    try {
      await fetch(`http://localhost:3000/buku/${id}`, {
        method: "DELETE",
      });
      setBooks(books.filter((book) => book.id !== id));
    } catch (error) {
      console.error("Error deleting book", error);
    }
  };

  return (
    <div className="space-y-8">
      <BookForm
        addBook={addBook}
        updateBook={updateBook}
        selectedBook={selectedBook}
        setSelectedBook={setSelectedBook}
      />
      <div className="flex">
        <div className="w-1/2 pr-4">
          <BookList
            books={books}
            deleteBook={deleteBook}
            setSelectedBook={setSelectedBook}
          />
        </div>
        <div className="w-1/2 pl-4">
          <CategoryList categories={categories} />
        </div>
      </div>
    </div>
  );
}
