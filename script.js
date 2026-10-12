// SuaraRayon - logika aplikasi (React, sudah dikompilasi dari JSX)
const {
  useState,
  useEffect,
  useMemo
} = React;
const RUBRIKS = [{
  id: 'Isu Pendidikan',
  desc: 'Analisis & pemikiran seputar dinamika dunia pendidikan.'
}, {
  id: 'Kritik Sastra',
  desc: 'Ulasan kritis naskah, novel, puisi, dan karya sastra.'
}, {
  id: 'Cipta Karya',
  desc: 'Ruang ekspresi puisi, cerpen, esai reflektif & prosa.'
}, {
  id: 'Kebahasaan',
  desc: 'Kajian tata bahasa, wacana, dan perkembangan linguistik.'
}, {
  id: 'Seputar KOPRI',
  desc: 'Kajian kesetaraan, gender, pergerakan, dan dinamika KOPRI.'
}];
const HUE = {
  'Isu Pendidikan': 220,
  'Kritik Sastra': 265,
  'Cipta Karya': 35,
  'Kebahasaan': 160,
  'Seputar KOPRI': 330
};
const cover = (r, t) => {
  const h = HUE[r] || 220;
  const s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h},70%,22%)'/><stop offset='1' stop-color='hsl(${h + 40},75%,45%)'/></linearGradient></defs><rect width='800' height='400' fill='url(#g)'/><circle cx='660' cy='80' r='150' fill='#FACC15' opacity='.18'/><circle cx='120' cy='360' r='120' fill='#fff' opacity='.08'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(s);
};
const Avatar = ({
  name,
  size = 32,
  foto
}) => {
  if (foto) return /*#__PURE__*/React.createElement("img", {
    src: foto,
    alt: name,
    style: {
      width: size,
      height: size
    },
    className: "rounded-full object-cover shrink-0 border border-slate-300"
  });
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      background: `hsl(${h},55%,40%)`,
      fontSize: size * .4
    },
    className: "rounded-full text-white font-bold flex items-center justify-center shrink-0"
  }, name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase());
};
const INITIAL = [];
const load = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
};
const EMPTY = {
  penulis: '',
  foto: '',
  biodata: '',
  judul: '',
  rubrik: 'Isu Pendidikan',
  ringkasan: '',
  isi: '',
  sampul: ''
};
const inp = err => `w-full text-sm p-2.5 rounded-lg border ${err ? 'border-rose-500 bg-rose-50' : 'border-slate-300'} focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white`;
function App() {
  const [arts, setArts] = useState(() => load('suararayon_articles_v2', INITIAL));
  const [rub, setRub] = useState('Semua');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [write, setWrite] = useState(false);
  const [marks, setMarks] = useState(() => load('suararayon_bookmarks_v2', []));
  const [liked, setLiked] = useState({});
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [toast, setToast] = useState('');
  const showToast = m => {
    setToast(m);
    setTimeout(() => setToast(''), 3500);
  };
  useEffect(() => save('suararayon_articles_v2', arts), [arts]);
  useEffect(() => save('suararayon_bookmarks_v2', marks), [marks]);
  useEffect(() => {
    const h = e => {
      if (e.key === 'Escape') {
        setSel(null);
        setWrite(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  const list = useMemo(() => arts.filter(a => (rub === 'Semua' || a.rubrik === rub) && (!q.trim() || [a.judul, a.penulis, a.ringkasan].some(s => s.toLowerCase().includes(q.toLowerCase())))), [arts, rub, q]);
  const img = a => a.sampul || cover(a.rubrik);
  const upload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 2MB');
      return;
    }
    const r = new FileReader();
    r.onloadend = () => {
      setF(p => ({
        ...p,
        sampul: r.result
      }));
      showToast('Sampul berhasil diunggah');
    };
    r.readAsDataURL(file);
  };
  const uploadFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5MB');
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const n = 160,
          c = document.createElement('canvas');
        c.width = c.height = n;
        const m = Math.min(im.width, im.height);
        c.getContext('2d').drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, n, n);
        setF(p => ({
          ...p,
          foto: c.toDataURL('image/jpeg', .8)
        }));
        showToast('Foto penulis berhasil diunggah');
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  };
  const submit = e => {
    e.preventDefault();
    const er = {};
    if (!f.penulis.trim()) er.penulis = 'Nama penulis wajib diisi';
    if (!f.biodata.trim()) er.biodata = 'Biodata wajib diisi';
    if (!f.judul.trim()) er.judul = 'Judul wajib diisi';
    if (!f.isi.trim()) er.isi = 'Isi naskah tidak boleh kosong';
    if (Object.keys(er).length) {
      setErrs(er);
      return;
    }
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = f.isi.split(/\n\n+/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
    const words = f.isi.trim().split(/\s+/).length;
    const a = {
      id: Date.now().toString(),
      judul: f.judul,
      rubrik: f.rubrik,
      penulis: f.penulis,
      foto: f.foto,
      biodata: f.biodata,
      sampul: f.sampul,
      ringkasan: f.ringkasan || f.isi.substring(0, 120) + '...',
      isi: html,
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      suka: 0,
      waktuBaca: Math.max(1, Math.ceil(words / 150)) + ' min'
    };
    setArts([a, ...arts]);
    setWrite(false);
    setF(EMPTY);
    setErrs({});
    showToast('Naskah berhasil diterbitkan!');
  };
  const like = (id, e) => {
    e.stopPropagation();
    const l = liked[id];
    setLiked(p => ({
      ...p,
      [id]: !l
    }));
    setArts(p => p.map(a => a.id === id ? {
      ...a,
      suka: a.suka + (l ? -1 : 1)
    } : a));
    setSel(s => s && s.id === id ? {
      ...s,
      suka: s.suka + (l ? -1 : 1)
    } : s);
  };
  const mark = (id, e) => {
    e.stopPropagation();
    if (marks.includes(id)) {
      setMarks(marks.filter(b => b !== id));
      showToast('Naskah dihapus dari simpanan.');
    } else {
      setMarks([...marks, id]);
      showToast('Naskah disimpan.');
    }
  };
  const upd = k => e => setF({
    ...f,
    [k]: e.target.value
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col min-h-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-brand-yellow text-brand-blue font-semibold text-xs md:text-sm py-2 px-4 text-center flex items-center justify-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-brand-blue text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
  }, "Kirim Karya"), /*#__PURE__*/React.createElement("span", null, "Ruang Dialektika & Media Publikasi Rayon — terbuka untuk seluruh kader")), /*#__PURE__*/React.createElement("header", {
    className: "bg-brand-blue text-white sticky top-0 z-40 shadow-md"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between h-16 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 cursor-pointer",
    onClick: () => {
      setRub('Semua');
      setQ('');
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: 'assets/logo.png',
    alt: "Logo SuaraRayon",
    className: "h-12 w-auto bg-white rounded-lg p-1 shadow"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-black tracking-wider leading-none"
  }, "Suara", /*#__PURE__*/React.createElement("span", {
    className: "text-brand-yellow"
  }, "Rayon")), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-blue-200 tracking-widest uppercase"
  }, "Jurnal & Media Publikasi"))), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Cari naskah atau penulis...",
    className: "hidden md:block flex-1 max-w-md bg-blue-950/60 border border-blue-700 text-white placeholder-blue-300 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setWrite(true),
    className: "bg-brand-yellow hover:bg-brand-gold text-brand-blue font-bold text-sm px-4 py-2 rounded-xl shadow active:scale-95 transition"
  }, "Tulis Naskah")), /*#__PURE__*/React.createElement("div", {
    className: "pb-3 md:hidden"
  }, /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Cari naskah atau penulis...",
    className: "w-full bg-blue-950/70 border border-blue-700 text-white placeholder-blue-300 text-sm rounded-lg px-3 py-2"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bg-[#f3f0e8] border-b-4 border-brand-yellow"
  }, /*#__PURE__*/React.createElement("video", {
    src: 'assets/hero.mp4',
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    preload: "auto",
    className: "block w-full max-w-7xl mx-auto max-h-[70vh] object-cover",
    "aria-label": "Animasi logo SuaraRayon"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "bg-white border-b border-slate-200 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-3"
  }, ['Semua', ...RUBRIKS.map(r => r.id)].map(id => /*#__PURE__*/React.createElement("button", {
    key: id,
    onClick: () => setRub(id),
    className: `px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap border transition ${rub === id ? 'bg-brand-yellow text-brand-blue border-brand-gold font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'}`
  }, id === 'Semua' ? `Semua Rubrik (${arts.length})` : id)))), /*#__PURE__*/React.createElement("main", {
    className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-brand-blue"
  }, rub === 'Semua' ? 'Daftar Naskah Terbaru' : `Rubrik: ${rub}`), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 mt-1"
  }, rub === 'Semua' ? 'Seluruh tulisan karya kader dan kontributor SuaraRayon' : RUBRIKS.find(r => r.id === rub)?.desc)), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start"
  }, "Ditemukan: ", /*#__PURE__*/React.createElement("b", {
    className: "text-brand-blue"
  }, list.length), " naskah")), list.length ? /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  }, list.map(a => /*#__PURE__*/React.createElement("article", {
    key: a.id,
    onClick: () => setSel(a),
    className: "bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition flex flex-col cursor-pointer group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative h-44 overflow-hidden bg-slate-100"
  }, /*#__PURE__*/React.createElement("img", {
    src: img(a),
    alt: a.judul,
    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute top-3 left-3 bg-brand-blue/90 text-brand-yellow font-bold text-[11px] px-2.5 py-1 rounded-md"
  }, a.rubrik)), /*#__PURE__*/React.createElement("div", {
    className: "p-5 flex-1 flex flex-col justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-serif font-bold text-slate-900 text-lg group-hover:text-brand-mid leading-snug"
  }, a.judul), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-600 text-sm mt-2 leading-relaxed"
  }, a.ringkasan)), /*#__PURE__*/React.createElement("div", {
    className: "mt-5 pt-4 border-t border-slate-100 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: a.penulis,
    foto: a.foto
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-slate-800"
  }, a.penulis), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400"
  }, a.tanggal, " • ", a.waktuBaca))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 text-sm"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => like(a.id, e),
    title: "Sukai",
    className: "p-1.5 rounded-full hover:bg-slate-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold"
  }, liked[a.id] ? 'Disukai' : 'Suka', " · ", a.suka)), /*#__PURE__*/React.createElement("button", {
    onClick: e => mark(a.id, e),
    title: "Simpan",
    className: "p-1.5 rounded-full hover:bg-slate-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold"
  }, marks.includes(a.id) ? 'Tersimpan' : 'Simpan')))))))) : /*#__PURE__*/React.createElement("div", {
    className: "text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-brand-blue"
  }, "Belum Ada Naskah Dipublikasi"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 text-sm mt-1 max-w-md mx-auto"
  }, "Naskah untuk rubrik atau pencarian ini belum ditemukan. Jadilah penulis pertama!"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setWrite(true),
    className: "mt-4 bg-brand-blue text-brand-yellow font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-900"
  }, "Kirim Naskah Pertama"))), sel && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-2 sm:p-6",
    onClick: () => setSel(null)
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-brand-blue text-white p-4 px-6 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-brand-yellow text-brand-blue text-xs font-bold px-2.5 py-1 rounded-md uppercase"
  }, sel.rubrik), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => mark(sel.id, e),
    className: "p-2 rounded-lg hover:bg-blue-800"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-semibold"
  }, marks.includes(sel.id) ? 'Tersimpan' : 'Simpan')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(null),
    className: "px-3 rounded-lg hover:bg-blue-800 text-xl",
    title: "Tutup (ESC)"
  }, "Tutup"))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 sm:p-8 overflow-y-auto flex-1"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight mb-4"
  }, sel.judul), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: sel.penulis,
    size: 40,
    foto: sel.foto
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-bold"
  }, sel.penulis), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500"
  }, "Diterbitkan ", sel.tanggal, " • ", sel.waktuBaca, " baca"))), /*#__PURE__*/React.createElement("div", {
    className: "mb-6 rounded-xl overflow-hidden border border-slate-200 max-h-80"
  }, /*#__PURE__*/React.createElement("img", {
    src: img(sel),
    alt: "",
    className: "w-full h-full object-cover"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ab font-serif text-base sm:text-lg",
    dangerouslySetInnerHTML: {
      __html: sel.isi
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 p-5 bg-yellow-50 border-l-4 border-brand-gold rounded-r-xl flex items-start gap-4"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: sel.penulis,
    size: 56,
    foto: sel.foto
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold tracking-widest uppercase text-amber-600"
  }, "Tentang Penulis"), /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-brand-blue"
  }, sel.penulis), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-600 mt-1 italic"
  }, "\"", sel.biodata, "\"")))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => like(sel.id, e),
    className: `px-4 py-2 rounded-xl text-sm font-bold border ${liked[sel.id] ? 'bg-rose-50 text-rose-600 border-rose-300' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`
  }, sel.suka, " Apresiasi"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSel(null),
    className: "bg-brand-blue text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-blue-900"
  }, "Tutup Bacaan")))), write && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-brand-blue text-white p-5 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-lg leading-none"
  }, "Formulir Kirim Naskah"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-blue-200 mt-1"
  }, "SuaraRayon - Ruang Dialektika & Karya")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setWrite(false),
    className: "px-2 text-xl hover:bg-blue-800 rounded-lg"
  }, "Tutup")), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    className: "p-6 overflow-y-auto space-y-4 flex-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-bold text-brand-blue uppercase tracking-wider"
  }, "1. Identitas & Biodata Penulis"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Nama Lengkap Penulis *"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: f.penulis || '?',
    size: 48,
    foto: f.foto
  }), /*#__PURE__*/React.createElement("input", {
    value: f.penulis,
    onChange: upd('penulis'),
    placeholder: "Contoh: Sahabat Sahroni, S.Hum.",
    className: inp(errs.penulis)
  })), errs.penulis && /*#__PURE__*/React.createElement("p", {
    className: "text-rose-500 text-xs mt-1"
  }, errs.penulis), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mt-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-semibold bg-white border border-slate-300 hover:border-brand-blue rounded-lg px-3 py-1.5 cursor-pointer"
  }, "Unggah foto penulis", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: uploadFoto,
    className: "hidden"
  })), f.foto && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setF({
      ...f,
      foto: ''
    }),
    className: "text-xs text-rose-600 hover:underline"
  }, "Hapus foto"), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] text-slate-500"
  }, "Tampil di samping nama penulis."))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Biodata Singkat *"), /*#__PURE__*/React.createElement("textarea", {
    rows: "2",
    value: f.biodata,
    onChange: upd('biodata'),
    placeholder: "Contoh: Kader PMII Rayon Pembebasan, mahasiswa semester 6, pegiat literasi.",
    className: inp(errs.biodata)
  }), errs.biodata && /*#__PURE__*/React.createElement("p", {
    className: "text-rose-500 text-xs mt-1"
  }, errs.biodata), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-500 mt-1"
  }, "Ditampilkan di akhir tulisan Anda."))), /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-bold text-brand-blue uppercase tracking-wider pt-2"
  }, "2. Detail Naskah & Rubrik"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Rubrik *"), /*#__PURE__*/React.createElement("select", {
    value: f.rubrik,
    onChange: upd('rubrik'),
    className: inp()
  }, RUBRIKS.map(r => /*#__PURE__*/React.createElement("option", {
    key: r.id,
    value: r.id
  }, r.id)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Judul Naskah *"), /*#__PURE__*/React.createElement("input", {
    value: f.judul,
    onChange: upd('judul'),
    placeholder: "Judul yang menarik...",
    className: inp(errs.judul) + ' font-semibold'
  }), errs.judul && /*#__PURE__*/React.createElement("p", {
    className: "text-rose-500 text-xs mt-1"
  }, errs.judul)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Ringkasan (opsional)"), /*#__PURE__*/React.createElement("input", {
    value: f.ringkasan,
    onChange: upd('ringkasan'),
    placeholder: "Poin utama tulisan dalam 1-2 kalimat...",
    className: inp()
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Gambar Sampul ", /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 font-normal"
  }, "(opsional, maks 2MB)")), /*#__PURE__*/React.createElement("label", {
    className: "border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-xl p-3 flex flex-col items-center cursor-pointer bg-slate-50 text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold"
  }, "Unggah foto sampul"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: upload,
    className: "hidden"
  })), f.sampul && /*#__PURE__*/React.createElement("div", {
    className: "relative mt-2 rounded-xl overflow-hidden h-36 border border-slate-200"
  }, /*#__PURE__*/React.createElement("img", {
    src: f.sampul,
    alt: "Pratinjau",
    className: "w-full h-full object-cover"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setF({
      ...f,
      sampul: ''
    }),
    className: "absolute bottom-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white text-xs px-2.5 py-1 rounded-lg"
  }, "Hapus")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-500 mt-1"
  }, "Tanpa unggahan, sampul otomatis sesuai rubrik.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-xs font-semibold mb-1"
  }, "Isi Lengkap Naskah *"), /*#__PURE__*/React.createElement("textarea", {
    rows: "8",
    value: f.isi,
    onChange: upd('isi'),
    placeholder: "Tulis gagasan, esai, naskah sastra, atau kritik Anda. Enter ganda = paragraf baru.",
    className: inp(errs.isi) + ' leading-relaxed'
  }), errs.isi && /*#__PURE__*/React.createElement("p", {
    className: "text-rose-500 text-xs mt-1"
  }, errs.isi)), /*#__PURE__*/React.createElement("div", {
    className: "pt-4 border-t border-slate-200 flex justify-end gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setWrite(false),
    className: "px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100"
  }, "Batal"), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "bg-brand-yellow hover:bg-brand-gold text-brand-blue font-bold text-sm px-6 py-2.5 rounded-xl shadow"
  }, "Terbitkan Naskah"))))), toast && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-6 right-4 z-50 bg-brand-blue text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-brand-yellow text-sm font-semibold"
  }, toast), /*#__PURE__*/React.createElement("footer", {
    className: "bg-brand-blue text-white mt-16 border-t-4 border-brand-yellow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-4 sm:px-6 py-12"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2 space-y-3"
  }, /*#__PURE__*/React.createElement("img", {
    src: 'assets/logo.png',
    alt: "Logo SuaraRayon",
    className: "h-24 w-auto bg-white rounded-xl p-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xl font-bold tracking-wider"
  }, "Suara", /*#__PURE__*/React.createElement("span", {
    className: "text-brand-yellow"
  }, "Rayon")), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-300 text-sm leading-relaxed max-w-md"
  }, "Portal publikasi independen kader dan intelektual Rayon. Merawat nalar kritis, kebebasan ekspresi sastra, bahasa, dan kesetaraan gender.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-brand-yellow font-bold text-sm mb-3 uppercase tracking-wider"
  }, "Rubrik Karya"), /*#__PURE__*/React.createElement("ul", {
    className: "space-y-1.5 text-xs text-slate-300"
  }, RUBRIKS.map(r => /*#__PURE__*/React.createElement("li", {
    key: r.id
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setRub(r.id);
      window.scrollTo({
        top: 300,
        behavior: 'smooth'
      });
    },
    className: "hover:text-brand-yellow"
  }, "• ", r.id))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-brand-yellow font-bold text-sm mb-3 uppercase tracking-wider"
  }, "Semboyan"), /*#__PURE__*/React.createElement("blockquote", {
    className: "text-xs italic text-slate-300 border-l-2 border-brand-yellow pl-3"
  }, "\"Zikir, Fikir, dan Amal Sholeh — Dituangkan dalam Aksara dan Dialektika Intelektual.\""))), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 pt-6 border-t border-blue-900 text-center text-xs text-slate-400"
  }, "© ", new Date().getFullYear(), " SuaraRayon. Hak Cipta Dilindungi. Dikembangkan dengan Semangat Pergerakan."))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));