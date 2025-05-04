import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BukuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [newBook, setNewBook] = useState({
    judul: "",
    pengarang: "",
    penerbit: "",
    tahunTerbit: "",
    statusBukuId: 1, // Default to available (1)
  });
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get token from cookies
  const getTokenFromCookies = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    return token;
  };

  // Check server connection
  const checkServerConnection = async () => {
    try {
      const token = getTokenFromCookies();
      const response = await fetch("http://localhost:3000/", {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        signal: AbortSignal.timeout(5000),
      });
      console.log("Server connection test:", response.status);
      return response.ok;
    } catch (error) {
      console.error("Server connection error:", error);
      return false;
    }
  };

  // Fetch all books
  const fetchBooks = async () => {
    setLoading(true);
    const token = getTokenFromCookies();

    try {
      

      const response = await fetch("http://localhost:3000/buku", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Fetch books response status:", response.status);

      const data = await response.json();
      console.log("Fetch books response data:", data);

      if (response.ok) {
        setBooks(data.data);
        setError("");
      } else {
        setError(data.message || "Gagal mendapatkan data buku");
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Gagal terhubung ke server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount or when returning to the page
  useEffect(() => {
    fetchBooks();
    fetchStatusOptions();

    // Store books data in sessionStorage when component unmounts
    return () => {
      if (books.length > 0) {
        sessionStorage.setItem("booksData", JSON.stringify(books));
      }
    };
  }, []);

  // Load books from sessionStorage when navigation occurs
  useEffect(() => {
    const storedBooks = sessionStorage.getItem("booksData");
    if (storedBooks && books.length === 0) {
      setBooks(JSON.parse(storedBooks));
    }
  }, [location.pathname]);

  // Fetch status options from API
  const fetchStatusOptions = async () => {
    const token = getTokenFromCookies();

    try {
      const response = await fetch("http://localhost:3000/statusBuku", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Fetch status options response status:", response.status);

      const data = await response.json();
      console.log("Fetch status options response data:", data);

      if (response.ok) {
        setStatusOptions(data.data);
        // Store in sessionStorage for later use
        sessionStorage.setItem("statusOptions", JSON.stringify(data.data));
      } else {
        console.error("Failed to fetch status options:", data.message);
        // Try to get from sessionStorage if API fails
        const storedStatusOptions = sessionStorage.getItem("statusOptions");
        if (storedStatusOptions) {
          setStatusOptions(JSON.parse(storedStatusOptions));
        }
      }
    } catch (err) {
      console.error("Error fetching status options:", err);
      // Try to get from sessionStorage if API fails
      const storedStatusOptions = sessionStorage.getItem("statusOptions");
      if (storedStatusOptions) {
        setStatusOptions(JSON.parse(storedStatusOptions));
      }
    }
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editBook) {
      setEditBook({ ...editBook, [name]: value });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  // Handle form submission for adding a new book
  const handleAddBookSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    // Validate form data
    if (
      !newBook.judul ||
      !newBook.pengarang ||
      !newBook.penerbit ||
      !newBook.tahunTerbit
    ) {
      setError("Semua field harus diisi");
      setLoading(false);
      return;
    }

    // Convert tahunTerbit to number
    const bookData = {
      ...newBook,
      tahunTerbit: Number(newBook.tahunTerbit),
      statusBukuId: Number(newBook.statusBukuId),
    };

    console.log("Submitting book data:", bookData);

    try {
      const response = await fetch("http://localhost:3000/buku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(bookData),
      });

      console.log("Add book response status:", response.status);

      const data = await response.json();
      console.log("Add book response data:", data);

      if (response.ok) {
        // Add statusBuku details to the book data
        const statusBuku = statusOptions.find(
          (option) => option.id === Number(data.data.statusBukuId)
        );
        const newBookWithStatus = {
          ...data.data,
          statusBuku: statusBuku || { nama: "Unknown" },
        };
        setBooks([...books, newBookWithStatus]);
        setNewBook({
          judul: "",
          pengarang: "",
          penerbit: "",
          tahunTerbit: "",
          statusBukuId: statusOptions.length > 0 ? statusOptions[0].id : 1,
        });
        // Update sessionStorage
        const updatedBooks = [...books, newBookWithStatus];
        sessionStorage.setItem("booksData", JSON.stringify(updatedBooks));
        setError("");
      } else {
        setError(data.message || "Terjadi kesalahan saat menambahkan buku");
      }
    } catch (err) {
      console.error("Error adding book:", err);
      setError("Gagal menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle update of a book
  const handleUpdateBookSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getTokenFromCookies();

    // Convert tahunTerbit to number
    const bookData = {
      ...editBook,
      tahunTerbit: Number(editBook.tahunTerbit),
      statusBukuId: Number(editBook.statusBukuId),
    };

    try {
      const response = await fetch(
        `http://localhost:3000/buku/${editBook.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(bookData),
        }
      );

      console.log("Update book response status:", response.status);

      const data = await response.json();
      console.log("Update book response data:", data);

      if (response.ok) {
        // Add statusBuku details to the updated book data
        const statusBuku = statusOptions.find(
          (option) => option.id === Number(data.data.statusBukuId)
        );
        const updatedBookWithStatus = {
          ...data.data,
          statusBuku: statusBuku || { nama: "Unknown" },
        };
        const updatedBooks = books.map((book) =>
          book.id === editBook.id ? updatedBookWithStatus : book
        );
        setBooks(updatedBooks);
        // Update sessionStorage
        sessionStorage.setItem("booksData", JSON.stringify(updatedBooks));
        setEditBook(null);
        setError("");
      } else {
        setError(data.message || "Terjadi kesalahan saat mengupdate buku");
      }
    } catch (err) {
      console.error("Error updating book:", err);
      setError("Gagal menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete of a book
  const handleDeleteBook = async (bukuId) => {
    setLoading(true);
    const token = getTokenFromCookies();

    try {
      const response = await fetch(`http://localhost:3000/buku/${bukuId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Delete book response status:", response.status);

      const data = await response.json();
      console.log("Delete book response data:", data);

      if (response.ok) {
        const filteredBooks = books.filter((book) => book.id !== bukuId);
        setBooks(filteredBooks);
        // Update sessionStorage
        sessionStorage.setItem("booksData", JSON.stringify(filteredBooks));
        setError("");
      } else {
        setError(data.message || "Terjadi kesalahan saat menghapus buku");
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      setError("Gagal menghubungi server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const navigateToStatusBuku = () => navigate("/statusBuku");
  const navigateToKategori = () => navigate("/kategori");
  const navigateToBooks = () => navigate("/buku");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Library Management</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={navigateToBooks}
              className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Books
            </button>
            <button
              onClick={navigateToStatusBuku}
              className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Status Buku
            </button>
            <button
              onClick={navigateToKategori}
              className="px-4 py-2 rounded hover:bg-blue-700 font-medium"
            >
              Kategori
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6 flex-grow">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">
          Book Collection
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form to Add or Edit Book */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editBook ? "Edit Buku" : "Tambahkan Buku Baru"}
          </h2>
          <form
            onSubmit={editBook ? handleUpdateBookSubmit : handleAddBookSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="judul"
              placeholder="Judul"
              value={editBook ? editBook.judul : newBook.judul}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="pengarang"
              placeholder="Pengarang"
              value={editBook ? editBook.pengarang : newBook.pengarang}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="penerbit"
              placeholder="Penerbit"
              value={editBook ? editBook.penerbit : newBook.penerbit}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="tahunTerbit"
              placeholder="Tahun Terbit"
              value={editBook ? editBook.tahunTerbit : newBook.tahunTerbit}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="statusBukuId"
              value={editBook ? editBook.statusBukuId : newBook.statusBukuId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.length > 0 ? (
                statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nama}
                  </option>
                ))
              ) : (
                <option value={1}>Loading status options...</option>
              )}
            </select>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading
                ? editBook
                  ? "Updating..."
                  : "Adding..."
                : editBook
                ? "Update Buku"
                : "Tambah Buku"}
            </button>
            {editBook && (
              <button
                type="button"
                onClick={() => setEditBook(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Books Grid */}
        {loading && !editBook && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && books.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl text-gray-600">No books found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-3">{book.judul}</h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Judul:</span> {book.judul}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Pengarang:</span>{" "}
                    {book.pengarang}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Penerbit:</span>{" "}
                    {book.penerbit}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Tahun Terbit:</span>{" "}
                    {book.tahunTerbit}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Status:</span>{" "}
                    {book.statusBuku?.nama ||
                      statusOptions.find((s) => s.id === book.statusBukuId)
                        ?.nama ||
                      "Unknown"}
                  </p>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => setEditBook(book)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BukuPage;
