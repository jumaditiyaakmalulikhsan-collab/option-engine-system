
const kategori = [
    { id: "harga", nama: "Harga", ikon: "💰", poin: 0 },
    { id: "ram", nama: "RAM", ikon: "🧠", poin: 0 },
    { id: "storage", nama: "Storage", ikon: "💾", poin: 0 },
    { id: "prosesor", nama: "Performa Prosesor", ikon: "⚡", poin: 0 },
    { id: "garansi", nama: "Garansi", ikon: "🛡️", poin: 0 }
];

const TOTAL_MAKSIMAL = 10;
const MAKSIMAL_PER_KATEGORI = 5;

const dataLaptop = [
    {
        nama: "Acer Aspire Lite 14",
        harga: 8669000,
        ram: 8,
        storage: 512,
        prosesor: 10746,
        garansi: 2
    },
    {
        nama: "ASUS Vivobook S14",
        harga: 19424000,
        ram: 16,
        storage: 1024,
        prosesor: 18539,
        garansi: 3
    },
    {
        nama: "ADVAN Workmate",
        harga: 6399000,
        ram: 8,
        storage: 256,
        prosesor: 6765,
        garansi: 1
    },
    {
        nama: "HP EliteBook 8 G1i",
        harga: 32566000,
        ram: 32,
        storage: 512,
        prosesor: 19283,
        garansi: 3
    },
    {
        nama: "Lenovo ThinkPad T14 Gen 6",
        harga: 48415000,
        ram: 32,
        storage: 512,
        prosesor: 33977,
        garansi: 3
    }
];


function normalisasi(nilai, nilaiMaksimum, jenis) {
    if (jenis === "cost") {
        return nilaiMaksimum / nilai;
    }

    return nilai / nilaiMaksimum;
}

function ambilNilaiPembanding(kriteria, jenis) {
    const nilai = dataLaptop.map((laptop) => laptop[kriteria]);

    if (jenis === "cost") {
        return Math.min(...nilai);
    }

    return Math.max(...nilai);
}

const jenisKriteria = {
    harga: "cost",
    ram: "benefit",
    storage: "benefit",
    prosesor: "benefit",
    garansi: "benefit"
};

function hitungRanking() {
    const hasil = dataLaptop.map((laptop) => {
        let skor = 0;

        kategori.forEach((item) => {
            const kriteria = item.id;
            const jenis = jenisKriteria[kriteria];
            const pembanding = ambilNilaiPembanding(kriteria, jenis);
            const nilaiNormalisasi = normalisasi(
                laptop[kriteria],
                pembanding,
                jenis
            );
            const bobot = item.poin / 10;

            skor += nilaiNormalisasi * bobot;
        });

        return {
            nama: laptop.nama,
            skor: skor
        };
    });

    return hasil.sort((a, b) => b.skor - a.skor);
}



const kategoriList = document.getElementById("kategoriList");
const totalPoin = document.getElementById("totalPoin");
const sisaPoin = document.getElementById("sisaPoin");
const pesan = document.getElementById("pesan");
const btnLanjut = document.getElementById("btnLanjut");
const btnReset = document.getElementById("btnReset");

function hitungTotal() {
    return kategori.reduce((total, item) => total + item.poin, 0);
}

function tampilkanKategori() {
    kategoriList.innerHTML = "";

    kategori.forEach((item) => {
        const baris = document.createElement("div");
        baris.className = "category-row";

        const indikator = Array.from(
            { length: MAKSIMAL_PER_KATEGORI },
            (_, i) =>
                `<span class="point-bar ${i < item.poin ? "active" : ""}"></span>`
        ).join("");

        baris.innerHTML = `
            <div class="category-icon">${item.ikon}</div>

            <div class="category-info">
                <h3>${item.nama}</h3>
                <div class="point-bars">${indikator}</div>
            </div>

            <button class="arrow-btn"
                data-id="${item.id}"
                data-aksi="kurang"
                aria-label="Kurangi poin ${item.nama}"
                ${item.poin === 0 ? "disabled" : ""}>
                &#10094;
            </button>

            <div class="point-value">${item.poin}</div>

            <button class="arrow-btn"
                data-id="${item.id}"
                data-aksi="tambah"
                aria-label="Tambah poin ${item.nama}"
                ${item.poin === MAKSIMAL_PER_KATEGORI ||
                  hitungTotal() >= TOTAL_MAKSIMAL ? "disabled" : ""}>
                &#10095;
            </button>
        `;

        kategoriList.appendChild(baris);
    });

    const total = hitungTotal();

    totalPoin.textContent = `${total} / ${TOTAL_MAKSIMAL}`;
    sisaPoin.textContent = TOTAL_MAKSIMAL - total;
    btnLanjut.disabled = total !== TOTAL_MAKSIMAL;

    if (total === TOTAL_MAKSIMAL) {
        pesan.textContent = "Poin lengkap! Kamu bisa melanjutkan.";
        pesan.className = "message success";
    } else {
        pesan.textContent =
            `Tambahkan ${TOTAL_MAKSIMAL - total} poin lagi untuk melanjutkan.`;
        pesan.className = "message";
    }
}

kategoriList.addEventListener("click", (event) => {
    const tombol = event.target.closest("button[data-id]");

    if (!tombol || tombol.disabled) return;

    const item = kategori.find(
        (kategoriItem) => kategoriItem.id === tombol.dataset.id
    );

    if (!item) return;

    if (tombol.dataset.aksi === "tambah") {
        if (hitungTotal() >= TOTAL_MAKSIMAL) return;
        if (item.poin >= MAKSIMAL_PER_KATEGORI) return;

        item.poin++;
    } else {
        if (item.poin <= 0) return;

        item.poin--;
    }

    tampilkanKategori();
});


const hasilRekomendasi = document.getElementById("hasilRekomendasi");
const skorTerbaik = document.getElementById("skorTerbaik");
const namaLaptop = document.getElementById("namaLaptop");
const hargaLaptop = document.getElementById("hargaLaptop");
const btnBeliLaptop = document.getElementById("btnBeliLaptop");
const spesifikasiLaptop = document.getElementById("spesifikasiLaptop");
const alasanRekomendasi = document.getElementById("alasanRekomendasi");
const btnUbahPilihan = document.getElementById("btnUbahPilihan");

function formatRupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(nilai);
}

function tampilkanHasilRekomendasi() {
    const hasil = hitungRanking();
    const terbaik = hasil[0];

    const dataTerbaik = dataLaptop.find(
        (laptop) => laptop.nama === terbaik.nama
    );

    skorTerbaik.textContent = terbaik.skor.toFixed(4);
    namaLaptop.textContent = dataTerbaik.nama;
    const fotoLaptop = document.getElementById("fotoLaptop");

const gambarLaptop = {
  "Acer Aspire Lite 14": "image/acer.jpg",
  "ASUS Vivobook S14": "image/asus.jpg",
  "ADVAN Workmate": "image/advan.jpg",
  "HP EliteBook 8 G1i": "image/hp.jpg",
  "Lenovo ThinkPad T14 Gen 6": "image/lenovo.jpg"
};

fotoLaptop.src = gambarLaptop[dataTerbaik.nama] || "";
const linkPembelian = {
  "Acer Aspire Lite 14": "https://www.tokopedia.com/search?st=product&q=Acer%20Aspire%20Lite%2014",
  "ASUS Vivobook S14": "https://www.tokopedia.com/search?st=product&q=ASUS%20Vivobook%20S14",
  "ADVAN Workmate": "https://www.tokopedia.com/search?st=product&q=ADVAN%20Workmate",
  "HP EliteBook 8 G1i": "https://www.tokopedia.com/search?st=product&q=HP%20EliteBook%208%20G1i",
  "Lenovo ThinkPad T14 Gen 6": "https://www.tokopedia.com/search?st=product&q=Lenovo%20ThinkPad%20T14%20Gen%206"
};

btnBeliLaptop.href = linkPembelian[dataTerbaik.nama] || "https://www.tokopedia.com/";
    hargaLaptop.textContent = formatRupiah(dataTerbaik.harga);

    spesifikasiLaptop.innerHTML = `
        <div class="spec-item">
            <span>RAM</span>
            <strong>${dataTerbaik.ram} GB</strong>
        </div>
        <div class="spec-item">
            <span>Storage</span>
            <strong>${dataTerbaik.storage >= 1024
                ? `${dataTerbaik.storage / 1024} TB`
                : `${dataTerbaik.storage} GB`}</strong>
        </div>
        <div class="spec-item">
            <span>Skor Prosesor</span>
            <strong>${dataTerbaik.prosesor.toLocaleString("id-ID")}</strong>
        </div>
        <div class="spec-item">
            <span>Garansi</span>
            <strong>${dataTerbaik.garansi} tahun</strong>
        </div>
    `;

    alasanRekomendasi.textContent =
        `Laptop ini memperoleh skor SAW tertinggi, yaitu ${terbaik.skor.toFixed(4)}, ` +
        `berdasarkan bobot prioritas yang kamu tentukan.`;

    hasilRekomendasi.hidden = false;
    hasilRekomendasi.scrollIntoView({ behavior: "smooth" });
}

btnLanjut.addEventListener("click", () => {
    if (hitungTotal() !== TOTAL_MAKSIMAL) return;
    tampilkanHasilRekomendasi();
});

btnUbahPilihan.addEventListener("click", () => {
    hasilRekomendasi.hidden = true;
    document.querySelector(".panel").scrollIntoView({ behavior: "smooth" });
});



tampilkanKategori();


btnReset.addEventListener("click", () => {
  kategori.forEach((item) => {
    item.poin = 0;
  });

  tampilkanKategori();
});

