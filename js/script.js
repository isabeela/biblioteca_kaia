
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

/********* ENTRAR NO SISTEMA *********/


window.addEventListener("load", () => {

    const logado =
        sessionStorage.getItem("autenticado");

    if(!logado){

        document
        .getElementById("modalLogin")
        .classList.add("show");

    }

});

// const { data, error } = await supabase.auth.signInWithPassword({
//     email: "kaiabkps@gmail.com",
//     password: document.getElementById("senha").value
// });

// if (error) {
//     alert("Senha inválida");
// } else {
//     // entrou no sistema
//     console.log("Usuário autenticado");
// }
// Verifica se já existe login salvo
async function verificarSessao() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (data.session) {

        console.log("Usuário já logado");

        // fecha modal
        document.getElementById("modalLogin").style.display = "none";

        // libera sistema
        document.body.classList.add("logado");

    } else {

        console.log("Usuário precisa logar");

        // mostra modal
        document.getElementById("modalLogin").style.display = "flex";

    }

}

verificarSessao();


// Botão entrar
document.getElementById("btn-login").addEventListener("click", async () => {

    const senha = document.getElementById("senha").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: "kaiabkps@gmail.com",
        password: senha
    });


    if (error) {

        console.log(error.message);

        document.getElementById("erroLogin").style.display = "block";

    } else {

        console.log("Login realizado:", data);

        // fecha modal
        document.getElementById("modalLogin").style.display = "none";

        // libera sistema
        document.body.classList.add("logado");

    }

});

document
.getElementById("formLogin")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const senha =
        document.getElementById("senha").value;

    const { data, error } = await db
        .rpc("verificar_senha", {
            senha: senha
        });

    if(error){
        console.log(error);
        return;
    }

    if(data === true){

        sessionStorage.setItem(
            "autenticado",
            "true"
        );

        document
        .getElementById("modalLogin")
        .classList.remove("show");

        document
        .getElementById("erro")
        .style.display = "none";

    } else {

        document
        .getElementById("erro")
        .style.display = "block";
    }

});

window.addEventListener("load", () => {

    const logado =
        sessionStorage.getItem("autenticado");

    if(logado === "true"){
        document.querySelector("section").style.display = "none";
    } else {
        document.querySelector("section").style.display = "block";
    }

});




/****** BANCO DE DADOS  ******/
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

// VÍDEOS DO BANCO DE DADOS CARREGAM NA PÁGINA INICIAL //
async function carregarVideos() {
  const { data: videos, error } =
    await db.from("biblioteca").select("*").order("nome", { ascending: true });

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

// FAZ COM QUE CARREGUE 10 VIDEOS POR VEZ NA PÁGINA E ADICIONA O FRONT DO CARTÃOZINHO //

function renderizarMaisVideos() {
  console.log("Renderizando página:", paginaAtual);
  if (paginaAtual * videosPorPagina >= videosFiltrados.length) {
    return;
  }

  const gallery = document.getElementById("gallery");

  const inicio = paginaAtual * videosPorPagina;
  const fim = inicio + videosPorPagina;

  const videos = videosFiltrados.slice(inicio, fim);

 videos.forEach(video => {
    console.log(videos);
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

    gallery.insertAdjacentHTML("beforeend", `
        <div class="video-card">

            <div class="video-preview">
                <video
                    muted
                    loop
                    playsinline
                    preload="metadata"
                    data-src="${video.url}">
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
                <button onclick="abrirModalTag(${video.id})" title="Editar Tags">✏️</button>
                <button onclick="abrirEditar(${video.id})" title="Editar Descrição">📝</button>
                <button onclick="deletarVideo(${video.id})" title="Excluir Vídeo">🗑️</button>
            </div>

        </div>
    `);

    const card = gallery.lastElementChild;
    const videoElement = card.querySelector("video");

    card.addEventListener("mouseenter", () => {

        if (!videoElement.src) {
            videoElement.src = videoElement.dataset.src;
            videoElement.load();
        }

        videoElement.play().catch(() => {});

    });

    card.addEventListener("mouseleave", () => {

        videoElement.pause();

    });

});

  paginaAtual++;
}

// CARREGAMENTO NA BARRA DE ROLAGEM//
window.addEventListener("scroll", () => {
  const chegouNoFim =
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 500;

  if (chegouNoFim) {
    renderizarMaisVideos();
  }
});

// CARREGA AS TAGS PARA FILTRAR //
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

async function carregarTagsModal(tagsSelecionadas){

    const { data: tags } = await db
    .from("tags")
    .select("*")
    .order("nome");

    const select =
        document.getElementById("selectTagsVideo");

    select.innerHTML = "";

    tags.forEach(tag => {

        const option =
            document.createElement("option");

        option.value = tag.nome;
        option.textContent =
            `${tag.emoji || ""} ${tag.nome}`;

        select.appendChild(option);

    });

    if(tomTagsVideo){
        tomTagsVideo.destroy();
    }

    tomTagsVideo = new TomSelect("#selectTagsVideo",{

        plugins:["remove_button"],

        create:false,

        persist:false

    });

    tomTagsVideo.setValue(tagsSelecionadas);
}

function initFiltroTags() {
  const el = document.getElementById("filtroTags");

  // evita duplicar instância
  if (el.tomselect) {
    el.tomselect.destroy();
  }

  new TomSelect(el, {
    plugins: ["remove_button"],
    placeholder: "Selecione tags..."
  });
}

document.getElementById("searchInput")
  .addEventListener("input", aplicarFiltros);

carregarVideos();
carregarFiltroTags();


