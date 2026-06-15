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
            playsinline
            preload="none">

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


const observer = new IntersectionObserver(

(entries) => {

  entries.forEach(entry => {

    const video =
      entry.target;

    if (entry.isIntersecting) {

      if (!video.srcLoaded) {

        video.srcLoaded = true;

        video.src =
          video.dataset.src;
      }

      video.play().catch(() => {});

    } else {

      video.pause();

    }

  });

},
{
  threshold: 0.25
}

);

carregarVideos();