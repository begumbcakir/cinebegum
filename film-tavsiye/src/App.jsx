import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [filmler, setFilmler] = useState([]);
  const [kategori, setKategori] = useState('Avengers');
  const [seciliFilm, setSeciliFilm] = useState(null);

  const apiKey = "a8a20427"; 

  const kategoriler = [
    { isim: "Popüler", aramaKelimesi: "Avengers" },
    { isim: "Bilim Kurgu", aramaKelimesi: "Star" },
    { isim: "Korku", aramaKelimesi: "Scream" },
    { isim: "Aksiyon", aramaKelimesi: "Fast" },
    { isim: "Komedi", aramaKelimesi: "Scary" },
    { isim: "Animasyon", aramaKelimesi: "Toy" },
    { isim: "Fantastik", aramaKelimesi: "Lord" },
    { isim: "Dram", aramaKelimesi: "Life" }
  ];

  useEffect(() => {

    // OMDb API'den 1., 2. ve 3. sayfaları aynı anda (paralel) çekiyoruz
    const sayfa1 = fetch(`https://www.omdbapi.com/?s=${kategori}&page=1&apikey=${apiKey}`).then(res => res.json());
    const sayfa2 = fetch(`https://www.omdbapi.com/?s=${kategori}&page=2&apikey=${apiKey}`).then(res => res.json());
    const sayfa3 = fetch(`https://www.omdbapi.com/?s=${kategori}&page=3&apikey=${apiKey}`).then(res => res.json());

    // Tüm sayfalardan veri gelmesini bekle
    Promise.all([sayfa1, sayfa2, sayfa3])
      .then(sonuclar => {
        let tumFilmler = [];
        
        // Gelen her sayfanın içinde 'Search' (film listesi) varsa, onu genel listeye ekle
        sonuclar.forEach(veri => {
          if (veri.Search) {
            tumFilmler = [...tumFilmler, ...veri.Search];
          }
        });

        // Çift (aynı) filmleri temizlemek için filtreleme (Bazen API aynı filmi farklı sayfalarda verebiliyor)
        const benzersizFilmler = tumFilmler.filter((film, index, self) =>
          index === self.findIndex((t) => (t.imdbID === film.imdbID))
        );

        setFilmler(benzersizFilmler);
      })
      .catch(hata => console.error("Veri çekme hatası:", hata));

  }, [kategori]);

  const filmDetayGetir = (id) => {
    fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
      .then(cevap => cevap.json())
      .then(veri => setSeciliFilm(veri))
      .catch(hata => console.error("Detay çekme hatası:", hata));
  };

  const modalKapat = () => {
    setSeciliFilm(null);
  };

  return (
    <div className="sayfa-düzeni">
      <aside className="sol-menu">
        <h1>CineBegüm</h1>
        <div className="kategoriler">
          {kategoriler.map((kat, index) => (
            <button 
              key={index}
              className={kategori === kat.aramaKelimesi ? 'kategori-btn aktif' : 'kategori-btn'} 
              onClick={() => setKategori(kat.aramaKelimesi)}
            >
              {kat.isim}
            </button>
          ))}
        </div>
      </aside>

      <main>
        <section className="film-grid">
          {filmler.length > 0 ? (
            filmler.map((film, index) => (
              <article 
                key={index} 
                className="film-kart"
                onClick={() => filmDetayGetir(film.imdbID)}
              >
                <img 
                  src={film.Poster !== "N/A" ? film.Poster : "https://via.placeholder.com/300x450?text=Afiş+Yok"} 
                  alt={film.Title} 
                />
                <div>
                  <h2>{film.Title}</h2>
                  <p>Yıl: {film.Year}</p>
                </div>
              </article>
            ))
          ) : (
            <p style={{textAlign: "center", fontStyle: "italic", fontSize: "1.2rem", color: "#f4ebd0", width: "100%"}}>
              Filmler yükleniyor...
            </p>
          )}
        </section>

        {seciliFilm && (
          <div className="modal-arkaplan" onClick={modalKapat}>
            <div className="modal-icerik" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px'}}>
              <button className="kapat-btn" onClick={modalKapat}>X</button>
              
              <div className="modal-govde">
                <img 
                  src={seciliFilm.Poster !== "N/A" ? seciliFilm.Poster : "https://via.placeholder.com/300x450?text=Afiş+Yok"} 
                  alt={seciliFilm.Title} 
                />
                <div className="modal-bilgi">
                  <h2>{seciliFilm.Title} ({seciliFilm.Year})</h2>
                  <p className="imdb-puan">⭐ IMDb: {seciliFilm.imdbRating !== "N/A" ? seciliFilm.imdbRating : "Bilinmiyor"}</p>
                  <p><strong>Tür:</strong> {seciliFilm.Genre}</p>
                  <p><strong>Yönetmen:</strong> {seciliFilm.Director}</p>
                  <p><strong>Oyuncular:</strong> {seciliFilm.Actors}</p>
                  <p className="ozet"><strong>Özet:</strong> {seciliFilm.Plot !== "N/A" ? seciliFilm.Plot : "Özet bulunamadı."}</p>
                </div>
              </div>

              <div className="yorumlar-alani">
                <h3>İzleyici Yorumları</h3>
                
                <div className="yorum-kutusu">
                  <div className="yorum-baslik">
                    <span className="kullanici-adi">CineFil_99</span>
                    <span className="yorum-tarihi">12 Ekim 2026</span>
                  </div>
                  <p className="yorum-metni">"Görsel efektler ve senaryo gerçekten muazzamdı. Kesinlikle izlenmeli, bu yılın en iyilerinden biri!"</p>
                </div>

                <div className="yorum-kutusu">
                  <div className="yorum-baslik">
                    <span className="kullanici-adi">FilmGurmesi</span>
                    <span className="yorum-tarihi">10 Ekim 2026</span>
                  </div>
                  <p className="yorum-metni">"Başlangıç biraz yavaş olsa da son 40 dakika koltuğa çiviliyor. Oyunculuklar çok başarılı."</p>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;