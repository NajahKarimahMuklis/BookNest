import { useState } from "react";

export default function AddBukuForm() {
  const [judul, setJudul] = useState("");
  const [pengarang, setPengarang] = useState("");
  const [penerbit, setPenerbit] = useState("");
  const [tahunTerbit, setTahunTerbit] = useState("");
  const [userId, setUserId] = useState(""); // userId
  const [statusBukuId, setStatusBukuId] = useState(""); // statusId
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/buku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          judul,
          pengarang,
          penerbit,
          tahunTerbit,
          userId,
          statusBukuId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Buku berhasil ditambahkan!");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Gagal menghubungi server.");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Tambah Buku Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Judul Buku</label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Pengarang</label>
          <input
            type="text"
            value={pengarang}
            onChange={(e) => setPengarang(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Penerbit</label>
          <input
            type="text"
            value={penerbit}
            onChange={(e) => setPenerbit(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Tahun Terbit</label>
          <input
            type="number"
            value={tahunTerbit}
            onChange={(e) => setTahunTerbit(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">User ID</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Status Buku</label>
          <select
            value={statusBukuId}
            onChange={(e) => setStatusBukuId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Pilih Status</option>
            <option value="1">Tersedia</option>
            <option value="2">Dipinjam</option>
            <option value="3">Rusak</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Tambah Buku
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
