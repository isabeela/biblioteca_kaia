const SUPABASE_URL =
  "https://rjrwdgbdeluiskmiojfi.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

let todosVideos = [];
let videosFiltrados = [];
let videoSelecionado = null;
let mapaTags = {};
let tomTagsVideo;
let paginaAtual = 0;
const videosPorPagina = 10;

async function carregarVideos() {
  const { data: videos, error } =
    await db.from("biblioteca").select("*");

  if (error) {
    console.error(error);
    return;
  }

  const { data: tags } =
    await db.from("tags").select("*");

  mapaTags = {};

  tags.forEach(tag => {
    mapaTags[tag.nome] = tag;
  });

  todosVideos = videos;
  videosFiltrados = videos;
  paginaAtual = 0;

  document.getElementById("gallery").innerHTML = "";
  renderizarMaisVideos();
}

function renderizarMaisVideos() {
  if (paginaAtual * videosPorPagina >= videosFiltrados.length) {
    return;
  }

  const gallery = document.getElementById("gallery");

  const inicio = paginaAtual * videosPorPagina;
  const fim = inicio + videosPorPagina;

  const videos = videosFiltrados.slice(inicio, fim);

  videos.forEach(video => {

    const tags = video.tags ? video.tags.split(",") : [];

    const tagsHtml = tags.map(nomeTag => {
      const tag = mapaTags[nomeTag.trim()];

      if (!tag) {
        return `<span class="tag">${nomeTag}</span>`;
      }

      return `
        <span class="tag" style="background:${tag.cor}; color:white;">
          ${tag.emoji || ""} ${tag.nome}
        </span>
      `;
    }).join("");

    gallery.innerHTML += `
      <div class="video-card">

        <div class="video-preview">
          <video muted loop autoplay playsinline preload="metadata">
            <source src="${video.url}" type="video/mp4">
          </video>
        </div>

        <div class="content">
          <h3>${video.nome || ""}</h3>
          <div class="descricao">${video.descricao || ""}</div>

          <div class="tags">
            ${tagsHtml}
          </div>
        </div>

        <div class="acoes">
          <button onclick="abrirModalTag(${video.id})">+</button>
          <button onclick="abrirEditar(${video.id})">✏️</button>
          <button onclick="deletarVideo(${video.id})">🗑️</button>
        </div>

      </div>
    `;
  });

  paginaAtual++;
}

window.addEventListener("scroll", () => {
  const chegouNoFim =
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 500;

  if (chegouNoFim) {
    renderizarMaisVideos();
  }
});

async function carregarSelectTags() {
  const { data } = await db
    .from("tags")
    .select("*")
    .order("nome");

  const select = document.getElementById("selectTag");

  select.innerHTML = `
    <option value="" disabled selected>
      Selecione uma tag
    </option>
  `;

  data.forEach(tag => {
    select.innerHTML += `
      <option value="${tag.nome}">
        ${tag.emoji || ""} ${tag.nome}
      </option>
    `;
  });
}

async function abrirModalTag(id) {
  videoSelecionado = id;

  const { data: video } = await db
    .from("biblioteca")
    .select("*")
    .eq("id", id)
    .single();

  const { data: tags } = await db
    .from("tags")
    .select("*")
    .order("nome");

  document.getElementById("tituloModalTag").innerText =
    `Adicionar tags: ${video.nome}`;

  const select = document.getElementById("selectTagsVideo");
  select.innerHTML = "";

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag.nome;
    option.textContent = `${tag.emoji || ""} ${tag.nome}`;
    select.appendChild(option);
  });

  // destrói instância anterior
  if (tomTagsVideo) {
    tomTagsVideo.destroy();
    tomTagsVideo = null;
  }

  // cria nova instância
  tomTagsVideo = new TomSelect("#selectTagsVideo", {
    plugins: ["remove_button"],
    create: false,
    persist: false
  });

  // garante string limpa
  const tagsAtuais = video.tags
    ? video.tags.split(",").filter(t => t.trim() !== "")
    : [];

  tomTagsVideo.setValue(tagsAtuais);

  document.getElementById("modalTag").classList.add("show");
}


async function carregarFiltroTags() {
  const { data, error } =
    await db.from("tags").select("*").order("nome");

  if (error) {
    console.error(error);
    return;
  }

  const select = document.getElementById("filtroTags");

  select.innerHTML = "";

  data.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag.nome;
    option.textContent = `${tag.emoji || ""} ${tag.nome}`;
    select.appendChild(option);
  });

  const ts = new TomSelect("#filtroTags", {
    plugins: ["remove_button"]
  });

  ts.on("change", aplicarFiltros);
}

function aplicarFiltros() {
  const texto = document.getElementById("searchInput").value.toLowerCase();

  const tomSelect = document.getElementById("filtroTags").tomselect;

  const tagsSelecionadas = tomSelect ? tomSelect.getValue() : [];

  videosFiltrados = todosVideos.filter(video => {

    const nome = (video.nome || "").toLowerCase();
    const descricao = (video.descricao || "").toLowerCase();

    const tagsVideo = video.tags ? video.tags.split(",") : [];

    const encontrouTexto =
      nome.includes(texto) ||
      descricao.includes(texto);

    const encontrouTags =
      tagsSelecionadas.length === 0 ||
      tagsSelecionadas.every(tag =>
        tagsVideo.includes(tag)
      );

    return encontrouTexto && encontrouTags;
  });

  paginaAtual = 0;
  document.getElementById("gallery").innerHTML = "";
  renderizarMaisVideos();
}

document.getElementById("searchInput")
  .addEventListener("input", aplicarFiltros);

async function adicionarTag() {

  if (!tomTagsVideo || !videoSelecionado) {
    console.log("estado inválido");
    return;
  }

  // 🔥 garante sincronização real
  const raw = tomTagsVideo.getValue();

  console.log("RAW:", raw);

  const tagsSelecionadas = Array.isArray(raw)
    ? raw
    : String(raw || "")
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

  console.log("NORMALIZADO:", tagsSelecionadas);

  const { error } = await db
    .from("biblioteca")
    .update({
      tags: tagsSelecionadas.join(",")
    })
    .eq("id", videoSelecionado);

  if (error) {
    console.log("ERRO:", error);
    return;
  }

  // document.getElementById("modalTag").classList.remove("show");

  videoSelecionado = null;

  carregarVideos();
}

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "saveTag") {
    adicionarTag();
  }
});

function fecharModalTag() {
  document.getElementById("modalTag").classList.remove("show");
}

carregarVideos();
carregarFiltroTags();