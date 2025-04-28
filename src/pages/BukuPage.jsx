import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import Navbar from "./Navbar";

// Fungsi untuk mengambil token dari cookies
const getTokenFromCookies = () => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token;
};

const BukuPage = () => {
  const [judul, setJudul] = useState("");
  const [pengarang, setPengarang] = useState("");
  const [penerbit, setPenerbit] = useState("");
  const [tahunTerbit, setTahunTerbit] = useState("");
  const [statusBukuId, setStatusBukuId] = useState("");
  const [statusBukuList, setStatusBukuList] = useState([]);
  const [bukuList, setBukuList] = useState([]);
  const [selectedBukuId, setSelectedBukuId] = useState(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("");

  // Mengambil data status buku
  const fetchStatusBuku = async () => {
    const token = getTokenFromCookies(); // Ambil token dari cookies

    try {
      const response = await fetch("http://localhost:3000/statusBuku", {
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      const data = await response.json();
      if (data.data) {
        setStatusBukuList(data.data); // Simpan status buku
      }
      setMessage(data.message || "Gagal mengambil status buku");
    } catch (error) {
      console.error("Error fetching status buku:", error);
      setMessage("Gagal mengambil status buku");
    }
  };

  // Mengambil semua buku
  const fetchBuku = async () => {
    const url = filter
      ? `http://localhost:3000/buku/${filter}`
      : "http://localhost:3000/buku";
    const token = getTokenFromCookies(); // Ambil token dari cookies

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      const data = await response.json();
      if (data.data) {
        setBukuList(data.data);
      }
      setMessage(data.message || "Gagal mengambil data buku");
    } catch (error) {
      console.error("Error fetching buku:", error);
      setMessage("Gagal mengambil data buku");
    }
  };

  useEffect(() => {
    fetchBuku();
    fetchStatusBuku(); // Ambil status buku saat pertama kali render
  }, [filter]);

  // Menambah buku
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      statusBukuId: Number(statusBukuId)
    };

    const token = getTokenFromCookies(); // Ambil token dari cookies

    try {
      const response = await fetch("http://localhost:3000/buku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();
      setMessage(result.message);
      if (result.data) {
        fetchBuku(); // Refresh buku list setelah berhasil menambah
      }
    } catch (error) {
      console.error("Error posting buku:", error);
      setMessage("Gagal menambah buku");
    }
  };

  // Mengupdate buku
  const handleUpdate = async () => {
    if (!selectedBukuId) {
      setMessage("Pilih buku yang akan diupdate");
      return;
    }

    const requestBody = {
      judul,
      pengarang,
      penerbit,
      tahunTerbit,
      statusBukuId: Number(statusBukuId)
    };

    const token = getTokenFromCookies(); // Ambil token dari cookies

    try {
      const response = await fetch(
        `http://localhost:3000/buku/${selectedBukuId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(requestBody)
        }
      );
      const result = await response.json();
      setMessage(result.message);
      if (result.data) {
        fetchBuku(); // Refresh buku list setelah berhasil mengupdate
      }
    } catch (error) {
      console.error("Error updating buku:", error);
      setMessage("Gagal mengupdate buku");
    }
  };

  // Menghapus buku
  const handleDelete = async (bukuId) => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus buku ini?"
    );
    if (!confirmDelete) return;

    const token = getTokenFromCookies(); // Ambil token dari cookies

    try {
      const response = await fetch(`http://localhost:3000/buku/${bukuId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      });
      const result = await response.json();
      setMessage(result.message);
      fetchBuku(); // Refresh buku list setelah berhasil menghapus
    } catch (error) {
      console.error("Error deleting buku:", error);
      setMessage("Gagal menghapus buku");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold">Form Buku</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">Judul</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block">Pengarang</label>
            <input
              type="text"
              value={pengarang}
              onChange={(e) => setPengarang(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block">Penerbit</label>
            <input
              type="text"
              value={penerbit}
              onChange={(e) => setPenerbit(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block">Tahun Terbit</label>
            <input
              type="number"
              value={tahunTerbit}
              onChange={(e) => setTahunTerbit(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block">Status Buku</label>
            <select
              value={statusBukuId}
              onChange={(e) => setStatusBukuId(e.target.value)}
              className="border p-2 w-full"
              required
            >
              <option value="">Pilih Status Buku</option>
              {statusBukuList.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.nama}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="bg-green-500 text-white p-2 w-full">
            Tambah Buku
          </button>
        </form>

        {message && <p className="mt-4">{message}</p>}

        <h2 className="text-lg font-bold mt-6">Daftar Buku</h2>
        <div className="space-y-2">
          {bukuList.length > 0 ? (
            bukuList.map((buku) => (
              <div key={buku.id} className="border p-2">
                <p>
                  <strong>Judul:</strong> {buku.judul}
                </p>
                <p>
                  <strong>Pengarang:</strong> {buku.pengarang}
                </p>
                <p>
                  <strong>Status:</strong> {buku.statusBuku.nama}
                </p>
                <p>
                  <strong>Tahun Terbit:</strong> {buku.tahunTerbit}
                </p>
                <button
                  onClick={() => {
                    setSelectedBukuId(buku.id);
                    setJudul(buku.judul);
                    setPengarang(buku.pengarang);
                    setPenerbit(buku.penerbit);
                    setTahunTerbit(buku.tahunTerbit);
                    setStatusBukuId(buku.statusBukuId);
                  }}
                  className="bg-yellow-500 text-white p-1 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(buku.id)}
                  className="bg-red-500 text-white p-1"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p></p>
          )}
        </div>

        {selectedBukuId && (
          <div className="mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white p-2"
            >
              Update Buku
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BukuPage;
