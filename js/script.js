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
let mapaTags = {};
let paginaAtual = 0;
const videosPorPagina = 10;


async function carregarVideos() {

  // vídeos
  const { data: videos, error } = await db
    .from("biblioteca")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  // tags
  const { data: tags } = await db
    .from("tags")
    .select("*");

  mapaTags = {};

  tags.forEach(tag => {
    mapaTags[tag.nome] = tag;
  });

  // renderizarVideos(videos);

  todosVideos = videos;
  renderizarMaisVideos();
}

// function renderizarVideos(videos) {

//   const gallery =
//     document.getElementById("gallery");

//   gallery.innerHTML = "";

//   videos.forEach(video => {

//     const tags = video.tags
//       ? video.tags.split(",")
//       : [];

//     const tagsHtml = tags
//       .map(nomeTag => {

//         const tag =
//           mapaTags[nomeTag.trim()];

//         // caso a tag não exista mais
//         if (!tag) {

//           return `
//             <span class="tag">
//               ${nomeTag}
//             </span>
//           `;
//         }

//         return `
//           <span
//             class="tag"
//             style="
//               background:${tag.cor};
//               color:white;
//             "
//           >
//             ${tag.emoji || ""}
//             ${tag.nome}
//           </span>
//         `;

//       })
//       .join("");

//     gallery.innerHTML += `

//       <div class="video-card">

//         <div class="video-preview">

//           <video
//             autoplay
//             muted
//             loop
//             playsinline
//             preload="metadata">

//             <source
//               src="${video.url}"
//               type="video/mp4">

//           </video>

//         </div>

//         <div class="content">

//           <h3>${video.nome || ""}</h3>

//           <div class="descricao">
//             ${video.descricao || ""}
//           </div>

//           <div class="tags">
//             ${tagsHtml}
//           </div>

//         </div>

//       </div>

//     `;

//   });

// }


function renderizarMaisVideos() {

  if ( paginaAtual * videosPorPagina >= todosVideos.length) {
  return;
}


  const gallery =
    document.getElementById("gallery");

  const inicio =
    paginaAtual * videosPorPagina;

  const fim =
    inicio + videosPorPagina;

  const videos =
    todosVideos.slice(
      inicio,
      fim
    );

  videos.forEach(video => {

    const tags = video.tags
      ? video.tags.split(",")
      : [];

    const tagsHtml = tags
      .map(nomeTag => {

        const tag =
          mapaTags[nomeTag.trim()];

        if (!tag) {
          return `
            <span class="tag">
              ${nomeTag}
            </span>
          `;
        }

        return `
          <span
            class="tag"
            style="
              background:${tag.cor};
              color:white;
            "
          >
            ${tag.emoji || ""}
            ${tag.nome}
          </span>
        `;

      })
      .join("");

    gallery.innerHTML += `

      <div class="video-card">

        <div class="video-preview">

          <video
            muted
            loop
            autoplay
            playsinline
            preload="metadata">

            <source
              src="${video.url}"
              type="video/mp4">

          </video>

        </div>

        <div class="content">

          <h3>${video.nome || ""}</h3>

          <div class="descricao">
            ${video.descricao || ""}
          </div>

          <div class="tags">
            ${tagsHtml}
          </div>

        </div>

      </div>

    `;

  });

  paginaAtual++;
}

let carregandoMais = false;

window.addEventListener(
  "scroll",
  () => {

    const chegouNoFim =

      window.innerHeight +
      window.scrollY >=

      document.body.offsetHeight - 500;

    if (
      chegouNoFim &&
      !carregandoMais
    ) {

      renderizarMaisVideos();

    }

  }
);

carregarVideos();





async function carregarFiltroTags() {

    const { data } = await db
      .from("tags")
      .select("*")
      .order("nome");

    const select =
      document.getElementById("filtroTags");

    data.forEach(tag => {

        const option =
          document.createElement("option");

        option.value = tag.nome;

        option.textContent =
          `${tag.emoji || ""} ${tag.nome}`;

        option.dataset.color =
          tag.cor;

        select.appendChild(option);

    });

    new TomSelect(select,{
        plugins:["remove_button"]
    });

}

document
.getElementById("searchInput")
.addEventListener("input", aplicarFiltros);

document
.getElementById("filtroTags")
.addEventListener("change", aplicarFiltros);

function aplicarFiltros() {

    const texto =
      document
      .getElementById("searchInput")
      .value
      .toLowerCase();

    const select =
      document
      .getElementById("filtroTags");

    const tagsSelecionadas =
      Array.from(
        select.selectedOptions
      )
      .map(o => o.value);

    const filtrados =
      todosVideos.filter(video => {

        const encontrouTexto =

          (video.nome || "")
          .toLowerCase()
          .includes(texto)

          ||

          (video.descricao || "")
          .toLowerCase()
          .includes(texto);

        const tagsVideo =
          video.tags
          ? video.tags.split(",")
          : [];

        const encontrouTags =

          tagsSelecionadas.length === 0 ||

          tagsSelecionadas.every(tag =>
            tagsVideo.includes(tag)
          );

        return (
          encontrouTexto &&
          encontrouTags
        );

      });

    paginaAtual = 0;

    document
      .getElementById("gallery")
      .innerHTML = "";

    todosVideosFiltrados =
      filtrados;

    renderizarMaisVideos();

}