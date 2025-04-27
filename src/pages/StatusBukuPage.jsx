import React, { useEffect, useState } from "react";

function StatusBukuPage() {
  const [statusBuku, setStatusBuku] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
  });
  const [selectedStatusBuku, setSelectedStatusBuku] = useState(null);

  useEffect(() => {
    const fetchStatusBuku = async () => {
      try {
        const response = await fetch("http://localhost:3000/statusBuku");
        const data = await response.json();

        if (response.ok) {
          setStatusBuku(data.data); // Assuming the data contains a 'data' field
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching status buku:", error);
      }
    };

    fetchStatusBuku();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddOrEditStatusBuku = async (e) => {
    e.preventDefault();
    const method = selectedStatusBuku ? "PUT" : "POST"; // If selectedStatusBuku exists, we are editing
    const url = selectedStatusBuku
      ? `http://localhost:3000/statusBuku/${selectedStatusBuku.id}`
      : "http://localhost:3000/statusBuku";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok) {
        setStatusBuku((prev) => {
          if (selectedStatusBuku) {
            // Update the edited statusBuku
            return prev.map((status) =>
              status.id === selectedStatusBuku.id ? data.data : status
            );
          } else {
            // Add new statusBuku to the list
            return [...prev, data.data];
          }
        });
        resetForm();
      } else {
        throw new Error(data.message || "Failed to add/edit status buku");
      }
    } catch (error) {
      console.error("Error adding/editing status buku:", error);
    }
  };

  const handleEditStatusBuku = (status) => {
    setSelectedStatusBuku(status);
    setFormData({
      nama: status.nama,
    });
  };

  const handleDeleteStatusBuku = async (statusBukuId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/statusBuku/${statusBukuId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (response.ok) {
        setStatusBuku((prev) =>
          prev.filter((status) => status.id !== statusBukuId)
        );
      } else {
        console.error(data.message || "Failed to delete status buku");
      }
    } catch (error) {
      console.error("Error deleting status buku:", error);
    }
  };

  const resetForm = () => {
    setSelectedStatusBuku(null);
    setFormData({
      nama: "",
    });
  };

  return (
    <div>
      <h2>Daftar Status Buku</h2>
      <button onClick={resetForm}>Tambah Status Buku Baru</button>

      {/* Form Add/Edit StatusBuku */}
      <form onSubmit={handleAddOrEditStatusBuku}>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleFormChange}
          placeholder="Nama Status Buku"
        />
        <button type="submit">
          {selectedStatusBuku ? "Simpan Perubahan" : "Tambah Status Buku"}
        </button>
      </form>

      {/* Daftar Status Buku */}
      <div>
        {statusBuku.map((status) => (
          <div key={status.id}>
            <p>{status.nama}</p>
            <button onClick={() => handleEditStatusBuku(status)}>Edit</button>
            <button onClick={() => handleDeleteStatusBuku(status.id)}>
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatusBukuPage;
