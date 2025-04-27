import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BookPage() {
  // Book list states
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("");

  // Add book form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    pengarang: "",
    penerbit: "",
    tahunTerbit: new Date().getFullYear(),
    userId: "",
    statusBukuId: ""
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="));

      if (!token) {
        // Redirect to login if no token found
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch all books on initial load
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/buku");

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();
        setBooks(data.data || []);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Failed to load books. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch users, categories, and statuses for filters and form
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch users
        const usersResponse = await fetch("http://localhost:3000/user");
        if (usersResponse.ok) {
          const userData = await usersResponse.json();
          setUsers(userData.data || []);

          // Set default userId for form if available
          if (userData.data && userData.data.length > 0) {
            setFormData((prev) => ({ ...prev, userId: userData.data[0].id }));
          }
        }

        // Fetch categories
        const categoriesResponse = await fetch(
          "http://localhost:3000/kategori"
        );
        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();
          setCategories(categoryData.data || []);
        }

        // Fetch status types
        const statusResponse = await fetch("http://localhost:3000/statusBuku");
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setStatuses(statusData.data || []);

          // Set default statusBukuId for form if available
          if (statusData.data && statusData.data.length > 0) {
            const availableStatus =
              statusData.data.find((s) => s.id === 1) || statusData.data[0];
            setFormData((prev) => ({
              ...prev,
              statusBukuId: availableStatus.id
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };

    fetchFilterData();
  }, []);

  // Handle filter changes
  const handleFilterChange = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:3000/buku";

      if (filterType !== "all" && selectedFilter) {
        // Different endpoints based on filter type
        switch (filterType) {
          case "user":
            url = `http://localhost:3000/buku/user/${selectedFilter}`;
            break;
          case "category":
            url = `http://localhost:3000/buku/kategori/${selectedFilter}`;
            break;
          case "status":
            url = `http://localhost:3000/buku/statusBuku/${selectedFilter}`;
            break;
          default:
            break;
        }
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch books with filter: ${filterType}`);
      }

      const data = await response.json();
      setBooks(data.data || []);
    } catch (error) {
      console.error("Error applying filter:", error);
      setError("Failed to apply filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setFilterType("all");
    setSelectedFilter("");

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/buku");

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setBooks(data.data || []);
    } catch (error) {
      console.error("Error resetting filters:", error);
      setError("Failed to reset filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tahunTerbit" || name === "userId" || name === "statusBukuId"
          ? Number(value)
          : value
    }));
  };

  // Handle adding a new book
  const handleAddBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const response = await fetch("http://localhost:3000/buku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add book");
      }

      setFormSuccess("Book added successfully!");

      // Clear form after successful submission
      setFormData({
        judul: "",
        pengarang: "",
        penerbit: "",
        tahunTerbit: new Date().getFullYear(),
        userId: formData.userId, // Keep the same user
        statusBukuId: formData.statusBukuId // Keep the same status
      });

      // Refresh the book list
      const booksResponse = await fetch("http://localhost:3000/buku");
      const booksData = await booksResponse.json();
      setBooks(booksData.data || []);

      // Close the form after a short delay
      setTimeout(() => {
        setShowAddForm(false);
        setFormSuccess(null);
      }, 1500);
    } catch (error) {
      console.error("Error adding book:", error);
      setFormError(error.message || "Failed to add book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await fetch(`http://localhost:3000/buku/${bookId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete book");
        }

        // Remove book from state
        setBooks(books.filter((book) => book.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
        setError("Failed to delete book. Please try again.");
      }
    }
  };

  // Toggle add book form visibility
  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setFormError(null);
    setFormSuccess(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Book Collection</h1>
        <button
          className={`${
            showAddForm ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded`}
          onClick={toggleAddForm}
        >
          {showAddForm ? "Cancel" : "Add New Book"}
        </button>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Book</h2>

          {/* Form Error Message */}
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError}
            </div>
          )}

          {/* Form Success Message */}
          {formSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleAddBook}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="judul"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="pengarang"
                >
                  Author
                </label>
                <input
                  type="text"
                  id="pengarang"
                  name="pengarang"
                  value={formData.pengarang}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="penerbit"
                >
                  Publisher
                </label>
                <input
                  type="text"
                  id="penerbit"
                  name="penerbit"
                  value={formData.penerbit}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="tahunTerbit"
                >
                  Year of Publication
                </label>
                <input
                  type="number"
                  id="tahunTerbit"
                  name="tahunTerbit"
                  value={formData.tahunTerbit}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="userId"
                >
                  User
                </label>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="statusBukuId"
                >
                  Book Status
                </label>
                <select
                  id="statusBukuId"
                  name="statusBukuId"
                  value={formData.statusBukuId}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`${
                  submitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                } text-white px-6 py-2 rounded`}
              >
                {submitting ? "Adding..." : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select
          className="mb-4 p-2 rounded"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All</option>
          <option value="user">User</option>
          <option value="category">Category</option>
          <option value="status">Status</option>
        </select>
        <input
          className="p-2 rounded"
          type="text"
          placeholder="Filter by..."
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white rounded px-4 py-2"
          onClick={handleFilterChange}
        >
          Filter
        </button>
        <button
          className="bg-gray-500 text-white rounded px-4 py-2 ml-2"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Books Table */}
      {loading ? (
        <p>Loading books...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Title</th>
                <th className="py-2 px-4 border">Author</th>
                <th className="py-2 px-4 border">Publisher</th>
                <th className="py-2 px-4 border">Year</th>
                <th className="py-2 px-4 border">User</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="py-2 px-4 border">{book.judul}</td>
                  <td className="py-2 px-4 border">{book.pengarang}</td>
                  <td className="py-2 px-4 border">{book.penerbit}</td>
                  <td className="py-2 px-4 border">{book.tahunTerbit}</td>
                  <td className="py-2 px-4 border">{book.user.nama}</td>
                  <td className="py-2 px-4 border">{book.statusBuku.nama}</td>
                  <td className="py-2 px-4 border">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => navigate(`/buku/edit/${book.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BookPage;
