import { Link } from "react-router-dom";

function Navbar() {
  return (
    <>
      <div className="bg-green-500 text-white p-4">
        <div className="flex space-x-10 justify-end items-center text-lg pr-10">
          <Link to={"/buku"}>
            <h1 className=" font-bold">Beranda</h1>
          </Link>
          <Link to={"/statusbuku"}>
            <h1 className=" font-bold">Status Buku</h1>
          </Link>
          <Link to={"/kategori"}>
            <h1 className=" font-bold">Kategori</h1>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
